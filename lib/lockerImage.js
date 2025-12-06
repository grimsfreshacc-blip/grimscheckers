import { createCanvas, loadImage } from "canvas";

export async function makeLockerImage(cosmeticUrls = []) {
  const perRow = 6;
  const size = 128;
  const rows = Math.ceil(cosmeticUrls.length / perRow);
  const canvas = createCanvas(perRow * size, rows * size);
  const ctx = canvas.getContext("2d');

  ctx.fillStyle = '#0f1720';
  ctx.fillRect(0,0,canvas.width, canvas.height);

  for (let i=0; i<cosmeticUrls.length; i++){
    const x = (i % perRow) * size;
    const y = Math.floor(i / perRow) * size;
    try {
      const img = await loadImage(cosmeticUrls[i]);
      ctx.drawImage(img, x, y, size, size);
    } catch(e) {
      // skip broken images
    }
  }
  return canvas.toBuffer('image/png');
}
