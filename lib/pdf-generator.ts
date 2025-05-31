import PDFDocument from "pdfkit";

export const generateArticlePdf = async (article: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers: any[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    // Customize your PDF content
    doc.fontSize(25).text(article.title, { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Owner: ${article.ownerEmail}`);
    doc.text(`Taxe Calculated: ${article.taxe}€`);
    // Add more article details

    doc.end();
  });
};
