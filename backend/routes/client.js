const router = require("express").Router();
const clientController = require("../controllers/clientController");

const auth = require("../middleware/auth");

router.get("/client/invoices", auth, clientController.getClientInvoices);
router.post("/create-order", auth, clientController.createOrder);
router.post("/verify-payment", auth, clientController.verifyPayment);

router.get("/client/freelancers", auth, clientController.getClientFreelancers);

router.get("/freelancers", auth, clientController.getAllFreelancers);
router.post("/hire", auth, clientController.hireFreelancer);

module.exports = router;
