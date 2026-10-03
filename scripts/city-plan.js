// Draws a top-down city plan (PNG) from a binary STL: the highest surface at each
// point, shaded by height and outlined. Prints the image size and the model-to-pixel
// transform used to place map markers.
// Usage: node scripts/city-plan.js <model.stl> <out.png> [width]
const fs = require('fs'), zlib = require('zlib');
const [, , stlPath, outPath, widthArg] = process.argv;
const b = fs.readFileSync(stlPath);
const n = b.readUInt32LE(80);
const tri = new Float32Array(n * 9);
let mn = [Infinity, Infinity], mx = [-Infinity, -Infinity];
for (let i = 0; i < n; i++) for (let k = 0; k < 9; k++) {
  const v = b.readFloatLE(84 + i * 50 + 12 + k * 4); tri[i * 9 + k] = v;
  if (k % 3 < 2) { mn[k % 3] = Math.min(mn[k % 3], v); mx[k % 3] = Math.max(mx[k % 3], v); }
}
const pad = 0.02 * (mx[0] - mn[0]);
mn = [mn[0] - pad, mn[1] - pad]; mx = [mx[0] + pad, mx[1] + pad];
const W = +widthArg || 2400, s = W / (mx[0] - mn[0]), H = Math.round((mx[1] - mn[1]) * s);
const Z = new Float32Array(W * H).fill(-Infinity);
for (let i = 0; i < n; i++) {
  const p = [0, 1, 2].map((v) => [(tri[i * 9 + v * 3] - mn[0]) * s, (mx[1] - tri[i * 9 + v * 3 + 1]) * s, tri[i * 9 + v * 3 + 2]]);
  const x0 = Math.max(0, Math.floor(Math.min(p[0][0], p[1][0], p[2][0]))), x1 = Math.min(W - 1, Math.ceil(Math.max(p[0][0], p[1][0], p[2][0])));
  const y0 = Math.max(0, Math.floor(Math.min(p[0][1], p[1][1], p[2][1]))), y1 = Math.min(H - 1, Math.ceil(Math.max(p[0][1], p[1][1], p[2][1])));
  const d = (p[1][1] - p[2][1]) * (p[0][0] - p[2][0]) + (p[2][0] - p[1][0]) * (p[0][1] - p[2][1]);
  if (Math.abs(d) < 1e-9) continue; // vertical face: seen edge-on from above
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const px = x + 0.5, py = y + 0.5;
    const a = ((p[1][1] - p[2][1]) * (px - p[2][0]) + (p[2][0] - p[1][0]) * (py - p[2][1])) / d;
    const c = ((p[2][1] - p[0][1]) * (px - p[2][0]) + (p[0][0] - p[2][0]) * (py - p[2][1])) / d;
    const e = 1 - a - c;
    if (a < -1e-6 || c < -1e-6 || e < -1e-6) continue;
    const z = a * p[0][2] + c * p[1][2] + e * p[2][2];
    if (z > Z[y * W + x]) Z[y * W + x] = z;
  }
}
let zmax = 0; for (const v of Z) if (v > zmax) zmax = v;
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const PAPER = hex('#ffffff'), GROUND = hex('#f1f0eb'), LOW = hex('#e2e0d9'), HIGH = hex('#6d6b65'), INK = hex('#17171a'), RULE = hex('#a9a79f');
const mix = (A, B, t) => A.map((v, i) => Math.round(v + (B[i] - v) * t));
const px = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) {
  px[y * (W * 3 + 1)] = 0;
  for (let x = 0; x < W; x++) {
    const z = Z[y * W + x];
    let col = PAPER;
    if (Number.isFinite(z)) col = z <= 1 ? GROUND : mix(LOW, HIGH, Math.sqrt(Math.min(1, (z - 1) / (zmax - 1))));
    // outline wherever the surface steps up or down
    let edge = 0;
    if (Number.isFinite(z) || x > 0) for (const [dx, dy] of [[1, 0], [0, 1]]) {
      const xx = x + dx, yy = y + dy; if (xx >= W || yy >= H) continue;
      const z2 = Z[yy * W + xx];
      const a = Number.isFinite(z) ? z : -10, c = Number.isFinite(z2) ? z2 : -10;
      const step = Math.abs(a - c);
      if (Math.max(a, c) > 1 && step > 0.6) edge = 2;
      else if (Math.max(a, c) > 0.05 && step > 0.08 && edge < 1) edge = 1;
    }
    if (edge === 2) col = INK; else if (edge === 1) col = RULE;
    px.set(col, y * (W * 3 + 1) + 1 + x * 3);
  }
}
const crc = (buf) => { let c, t = []; for (let n2 = 0; n2 < 256; n2++) { c = n2; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n2] = c >>> 0; } let r = 0xffffffff; for (const v of buf) r = t[(r ^ v) & 255] ^ (r >>> 8); return (r ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
fs.writeFileSync(outPath, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(px, { level: 9 })), chunk('IEND', Buffer.alloc(0))]));
console.log(JSON.stringify({ width: W, height: H, minX: mn[0], minY: mn[1], maxX: mx[0], maxY: mx[1], scale: s, zmax }));
