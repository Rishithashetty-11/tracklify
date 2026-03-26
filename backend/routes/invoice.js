const router = require("express").Router();
const invoiceController = require("../controllers/invoiceController");
const auth = require("../middleware/auth");

router.get("/invoice/:id/download", invoiceController.downloadInvoice);
router.post("/create-invoice", auth, invoiceController.createInvoice);
router.get("/client/invoices", auth, invoiceController.getClientInvoices);
router.get("/freelancer/invoices", auth, invoiceController.getFreelancerInvoices);

module.exports = router;