const Razorpay = require("razorpay");
const crypto = require("crypto");
const Invoice = require("../models/invoice");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret',
});

exports.createOrder = async (req, res) => {
  try {
    const { invoiceId } = req.body;
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    if (String(invoice.clientId) !== req.user.id) {
       return res.status(403).json({ message: "Unauthorized to pay this invoice" });
    }
    if (invoice.status === "PAID") {
       return res.status(400).json({ message: "Invoice is already paid" });
    }

    const order = await razorpay.orders.create({
      // Razorpay expects amount in smallest currency unit (paise)
      amount: Math.round(invoice.totalAmount * 100), 
      currency: "INR",
      receipt: "receipt_" + invoiceId,
    });

    invoice.orderId = order.id;
    await invoice.save();

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating order", error: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'mock_secret')
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      const invoice = await Invoice.findOne({ orderId: razorpay_order_id });
      if (invoice) {
        invoice.status = "PAID";
        invoice.paymentId = razorpay_payment_id;
        await invoice.save();
      }
      return res.json({ success: true });
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error verifying payment", error: err.message });
  }
};
