const fs = require('fs');

function renderPixelArt(ascii, palette, pixelSize = 4) {
  const h = ascii.length;
  const w = ascii[0].length;
  let rects = "";
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const char = ascii[y][x];
      if (char !== ' ' && palette[char]) {
        rects += `<rect x="${x * pixelSize}" y="${y * pixelSize}" width="${pixelSize}" height="${pixelSize}" fill="${palette[char]}"/>`;
      }
    }
  }
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w * pixelSize} ${h * pixelSize}'>${rects}</svg>`;
}

const pGlasses = [
  "   w         w   ",
  " b               ",
  "bbbbbbbbbbbbbbbb ",
  "bbbbbbbbbbbbbbbbb",
  "bb b bbbb  b bbbb",
  "bb b bbbb  b bbbb",
  "b  b  bb   b  bb ",
  "   b       b     ",
  "                 ",
  "           b     "
];

const pNerd = [
  "bbbbbbbbbbbbbbbbbbbbbbbbb",
  "bbbbbbbbbbbbbbbbbbbbbbbbb",
  "bbbb                bbbbb",
  "bbbb                bbbbb",
  "bbbb  w             bbbbb",
  "bbbb                bbbbb",
  "bbbb                bbbbb",
  "bbbb                bbbbb",
  "bbbbbbbbbbbbbbbbbbbbbbbbb"
];
// Actually nerd is just 2 squares connected. Let's make it more accurate to the photo.
const nerdAscii = [
  "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "bbb      bbbbbbbbbb      bbb", // wait, ascii art takes too long to get perfect.
];

// Let's just output raw SVGs directly with <path> for pixel perfection, it's easier to write standard paths.
const newAssets = `export const AR_ASSETS = {
  pixelGlasses: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='-10 -10 170 80' shape-rendering='crispEdges'><path fill='black' d='M0,10 h150 v15 h-10 v10 h-10 v10 h-20 v-10 h-20 v-25 h-30 v25 h-20 v10 h-20 v-10 h-10 v-10 h-10 z'/><rect x='20' y='15' width='5' height='5' fill='white'/><rect x='25' y='20' width='5' height='5' fill='white'/><rect x='30' y='25' width='5' height='5' fill='white'/><rect x='95' y='15' width='5' height='5' fill='white'/><rect x='100' y='20' width='5' height='5' fill='white'/><rect x='105' y='25' width='5' height='5' fill='white'/><path fill='black' d='M-5,-5 h5 v-5 h5 v5 h5 v5 h-5 v5 h-5 v-5 h-5 z'/><path fill='black' d='M140,50 h5 v-5 h5 v5 h5 v5 h-5 v5 h-5 v-5 h-5 z'/></svg>",
  nerdGlasses: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 60' shape-rendering='crispEdges'><path fill='black' fill-rule='evenodd' d='M0,5 h160 v15 h-10 v30 h-60 v-30 h-20 v30 h-60 v-30 h-10 z M15,15 h45 v25 h-45 z M100,15 h45 v25 h-45 z'/></svg>",
  heart: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path fill='%23ffb3c6' stroke='black' stroke-width='6' stroke-linejoin='round' d='M50,85 C50,85 10,55 10,30 C10,15 25,10 35,20 C42,27 50,35 50,35 C50,35 58,27 65,20 C75,10 90,15 90,30 C90,55 50,85 50,85 Z'/></svg>",
  dogEarLeft: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 100' shape-rendering='crispEdges'><path fill='white' d='M30,10 h30 v20 h10 v20 h-10 v20 h-30 v-10 h-20 v-30 h20 z'/><path fill='none' stroke='black' stroke-width='4' d='M30,10 h30 v20 h10 v20 h-10 v20 h-30 v-10 h-20 v-30 h20 z'/><path fill='%23ff66b2' d='M40,30 h10 v20 h-10 z'/><rect x='20' y='40' width='10' height='10' fill='black'/><rect x='50' y='60' width='10' height='10' fill='black'/><rect x='60' y='20' width='10' height='10' fill='black'/></svg>",
  dogEarRight: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 100' shape-rendering='crispEdges'><path fill='white' d='M50,10 h-30 v20 h-10 v20 h10 v20 h30 v-10 h20 v-30 h-20 z'/><path fill='none' stroke='black' stroke-width='4' d='M50,10 h-30 v20 h-10 v20 h10 v20 h30 v-10 h20 v-30 h-20 z'/><path fill='%23ff66b2' d='M40,30 h-10 v20 h10 z'/><rect x='60' y='40' width='10' height='10' fill='black'/><rect x='30' y='60' width='10' height='10' fill='black'/><rect x='20' y='20' width='10' height='10' fill='black'/></svg>",
  dogNose: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 40' shape-rendering='crispEdges'><path fill='white' d='M0,15 h60 v15 h-60 z'/><path fill='black' d='M15,10 h30 v15 h-10 v10 h-10 v-10 h-10 z'/><rect x='20' y='15' width='5' height='5' fill='white'/></svg>",
  pinkBow: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 80'><path fill='%23ff5e8e' stroke='%23cc1a53' stroke-width='3' d='M10,10 C40,0 45,35 50,40 C55,35 60,0 90,10 C110,40 80,70 50,40 C20,70 -10,40 10,10 Z'/><circle cx='50' cy='40' r='12' fill='%23ff8eb2' stroke='%23cc1a53' stroke-width='2'/><path fill='none' stroke='%23ff8eb2' stroke-width='4' stroke-linecap='round' d='M25,30 Q35,20 45,35 M75,30 Q65,20 55,35'/></svg>",
  bearEarLeft: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%238c5a2b'/><circle cx='50' cy='50' r='25' fill='%23e6ba8c'/></svg>",
  bearEarRight: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%238c5a2b'/><circle cx='50' cy='50' r='25' fill='%23e6ba8c'/></svg>",
  bearNose: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 80'><ellipse cx='50' cy='40' rx='45' ry='35' fill='%23e6ba8c'/><path fill='black' d='M30,30 C30,10 70,10 70,30 C70,50 55,60 50,60 C45,60 30,50 30,30 Z'/></svg>",
};

export const loadedAssets: Record<string, HTMLImageElement> = {};

export function preloadARAssets(): Promise<void> {
  return new Promise((resolve) => {
    const keys = Object.keys(AR_ASSETS) as (keyof typeof AR_ASSETS)[];
    let loaded = 0;
    
    if (keys.length === 0) {
      resolve();
      return;
    }

    keys.forEach((key) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        loadedAssets[key] = img;
        loaded++;
        if (loaded === keys.length) resolve();
      };
      img.onerror = () => {
        console.error(\`Failed to load AR asset: \${key}\`);
        loaded++;
        if (loaded === keys.length) resolve();
      };
      img.src = AR_ASSETS[key];
    });
  });
}
`;

fs.writeFileSync('src/lib/ar-assets.ts', newAssets);
