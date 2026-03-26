const router = require("express").Router();
const projectController = require("../controllers/projectController");
const auth = require("../middleware/auth");

router.post("/projects", auth, projectController.createProject); // Legacy route
router.get("/projects", auth, projectController.getProjects); // Legacy route

router.patch("/project/:id/accept", auth, projectController.acceptProject);
router.patch("/project/:id/reject", auth, projectController.rejectProject);
router.get("/project/freelancer/projects", auth, projectController.getFreelancerProjects);
router.get("/freelancer/projects", auth, projectController.getFreelancerActiveProjects);
router.get("/project/client/projects", auth, projectController.getClientProjects);
router.delete("/projects/:id", auth, projectController.deleteProject);

module.exports = router;