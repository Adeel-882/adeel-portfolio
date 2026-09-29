// Remove the supplied blue presentation margins, then optimize the actual UI.
// Originals stay untouched in Projects/; versioned names avoid stale image caches.
const fs = require('node:fs');
const sharp = require('sharp');
const sources = {
  'company-dashboard': ['Dashboard for Company', [1, 2, 3, 4, 5, 6, 7]],
  'gym-app': ['GYM app', [1, 2, 3, 4, 5, 6]],
  'information-mail': ['Information Mail', [1, 2]],
  'mgc-sales-assistant': ['MGC Sales Assistant', [1, 2]],
  'personalization': ['Personalization', [1, 2]],
  'client-portal': ['Portal', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]],
  'leadsedge-voice-workflow': ['Voice workflow for Leadsedge', [1, 2, 3, 4, 5]],
};
(async () => {
  let bytes = 0;
  const requested = process.argv.slice(2);
  const selected = Object.entries(sources).filter(([slug]) => !requested.length || requested.includes(slug));
  for (const [slug, [folder, frames]] of selected) {
    const output = `public/projects/${slug}`;
    fs.mkdirSync(output, { recursive: true });
    for (const frame of frames) {
      const input = `Projects/${folder}/${frame}.png`;
      const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const background = data.subarray(0, 3);
      let left = info.width, top = info.height, right = 0, bottom = 0;
      for (let y = 0; y < info.height; y++) {
        for (let x = 0; x < info.width; x++) {
          const i = (y * info.width + x) * info.channels;
          const difference = Math.max(...background.map((value, channel) => Math.abs(data[i + channel] - value)));
          if (difference < 35) continue;
          left = Math.min(left, x); right = Math.max(right, x);
          top = Math.min(top, y); bottom = Math.max(bottom, y);
        }
      }
      if (right <= left || bottom <= top) throw new Error(`No screenshot found: ${input}`);
      const cropped = await sharp(input)
        .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
        .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      // Clear only blue pixels connected to the outer edge, including rounded
      // corner leftovers. Blue controls inside the actual interface are preserved.
      const { width, height } = cropped.info;
      const visited = new Uint8Array(width * height);
      const queue = new Uint32Array(width * height);
      let head = 0, tail = 0;
      const enqueue = (pixel) => {
        if (visited[pixel]) return;
        visited[pixel] = 1;
        const i = pixel * 4;
        if (Math.max(...background.map((value, channel) => Math.abs(cropped.data[i + channel] - value))) >= 35) return;
        queue[tail++] = pixel;
        cropped.data[i + 3] = 0;
      };
      for (let x = 0; x < width; x++) { enqueue(x); enqueue((height - 1) * width + x); }
      for (let y = 0; y < height; y++) { enqueue(y * width); enqueue(y * width + width - 1); }
      while (head < tail) {
        const pixel = queue[head++], x = pixel % width, y = Math.floor(pixel / width);
        if (x > 0) enqueue(pixel - 1);
        if (x < width - 1) enqueue(pixel + 1);
        if (y > 0) enqueue(pixel - width);
        if (y < height - 1) enqueue(pixel + width);
      }
      const result = await sharp(cropped.data, { raw: { width, height, channels: 4 } })
        .resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 88 }).toFile(`${output}/${frame}-focus.webp`);
      console.log(`${slug}/${frame}: ${info.width}×${info.height} → ${result.width}×${result.height}`);
      bytes += result.size;
    }
  }
  console.log(`Prepared ${selected.length} projects; ${Math.round(bytes / 1024)} KB total.`);
})();
