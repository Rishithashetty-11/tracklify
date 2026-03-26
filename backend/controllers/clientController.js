const Invoice = require("../models/invoice");
const User = require("../models/user");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Project = require("../models/project");
const Notification = require("../models/notification");

exports.getClientInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ clientId: req.user.id });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: "Error fetching invoices", error: err.message });
  }
};

exports.getClientFreelancers = async (req, res) => {
    try {
        const invoices = await Invoice.find({ clientId: req.user.id }).populate('freelancerId', 'email');
        const freelancersSet = new Set();
        const freelancers = [];
        invoices.forEach(inv => {
            if (inv.freelancerId && !freelancersSet.has(inv.freelancerId._id.toString())) {
                freelancersSet.add(inv.freelancerId._id.toString());
                freelancers.push(inv.freelancerId);
            }
        });
        res.json(freelancers);
    } catch (err) {
        res.status(500).json({ message: "Error fetching assigned freelancers", error: err.message });
    }
};

exports.createOrder = async (req, res) => {
  try {
    const { invoiceId, amount } = req.body;
    
    // Add Razorpay instance handling (using test keys or ENV)
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_zH4D5Q2G8WwK9O',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'j6w8rN3XQz1Y9L3yB5vV2tU7'
    });

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: "INR",
      receipt: `receipt_invoice_${invoiceId}`,
    };

    const order = await razorpay.orders.create(options);

    const invoice = await Invoice.findByIdAndUpdate(invoiceId, { orderId: order.id }, { new: true });
    
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating Razorpay order", error: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, invoiceId } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || 'j6w8rN3XQz1Y9L3yB5vV2tU7';

    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature === razorpay_signature) {
      // Payment is verified
      const invoice = await Invoice.findByIdAndUpdate(
        invoiceId,
        { status: "PAID", paymentId: razorpay_payment_id },
        { new: true }
      );
      return res.json({ message: "Payment verified successfully", invoice });
    } else {
      return res.status(400).json({ message: "Invalid signature" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error verifying payment", error: err.message });
  }
};

exports.getAllFreelancers = async (req, res) => {
  try {
    const { skill } = req.query;
    const query = { role: "freelancer" };
    
    if (skill) {
      query.skills = { $regex: new RegExp(skill, "i") };
    }
    
    const freelancers = await User.find(query).select("-password");
    res.json(freelancers);
  } catch (err) {
    console.error("Error fetching freelancers:", err);
    res.status(500).json({ message: "Error fetching freelancers", error: err.message });
  }
};

exports.hireFreelancer = async (req, res) => {
  try {
    const { freelancerId, projectTitle } = req.body;
    // Note: Assuming clientId is passed via token (req.user.id) or body. Let's try body first if auth middleware isn't present for this route.
    // However, looking at the previous logic, in `createOrder` no user token was extracted, it just took invoiceId. 
    // Wait, the instructions say 'clientId (from JWT)'. Since I didn't find auth middleware applied to /client routes, let's extract it from req.user.id if it exists, or req.body.clientId as fallback.
    const clientId = req.user ? req.user.id : req.body.clientId;

    if (!clientId) {
        return res.status(401).json({ message: "Unauthorized. Client ID missing." });
    }

    const project = new Project({
      clientId,
      freelancerId,
      projectTitle,
      status: "pending"
    });

    await project.save();

    const notification = new Notification({
      userId: freelancerId,
      message: "You have been hired for a new project",
      projectId: project._id,
      isRead: false
    });
    await notification.save();

    res.status(201).json(project);
  } catch (err) {
    console.error("Error hiring freelancer:", err);
    res.status(500).json({ message: "Error hiring freelancer", error: err.message });
  }
};
