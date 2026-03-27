import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const targetDir = path.join(__dirname, '../public/models/background-removal');

const files = [
  'isnet.onnx',
  'isnet_fp16.onnx',
  'ort-wasm-simd.wasm',
  'ort-wasm.wasm'
];

const baseUrl = 'https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@1.7.0/dist/';

async function download() {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  console.log(`Downloading models to ${targetDir}...`);

  for (const file of files) {
    const url = `${baseUrl}${file}`;
    const targetPath = path.join(targetDir, file);

    if (fs.existsSync(targetPath)) {
      console.log(`[SKIPPED] ${file} already exists.`);
      continue;
    }

    console.log(`[DOWNLOADING] ${file}...`);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
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
