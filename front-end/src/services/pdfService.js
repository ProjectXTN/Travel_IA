import html2pdf from "html2pdf.js";

/**
 * Exports a given DOM element to a PDF file.
 * @param {string} elementId - The ID of the HTML element to export.
 * @param {string} fileName - The desired name of the downloaded PDF file.
 */
export const exportPDF = (elementId = "trip-plan", fileName = "travel-itinerary.pdf") => {
  const element = document.getElementById(elementId);

  if (!element) {
    console.error(`Element with ID '${elementId}' not found.`);
    return;
  }

  const options = {
    margin:       0.5,
    filename:     fileName,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, backgroundColor: "#ffffff" },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(options).from(element).save();
};
