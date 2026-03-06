import { PDFDocument, degrees } from '@cantoo/pdf-lib';

export type PdfWorkerMessage =
    | {
        type: 'MERGE';
        payload: {
            files: {
                buffer: ArrayBuffer;
                allPages?: boolean;
                pages: { pageNum: number; rotation: number }[];
            }[];
        };
    }
    | {
        type: 'PROTECT';
        payload: {
            buffer: ArrayBuffer;
            password: string;
        };
    };

export type PdfWorkerResponse =
    | { type: 'SUCCESS'; payload: { buffer: Uint8Array } }
    | { type: 'ERROR'; payload: { error: string } };

self.onmessage = async (e: MessageEvent<PdfWorkerMessage>) => {
    try {
        const { type, payload } = e.data;

        if (type === 'MERGE') {
            const mergedPdf = await PDFDocument.create();

            for (const fileData of payload.files) {
                const pdf = await PDFDocument.load(fileData.buffer, { ignoreEncryption: true } as any);

                if (fileData.allPages || fileData.pages.length === 0) {
                    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                    copiedPages.forEach(page => mergedPdf.addPage(page));
                    continue;
                }

                const indicesToCopy = fileData.pages.map(p => p.pageNum - 1);
                const copiedPages = await mergedPdf.copyPages(pdf, indicesToCopy);

                copiedPages.forEach((page, index) => {
                    const meta = fileData.pages[index];
                    if (meta.rotation !== 0) {
                        const currentRotation = page.getRotation().angle;
                        page.setRotation(degrees(currentRotation + meta.rotation));
                    }
                    mergedPdf.addPage(page);
                });
            }

            if (mergedPdf.getPageCount() === 0) {
                throw new Error("Cannot merge. All pages have been deleted.");
            }

            const pdfBytes = await mergedPdf.save({ useObjectStreams: false });
            self.postMessage({ type: 'SUCCESS', payload: { buffer: pdfBytes } });
        }
        else if (type === 'PROTECT') {
            const pdfDoc = await PDFDocument.load(payload.buffer);

            pdfDoc.encrypt({
                userPassword: payload.password,
                ownerPassword: payload.password,
                permissions: {
                    printing: "highResolution",
                    modifying: false,
                    copying: false,
                    annotating: false,
                    fillingForms: false,
                    contentAccessibility: false,
                    documentAssembly: false,
                },
            });

            const pdfBytes = await pdfDoc.save();
            self.postMessage({ type: 'SUCCESS', payload: { buffer: pdfBytes } });
        }

    } catch (error: any) {
        self.postMessage({ type: 'ERROR', payload: { error: error.message || "Unknown worker error" } });
    }
};
