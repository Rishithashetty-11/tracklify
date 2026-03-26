const mongoose = require("mongoose");
const User = require("./models/user");

mongoose.connect("mongodb://127.0.0.1:27017/freelancer").then(async () => {
  console.log("Connected to MongoDB for seeding...");
  
  const freelancers = [
    {
      email: "alice.freelancer@example.com",
      password: "password123", /* Assuming simple password auth for now */
      role: "freelancer",
      skills: ["React", "Node.js", "MongoDB", "JavaScript"],
      bio: "Full stack MERN developer with 5 years of experience building modern web applications."
    },
    {
      email: "bob.designer@example.com",
      password: "password123",
      role: "freelancer",
      skills: ["UI/UX", "Figma", "Tailwind CSS", "React"],
      bio: "Creative UI/UX designer and frontend developer specializing in responsive interfaces."
    },
    {
      email: "charlie.backend@example.com",
      password: "password123",
      role: "freelancer",
      skills: ["Python", "Django", "PostgreSQL", "AWS"],
      bio: "Backend specialist focused on scalable APIs and cloud infrastructure."
    },
    {
      email: "diana.mobile@example.com",
      password: "password123",
      role: "freelancer",
      skills: ["React Native", "iOS", "Android", "TypeScript"],
      bio: "Mobile app developer creating cross-platform apps using React Native."
    }
  ];

  for (const f of freelancers) {
    // Check if exists to avoid duplicates if run multiple times
    const existingUser = await User.findOne({ email: f.email });
    if (!existingUser) {
      await User.create(f);
      console.log(`Created freelancer: ${f.email}`);
    } else {
      existingUser.skills = f.skills;
      existingUser.bio = f.bio;
      await existingUser.save();
      console.log(`Updated freelancer: ${f.email}`);
    }
  }

  console.log("Seeding complete!");
  mongoose.connection.close();
}).catch(err => {
  console.error("Seeding error:", err);
});
