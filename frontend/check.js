const mongoose = require("mongoose");
const Project = require("./backend/models/project");

mongoose.connect("mongodb://127.0.0.1:27017/freelancer").then(async () => {
    // Delete legacy projects without correct rates
    await Project.deleteOne({ _id: "69c4c9f1430fb29f7bac90a8" });
    await Project.deleteOne({ _id: "69c525ad2292f05c70534e68" });
    
    // Set the correctly formed 100/hr project to active
    await Project.updateOne(
       { _id: "69c526312292f05c70534e82" },
       { $set: { status: "active" } }
    );
    
    console.log("Database cleaned and state rectified!");
    process.exit(0);
});
