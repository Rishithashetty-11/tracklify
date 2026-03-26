const Project = require("../models/project");
const User = require("../models/user");

exports.createProject = async (req, res) => {
  try {
    const { projectTitle, description, hourlyRate, clientId } = req.body;
    if (!projectTitle) return res.status(400).json({ message: "projectTitle is required" });
    
    // Client id is required per instructions, use fallback if not provided
    const finalClientId = clientId || req.user.id;
    const finalFreelancerId = req.user.id;
    
    const project = await Project.create({ 
      projectTitle, 
      description, 
      hourlyRate, 
      clientId: finalClientId, 
      freelancerId: finalFreelancerId 
    });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Error creating project", error: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ freelancerId: req.user.id });
    console.log("Returned Projects for user:", req.user.id, projects);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Error fetching projects", error: err.message });
  }
};

exports.acceptProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, freelancerId: req.user.id },
      { status: "active" },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: "Project not found or unauthorized" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Error accepting project", error: err.message });
  }
};

exports.rejectProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, freelancerId: req.user.id },
      { status: "rejected" },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: "Project not found or unauthorized" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Error rejecting project", error: err.message });
  }
};

exports.getFreelancerProjects = async (req, res) => {
  try {
    const projects = await Project.find({ freelancerId: req.user.id, status: { $in: ["active", "pending"] } })
      .populate('clientId', 'email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Error fetching freelancer projects", error: err.message });
  }
};

exports.getFreelancerActiveProjects = async (req, res) => {
  try {
    const projects = await Project.find({ freelancerId: req.user.id, status: "active" })
      .populate('clientId', 'email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Error fetching active projects", error: err.message });
  }
};

exports.getClientProjects = async (req, res) => {
  try {
    const projects = await Project.find({ clientId: req.user.id, status: { $in: ["active", "pending"] } })
      .populate('freelancerId', 'email skills bio')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Error fetching client projects", error: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, freelancerId: req.user.id });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting project", error: err.message });
  }
};