onClick={(event) => { 
  event.stopPropagation(); 
  if(confirm("Delete karein?")) {
    deleteMember(member.memberId);
    window.location.reload(); // Is se delete hote hi page automatic refresh ho jayega aur glitch nahi hoga
  }
}}
