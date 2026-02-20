import * as pdfjsLib from "pdfjs-dist";
import { Document, Packer, Paragraph, TextRun, SectionType } from "docx";
import { convertPdfPageToImage, performOcr } from "./ocr-engine";

// Ensure worker is set (redundant but safe)
if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

interface ConversionOptions {
    useOcr: boolean;
    onProgress: (progress: number) => void;
}

export async function convertPdfToDocx(file: File, options: ConversionOptions): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument(arrayBuffer);
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    const docChildren: Paragraph[] = [];

    for (let i = 1; i <= numPages; i++) {
        // Report progress: pages done / total
        const progressPercent = Math.round(((i - 1) / numPages) * 100);
        options.onProgress(progressPercent);

        const page = await pdf.getPage(i);

        let pageText = "";

        if (options.useOcr) {
            // OCR Mode
            const imageBlob = await convertPdfPageToImage(page);
            pageText = await performOcr(imageBlob);
        } else {
            // Text Extraction Mode
            const textContent = await page.getTextContent();

            // Simple Extraction Strategy: Join items. 
            // Phase 2 will improve this with coordinate sorting for paragraphs.
            const items = textContent.items as any[];

            // Basic sort by Y (top to bottom) then X (left to right) if needed, 
            // but pdf.js usually gives them in reasonable order or stream order.
            // Let's just join them with spaces for MVP.
            pageText = items.map(item => item.str).join(" ");
        }

        // Add page break if not first page
        const children: TextRun[] = [];
        if (i > 1) {
            // We can use a page break in the first paragraph/run of the new page
            children.push(new TextRun({ break: 1, text: "" }));
        }

        // Split text by newlines (OCR returns newlines)
        const lines = pageText.split('\n');

        lines.forEach(line => {
            if (line.trim().length > 0) {
                docChildren.push(new Paragraph({
                    children: [
                        new TextRun(line)
                    ]
                }));
            }
        });
    }

    options.onProgress(90); // Formatting

    // Create Document
    const doc = new Document({
        sections: [{
            properties: {},
            children: docChildren,
        }],
    });

    const blob = await Packer.toBlob(doc);
    options.onProgress(100);
    return blob;
}
