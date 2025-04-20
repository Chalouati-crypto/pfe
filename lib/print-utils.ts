import type React from "react";
import { toast } from "sonner";

/**
 * Enhanced print function with better error handling
 * @param printRef React ref to the element to print
 * @param documentTitle Title for the printed document
 */
export const printDocument = (
  printRef: React.RefObject<HTMLElement>,
  documentTitle: string
) => {
  if (!printRef.current) {
    toast.error("Erreur: Impossible d'imprimer le document");
    console.error("Print ref is null");
    return;
  }

  try {
    // Add print-content class to the element for print styles
    printRef.current.classList.add("print-content");

    // Open print dialog
    window.print();

    // Remove print-content class after printing
    setTimeout(() => {
      if (printRef.current) {
        printRef.current.classList.remove("print-content");
      }
    }, 500);
  } catch (error) {
    console.error("Print error:", error);
    toast.error("Erreur d'impression. Veuillez réessayer.");
  }
};

/**
 * Alternative method to generate PDF using html2canvas and jsPDF
 * This can be used as a fallback if react-to-print doesn't work
 */
export const generatePDF = async (
  printRef: React.RefObject<HTMLElement>,
  documentTitle: string
) => {
  if (!printRef.current) {
    toast.error("Erreur: Impossible de générer le PDF");
    console.error("Print ref is null");
    return;
  }

  try {
    // Show loading toast
    toast.loading("Génération du PDF en cours...");

    // Dynamically import the libraries to reduce bundle size
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    // Capture the element as canvas
    const canvas = await html2canvas(printRef.current, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
    });

    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const heightLeft = imgHeight;

    // Create PDF
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      0,
      imgWidth,
      imgHeight
    );

    // Save the PDF
    pdf.save(`${documentTitle || "document"}.pdf`);

    // Show success toast
    toast.dismiss();
    toast.success("PDF généré avec succès");
  } catch (error) {
    console.error("PDF generation error:", error);
    toast.dismiss();
    toast.error("Erreur lors de la génération du PDF. Veuillez réessayer.");
  }
};
