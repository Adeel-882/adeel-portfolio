const fs = require('node:fs');
const sharp = require('sharp');
(async () => {
  fs.mkdirSync('work/project-review', { recursive: true });
  for (const [i, dir] of fs.readdirSync('Projects').entries()) {
    const files = fs.readdirSync(`Projects/${dir}`).filter(f => f.endsWith('.png')).sort((a,b) => parseInt(a)-parseInt(b));
    const layers = [];
    for (const [j, file] of files.entries()) {
      layers.push({ input: await sharp(`Projects/${dir}/${file}`).resize(400,250,{fit:'contain',background:'#ddd'}).png().toBuffer(),left:j%3*400,top:Math.floor(j/3)*275 });
      layers.push({ input:Buffer.from(`<svg width="400" height="25"><rect width="400" height="25" fill="white"/><text x="10" y="18" font-size="15">${dir} / ${file}</text></svg>`),left:j%3*400,top:Math.floor(j/3)*275+250 });
    }
    await sharp({create:{width:1200,height:Math.ceil(files.length/3)*275,channels:3,background:'#fff'}}).composite(layers).png().toFile(`work/project-review/${i}.png`);
    console.log(i,dir,files.length);
  }
})();
