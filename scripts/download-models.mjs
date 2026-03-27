import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetDir = path.join(__dirname, '../public/models/background-removal');

const files = [
  'isnet.onnx',
  'isnet_fp16.onnx',
  'isnet_quint8.onnx',
  'ort-wasm-simd.wasm',
  'ort-wasm.wasm'
];

// Using version 1.4.5 which is the latest confirmed on npm/CDNs
const baseUrl = 'https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@1.4.5/dist/';

async function download() {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  console.log(`Downloading models to ${targetDir}...`);

  for (const file of files) {
    const url = `${baseUrl}${file}`;
    const targetPath = path.join(targetDir, file);

    console.log(`[DOWNLOADING] ${file}...`);
    try {
      const response = await fetch(url);
      if (!response.ok) {
         if (response.status === 404) {
             console.warn(`[SKIP] ${file} not found on CDN (HTTP 404).`);
             continue;
         }
         throw new Error(`HTTP ${response.status}`);
      }
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(targetPath, Buffer.from(buffer));
      console.log(`[SUCCESS] ${file} saved.`);
    } catch (err) {
      console.error(`[ERROR] Failed to download ${file}:`, err.message);
    }
  }

  console.log('Download complete.');
}

download();
