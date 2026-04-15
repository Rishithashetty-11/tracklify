import jsPDF from 'jspdf';

export const generateInvoicePDF = (invoiceData) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(28);
  doc.setTextColor(37, 99, 235); // Primary blue
  doc.text('INVOICE', 105, 25, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(156, 163, 175); // Gray 400
  doc.text(`Date: ${invoiceData.date || new Date().toLocaleDateString()}`, 190, 20, { align: 'right' });
  doc.text(`INV-${invoiceData.id || Math.floor(Math.random()*10000).toString().padStart(4, '0')}`, 190, 26, { align: 'right' });

  // Bill To Details
  doc.setFontSize(12);
  doc.setTextColor(17, 24, 39); // Gray 900
  doc.setFont(undefined, 'bold');
  doc.text('Billed To:', 20, 50);
  doc.setFont(undefined, 'normal');
  doc.text(invoiceData.client || 'Valued Client', 20, 60);
  doc.text(`Project: ${invoiceData.project || invoiceData.title || 'Professional Services'}`, 20, 68);

  // Table Header Background
  doc.setFillColor(249, 250, 251); // Gray 50
  doc.rect(20, 85, 170, 12, 'F');
  
  // Table Header Text
  doc.setFont(undefined, 'bold');
  doc.text('Description', 25, 93);
  doc.text('Hours', 105, 93);
  doc.text('Rate', 140, 93);
  doc.text('Amount', 185, 93, { align: 'right' });

  // Format Helper
  const extractNum = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    return Number(val.replace(/[^0-9.-]+/g,""));
  };
  const hours = invoiceData.hours || 0;
  const rate = extractNum(invoiceData.rate);
  const total = extractNum(invoiceData.total || invoiceData.budget);

  // Table Row
  doc.setFont(undefined, 'normal');
  doc.text('Freelance Services / Development', 25, 110);
  doc.text(hours.toString(), 105, 110);
  doc.text(`$${rate}/hr`, 140, 110);
  doc.text(`$${total.toLocaleString()}`, 185, 110, { align: 'right' });

  // Separation Line
  doc.setDrawColor(229, 231, 235); // Gray 200
  doc.line(20, 120, 190, 120);

  // Total Section
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(17, 24, 39);
  doc.text('Total Due:', 135, 135);
  doc.setTextColor(37, 99, 235); // Primary blue
  doc.text(`$${total.toLocaleString()}`, 185, 135, { align: 'right' });

  // Footer Message
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(156, 163, 175);
  doc.text('Thank you for your business!', 105, 270, { align: 'center' });

  // Save the PDF
  doc.save(`Invoice_${invoiceData.id || 'New'}.pdf`);
};
