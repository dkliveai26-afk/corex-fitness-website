import { TrainerProfilePage } from "@/components/trainers/trainer-profile-page";
import { getTrainerBySlug, trainers } from "@/components/trainers/trainer-data";

export function generateStaticParams() {
  return trainers.map((trainer) => ({
    slug: trainer.slug
  }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trainer = getTrainerBySlug(slug) || trainers[0];

  return <TrainerProfilePage requestedSlug={slug} trainer={trainer} />;
}
