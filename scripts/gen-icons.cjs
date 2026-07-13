/* eslint-disable @typescript-eslint/no-require-imports */
// PWA 아이콘 생성 스크립트 — 외부 이미지 라이브러리 없이 zlib만으로 PNG를 직접 인코딩한다.
// 실행 후에는 필요 없으므로 삭제해도 무방하다.
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const BRAND = [139, 92, 246]; // #8b5cf6
const WHITE = [255, 255, 255];

function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// size: 정사각형 한 변 픽셀. maskable: true면 safe-zone(반지름 40%) 안에만 링을 그린다.
function drawIcon(size, { maskable = false } = {}) {
  const px = new Uint8Array(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const outerR = maskable ? size * 0.34 : size * 0.38;
  const innerR = outerR * 0.55;
  const dotR = size * 0.06;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      let [r, g, b] = BRAND;
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);

      // 링(고리) — "루프"를 상징
      if (d <= outerR && d >= innerR) {
        [r, g, b] = WHITE;
      }
      // 링 우측 하단의 점 — 진행/완료를 상징
      const ddx = x - (cx + outerR * 0.72);
      const ddy = y - (cy + outerR * 0.72);
      if (Math.sqrt(ddx * ddx + ddy * ddy) <= dotR) {
        [r, g, b] = WHITE;
      }

      px[i] = r;
      px[i + 1] = g;
      px[i + 2] = b;
      px[i + 3] = 255;
    }
  }
  return px;
}

function encodePng(size, pixels) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    Buffer.from(pixels.buffer, y * size * 4, size * 4).copy(raw, y * (size * 4 + 1) + 1);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

function save(file, size, opts) {
  const png = encodePng(size, drawIcon(size, opts));
  fs.writeFileSync(file, png);
  console.log("wrote", file, png.length, "bytes");
}

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });
save(path.join(outDir, "icon-192.png"), 192, { maskable: false });
save(path.join(outDir, "icon-512.png"), 512, { maskable: false });
save(path.join(outDir, "maskable-512.png"), 512, { maskable: true });
save(path.join(outDir, "apple-touch-icon.png"), 180, { maskable: false });
