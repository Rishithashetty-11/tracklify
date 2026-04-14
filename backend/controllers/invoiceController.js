const Project = require("../models/project");
const TimeLog = require("../models/timeLog");
const Invoice = require("../models/invoice");
const PDFDocument = require("pdfkit");

exports.downloadInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.id;

    // ✅ get invoice
    const invoice = await Invoice.findById(invoiceId).populate('projectId');

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const project = invoice.projectId;
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 🧾 CREATE PDF
    const doc = new PDFDocument();

    // headers for download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${invoiceId}.pdf`
    );

    doc.on("error", (pdfErr) => {
      console.error("PDF error:", pdfErr);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error generating invoice PDF" });
      }
    });

    doc.pipe(res);

    // 🧾 PDF DESIGN
    doc.fontSize(22).text("INVOICE", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Project: ${project.projectTitle || project.title || 'Unknown'}`);
    doc.text(`Description: ${project.description || 'No description provided'}`);
    doc.moveDown();

    doc.text(`Hourly Rate: ₹${Number(invoice.hourlyRate || 0).toFixed(2)}`);
    doc.text(`Total Hours: ${Number(invoice.totalHours || 0).toFixed(2)}`);
    doc.text(`Total Amount: ₹${Number(invoice.totalAmount || 0).toFixed(2)}`);

    doc.moveDown();
    doc.text("Thank you for your business!", { align: "center" });

    doc.end();

  } catch (err) {
    console.log(err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Error generating invoice PDF" });
    }
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const { projectId, hours, rate, amount, clientEmail } = req.body;
    
    // Auto attach clientId from project
    const project = await Project.findById(projectId).populate('clientId');
    if (!project) return res.status(404).json({ message: "Project not found" });

    let finalClientId = project.clientId ? project.clientId._id : null;
    let finalClientEmail = project.clientId ? project.clientId.email : null;

    if (clientEmail) {
      const User = require("../models/user");
      const client = await User.findOne({ email: clientEmail, role: 'client' });
      if (client) {
         finalClientId = client._id;
         finalClientEmail = client.email;
      } else {
         finalClientEmail = clientEmail;
      }
    }

    const freelancerId = req.user.id;

    const invoice = await Invoice.create({
      projectId,
      clientId: finalClientId,
      clientEmail: finalClientEmail,
      freelancerId,
      totalHours: hours,
      hourlyRate: rate,
      totalAmount: amount,
      status: "UNPAID"
    });

    if (finalClientId) {
      const Notification = require("../models/notification");
      await Notification.create({
        userId: finalClientId,
        message: `You have received a new invoice. Total Amount: $${amount}`,
        projectId,
        type: "INVOICE_GENERATED"
      });
    }

    res.status(201).json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating invoice", error: err.message });
  }
};

exports.getClientInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ clientId: req.user.id })
      .populate('projectId', 'title')
      .populate('freelancerId', 'email')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) { 
    res.status(500).json({ message: "Error fetching", error: err.message }); 
  }
};

exports.getFreelancerInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ freelancerId: req.user.id })
      .populate('projectId', 'title')
      .populate('clientId', 'email')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) { 
    res.status(500).json({ message: "Error fetching", error: err.message }); 
  }
};