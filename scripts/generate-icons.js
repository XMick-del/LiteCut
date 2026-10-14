import fs from 'node:fs';
import zlib from 'node:zlib';

function createPng(width, height, r, g, b) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(buf) {
    let c = 0xffffffff;
    for (let n = 0; n < buf.length; n++) {
      c ^= buf[n];
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const checksum = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(checksum, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(2, 9); // color type (truecolor RGB)
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  const ihdrChunk = chunk('IHDR', ihdr);

  // Raw image data with scanline filter 0
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter none
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 3;
      // create a subtle border and center symbol
      const isEdge = x < 4 || x >= width - 4 || y < 4 || y >= height - 4;
      const isCenter = Math.abs(x - width / 2) < width * 0.25 && Math.abs(y - height / 2) < height * 0.25;
      if (isEdge) {
        rawData[pxOffset] = 0x2a;
        rawData[pxOffset + 1] = 0x2a;
        rawData[pxOffset + 2] = 0x32;
      } else if (isCenter) {
        rawData[pxOffset] = 0x00;
        rawData[pxOffset + 1] = 0xf2;
        rawData[pxOffset + 2] = 0xfe; // CapCut cyan
      } else {
        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = chunk('IDAT', compressed);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

fs.writeFileSync('public/pwa-192x192.png', createPng(192, 192, 24, 24, 28));
fs.writeFileSync('public/pwa-512x512.png', createPng(512, 512, 24, 24, 28));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPng(512, 512, 18, 18, 20));
fs.writeFileSync('public/apple-touch-icon.png', createPng(180, 180, 24, 24, 28));
console.log('PWA icons created successfully');
