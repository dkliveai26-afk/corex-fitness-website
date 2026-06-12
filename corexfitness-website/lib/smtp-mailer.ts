import net from "node:net";
import tls from "node:tls";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

export function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  const port = Number(process.env.SMTP_PORT || "587");

  if (!host || !user || !pass || !from || !port) return null;

  return {
    from,
    host,
    pass,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    user
  };
}

export async function sendSmtpEmail(config: SmtpConfig, message: EmailMessage) {
  const socket = await connect(config);

  try {
    await readResponse(socket);
    await command(socket, `EHLO ${config.host}`);

    if (!config.secure) {
      await command(socket, "STARTTLS");
      const secureSocket = tls.connect({ socket, servername: config.host });
      await new Promise<void>((resolve, reject) => {
        secureSocket.once("secureConnect", resolve);
        secureSocket.once("error", reject);
      });
      await command(secureSocket, `EHLO ${config.host}`);
      await authenticate(secureSocket, config);
      await sendMessage(secureSocket, config.from, message);
      await command(secureSocket, "QUIT", false);
      secureSocket.end();
      return;
    }

    await authenticate(socket, config);
    await sendMessage(socket, config.from, message);
    await command(socket, "QUIT", false);
  } finally {
    socket.end();
  }
}

function connect(config: SmtpConfig): Promise<net.Socket> {
  return new Promise((resolve, reject) => {
    const socket = config.secure
      ? tls.connect({ host: config.host, port: config.port, servername: config.host })
      : net.connect({ host: config.host, port: config.port });

    socket.setTimeout(15000);
    socket.once(config.secure ? "secureConnect" : "connect", () => resolve(socket));
    socket.once("error", reject);
    socket.once("timeout", () => reject(new Error("SMTP connection timed out")));
  });
}

async function authenticate(socket: net.Socket, config: SmtpConfig) {
  await command(socket, "AUTH LOGIN");
  await command(socket, Buffer.from(config.user).toString("base64"));
  await command(socket, Buffer.from(config.pass).toString("base64"));
}

async function sendMessage(socket: net.Socket, from: string, message: EmailMessage) {
  await command(socket, `MAIL FROM:<${from}>`);
  await command(socket, `RCPT TO:<${message.to}>`);
  await command(socket, "DATA", false);
  await write(
    socket,
    [
      `From: ${from}`,
      `To: ${message.to}`,
      `Subject: ${message.subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "",
      message.text,
      "."
    ].join("\r\n")
  );
  await readResponse(socket);
}

async function command(socket: net.Socket, value: string, expectSuccess = true) {
  await write(socket, `${value}\r\n`);
  const response = await readResponse(socket);

  if (expectSuccess && !/^[23]/.test(response)) {
    throw new Error(`SMTP command failed: ${response}`);
  }

  return response;
}

function write(socket: net.Socket, value: string) {
  return new Promise<void>((resolve, reject) => {
    socket.write(value, (error) => (error ? reject(error) : resolve()));
  });
}

function readResponse(socket: net.Socket) {
  return new Promise<string>((resolve, reject) => {
    let buffer = "";

    function cleanup() {
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("timeout", onTimeout);
    }

    function onData(chunk: Buffer) {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const lastLine = lines[lines.length - 1] || "";

      if (/^\d{3}\s/.test(lastLine)) {
        cleanup();
        resolve(buffer.trim());
      }
    }

    function onError(error: Error) {
      cleanup();
      reject(error);
    }

    function onTimeout() {
      cleanup();
      reject(new Error("SMTP response timed out"));
    }

    socket.on("data", onData);
    socket.once("error", onError);
    socket.once("timeout", onTimeout);
  });
}
