import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;

export interface PdfPageInfo {
  pageNumber: number;
  totalPages: number;
}

/**
 * Load a PDF file and return info about it
 */
export async function getPdfInfo(file: File): Promise<{ totalPages: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  return { totalPages: pdf.numPages };
}

/**
 * Render a specific page of a PDF to a base64 PNG image
 */
export async function renderPdfPageToImage(
  file: File,
  pageNumber: number,
  scale: number = 2.0
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  if (pageNumber < 1 || pageNumber > pdf.numPages) {
    throw new Error(`Invalid page number. PDF has ${pdf.numPages} pages.`);
  }
  
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  
  // Create canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    throw new Error('Could not get canvas context');
  }
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  // Render page
  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;
  
  // Convert to base64
  const dataUrl = canvas.toDataURL('image/png');
  
  // Clean up
  canvas.remove();
  
  return dataUrl;
}

/**
 * Extract base64 data from a data URL
 */
export function extractBase64FromDataUrl(dataUrl: string): string {
  const parts = dataUrl.split(',');
  if (parts.length !== 2) {
    throw new Error('Invalid data URL format');
  }
  return parts[1];
}
