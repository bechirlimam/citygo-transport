const PDFDocument = require('pdfkit');
const fs = require('fs');
async function createInvoicePDF(reservation) {
  const doc = new PDFDocument({ size: 'A4' });
  const filename = `/tmp/invoice_${reservation.id}.pdf`;
  const stream = fs.createWriteStream(filename);
  doc.pipe(stream);
  doc.fontSize(20).text('FACTURE - CityGo Transport', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Réservation: ${reservation.id}`);
  doc.text(`Client: ${reservation.customerName || 'N/A'}`);
  doc.text(`Prise en charge: ${reservation.pickup}`);
  doc.text(`Destination: ${reservation.dropoff}`);
  doc.text(`Distance: ${reservation.distanceKm || 'N/A'} km`);
  doc.text(`Montant: ${reservation.estimatedFare || 'N/A'} €`);
  doc.end();
  return new Promise((resolve, reject) => {
    stream.on('finish', ()=> resolve(filename));
    stream.on('error', reject);
  });
}
module.exports = { createInvoicePDF };
