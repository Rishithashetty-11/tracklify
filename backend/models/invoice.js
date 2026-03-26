const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  projectId: mongoose.Schema.Types.ObjectId,
  clientId: mongoose.Schema.Types.ObjectId,
  clientEmail: String,
  freelancerId: mongoose.Schema.Types.ObjectId,
  totalHours: Number,
  hourlyRate: Number,
  totalAmount: Number,
  status: { type: String, enum: ['UNPAID', 'PAID'], default: 'UNPAID' },
  orderId: String,
  paymentId: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Invoice", invoiceSchema);