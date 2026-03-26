const mongoose = require("mongoose");
const Project = require("../models/project");
const User = require("../models/user");
require("dotenv").config();

async function migrateProjects() {
  try {
    // Connect to database
    await mongoose.connect("mongodb://127.0.0.1:27017/freelancer");
    console.log("MongoDB Connected");

    // Get a default freelancer ID to assign if missing
    // We will find any user to use as fallback freelancer, or if empty, skip.
    const defaultFreelancer = await User.findOne({ role: 'freelancer' }) || await User.findOne();
    const defaultFreelancerId = defaultFreelancer ? defaultFreelancer._id : null;

    if (!defaultFreelancerId) {
      console.warn("No users found in database to use as default freelancer. Missing freelancerIds might cause issues.");
    } else {
      console.log(`Using user ${defaultFreelancerId} as default freelancer fallback`);
    }

    // Fetch all projects using lenient query to see raw documents
    const projects = await mongoose.connection.db.collection('projects').find({}).toArray();
    console.log(`Found ${projects.length} projects to process`);

    let updatedCount = 0;

    for (const project of projects) {
      const updates = {};
      const unsets = {};
      
      // Convert name or title to projectTitle
      if (!project.projectTitle) {
        if (project.name) {
          updates.projectTitle = project.name;
        } else if (project.title) {
          updates.projectTitle = project.title;
        } else {
          updates.projectTitle = "Untitled Project";
        }
      }

      // Remove inconsistent fields
      if (project.name) unsets.name = 1;
      if (project.title) unsets.title = 1;

      // Ensure freelancerId exists
      if (!project.freelancerId && defaultFreelancerId) {
        updates.freelancerId = defaultFreelancerId;
      }

      if (Object.keys(updates).length > 0 || Object.keys(unsets).length > 0) {
        const updateDoc = {};
        if (Object.keys(updates).length > 0) updateDoc.$set = updates;
        if (Object.keys(unsets).length > 0) updateDoc.$unset = unsets;

        await mongoose.connection.db.collection('projects').updateOne(
          { _id: project._id },
          updateDoc
        );
        updatedCount++;
        console.log(`Migrated project ${project._id} with title: ${updates.projectTitle || project.projectTitle}`);
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} projects.`);
    process.exit(0);

  } catch (err) {
    console.error("Migration error:", err);
    process.exit(1);
  }
}

migrateProjects();
