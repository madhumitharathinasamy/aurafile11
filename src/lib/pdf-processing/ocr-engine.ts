import Tesseract from 'tesseract.js';

export async function performOcr(imageBlob: Blob): Promise<string> {
    const { data: { text } } = await Tesseract.recognize(
        imageBlob,
        'eng',
        {
            logger: m => console.log(m) // Optional: hook up to progress callback
        }
    );
    return text;
}

export async function convertPdfPageToImage(pdfPage: any): Promise<Blob> {
    const viewport = pdfPage.getViewport({ scale: 2.0 }); // 2x scale for better OCR
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (!context) throw new Error("Canvas context failed");

    await pdfPage.render({ canvasContext: context, viewport: viewport }).promise;

    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Canvas to Blob failed"));
        }, 'image/png');
    });
}
