export const trainers = [
  {
    slug: "aarav-singh",
    name: "Aarav Singh",
    specialization: "Bodybuilding",
    experience: "7+ Years",
    certifications: ["ISSA Certified Fitness Trainer", "Advanced Hypertrophy Coaching"],
    skills: ["Muscle Building", "Strength Progression", "Contest Prep", "Form Correction"],
    expertise: ["Weight Training", "Fat Loss", "Nutrition Guidance", "Personal Coaching"],
    membersTrained: "850+",
    certificationCount: "2",
    description: "Helps members build size, symmetry, and disciplined strength routines.",
    intro:
      "Aarav has 7+ years of experience in bodybuilding and strength development. He has helped hundreds of members build muscle, improve training discipline, and reach stronger physique goals.",
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=85"
  },
  {
    slug: "maya-kapoor",
    name: "Maya Kapoor",
    specialization: "Weight Loss",
    experience: "6+ Years",
    certifications: ["ACE Weight Management Specialist", "Functional Training Coach"],
    skills: ["Fat Loss", "HIIT", "Mobility", "Habit Coaching"],
    expertise: ["Weight Training", "Fat Loss", "Nutrition Guidance", "Personal Coaching"],
    membersTrained: "700+",
    certificationCount: "2",
    description: "Creates sustainable fat-loss programs with smart conditioning and accountability.",
    intro:
      "Maya has 6+ years of experience helping members lose weight with practical workouts and realistic lifestyle changes. Her coaching blends conditioning, mobility, and accountability.",
    image:
      "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?auto=format&fit=crop&w=1200&q=85"
  },
  {
    slug: "rohan-mehta",
    name: "Rohan Mehta",
    specialization: "Strength Training",
    experience: "8+ Years",
    certifications: ["NSCA Strength Coach", "Powerlifting Technique Specialist"],
    skills: ["Powerlifting", "Compound Lifts", "Strength Programming", "Injury Prevention"],
    expertise: ["Weight Training", "Fat Loss", "Nutrition Guidance", "Personal Coaching"],
    membersTrained: "950+",
    certificationCount: "2",
    description: "Coaches compound lifts, progressive overload, and safe performance technique.",
    intro:
      "Rohan has 8+ years of experience in strength training and performance coaching. He helps members lift safely, build measurable strength, and master their technique.",
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=85"
  },
  {
    slug: "neha-sharma",
    name: "Neha Sharma",
    specialization: "Cardio",
    experience: "5+ Years",
    certifications: ["Certified Cardio Fitness Instructor", "Group Training Specialist"],
    skills: ["Endurance", "HIIT Circuits", "Heart Health", "Stamina Building"],
    expertise: ["Weight Training", "Fat Loss", "Nutrition Guidance", "Personal Coaching"],
    membersTrained: "620+",
    certificationCount: "2",
    description: "Builds endurance-focused sessions for stamina, heart health, and energy.",
    intro:
      "Neha has 5+ years of experience in cardio conditioning and group fitness. She helps members improve stamina, burn fat, and train with energy.",
    image:
      "https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1200&q=85"
  },
  {
    slug: "kabir-malhotra",
    name: "Kabir Malhotra",
    specialization: "Nutrition",
    experience: "6+ Years",
    certifications: ["Precision Nutrition Coach", "Sports Nutrition Advisor"],
    skills: ["Meal Planning", "Recovery Nutrition", "Body Composition", "Supplement Guidance"],
    expertise: ["Weight Training", "Fat Loss", "Nutrition Guidance", "Personal Coaching"],
    membersTrained: "760+",
    certificationCount: "2",
    description: "Guides practical meal planning to support strength, recovery, and body goals.",
    intro:
      "Kabir has 6+ years of experience in nutrition coaching. He helps members align food, recovery, and training so their results become easier to sustain.",
    image:
      "https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=1200&q=85"
  },
  {
    slug: "ishita-rao",
    name: "Ishita Rao",
    specialization: "Personal Training",
    experience: "9+ Years",
    certifications: ["NASM Certified Personal Trainer", "Corrective Exercise Specialist"],
    skills: ["One-to-One Coaching", "Movement Screening", "Goal Tracking", "Lifestyle Fitness"],
    expertise: ["Weight Training", "Fat Loss", "Nutrition Guidance", "Personal Coaching"],
    membersTrained: "1,100+",
    certificationCount: "2",
    description: "Designs one-to-one plans with focused coaching and measurable progress tracking.",
    intro:
      "Ishita has 9+ years of experience in personal training and corrective exercise. She creates focused, measurable plans for members who want premium one-to-one support.",
    image:
      "https://images.unsplash.com/photo-1609899464726-209befaac5bc?auto=format&fit=crop&w=1200&q=85"
  }
];

export type Trainer = (typeof trainers)[number];

export function getTrainerBySlug(slug: string) {
  return trainers.find((trainer) => trainer.slug === slug);
}
