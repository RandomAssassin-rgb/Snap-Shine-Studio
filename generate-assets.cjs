const fs = require('fs');

const svgAssets = {
  // Thug Life glasses ARE pixelated by definition, but we'll make them clean and sharp.
  pixelGlasses: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 45'><path fill='black' d='M0,10 h160 v10 h-10 v5 h-10 v5 h-20 v-5 h-10 v-15 h-30 v15 h-10 v5 h-20 v-5 h-10 v-5 h-10 v-10 h-30 z'/><rect x='20' y='12' width='8' height='8' fill='white'/><rect x='28' y='20' width='8' height='8' fill='white'/><rect x='36' y='28' width='8' height='8' fill='white'/><rect x='100' y='12' width='8' height='8' fill='white'/><rect x='108' y='20' width='8' height='8' fill='white'/><rect x='116' y='28' width='8' height='8' fill='white'/></svg>",
  
  // Nerd glasses (thick dark frames, smooth)
  nerdGlasses: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 80'><defs><filter id='drop'><feDropShadow dx='0' dy='4' stdDeviation='4' flood-opacity='0.4'/></filter></defs><path fill='%23111' filter='url(%23drop)' d='M10,20 C10,5 90,5 95,20 C95,50 85,75 50,75 C20,75 10,60 10,20 Z M105,20 C105,5 190,5 190,20 C190,50 180,75 150,75 C115,75 105,60 105,20 Z'/><path fill='none' stroke='white' stroke-width='4' opacity='0.3' d='M25,25 Q50,15 75,25 M125,25 Q150,15 175,25'/></svg>",
  
  // Beautiful organic heart with 3D gradient
  heart: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><radialGradient id='g' cx='30%' cy='30%' r='70%'><stop offset='0%' stop-color='%23ffb3c6'/><stop offset='100%' stop-color='%23ff1a53'/></radialGradient><filter id='s'><feDropShadow dx='0' dy='3' stdDeviation='3' flood-opacity='0.3'/></filter></defs><path fill='url(%23g)' filter='url(%23s)' d='M50,90 C50,90 10,60 10,35 C10,15 30,10 40,20 C45,25 50,35 50,35 C50,35 55,25 60,20 C70,10 90,15 90,35 C90,60 50,90 50,90 Z'/></svg>",
  
  // Realistic smooth Dog Ear Left
  dogEarLeft: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120'><defs><radialGradient id='ear' cx='40%' cy='40%' r='60%'><stop offset='0%' stop-color='white'/><stop offset='100%' stop-color='%23eee'/></radialGradient><filter id='shadow'><feDropShadow dx='-2' dy='4' stdDeviation='3' flood-opacity='0.4'/></filter></defs><path fill='url(%23ear)' filter='url(%23shadow)' d='M80,10 C60,-10 20,10 10,50 C0,90 20,110 50,100 C80,90 90,60 80,10 Z'/><path fill='%23ff99bb' d='M70,30 C55,15 35,30 30,55 C25,80 45,90 55,75 C65,60 75,45 70,30 Z'/><circle cx='40' cy='30' r='12' fill='%23222'/><circle cx='25' cy='75' r='10' fill='%23222'/><ellipse cx='65' cy='80' rx='15' ry='10' fill='%23222' transform='rotate(-20 65 80)'/></svg>",
  
  // Realistic smooth Dog Ear Right
  dogEarRight: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120'><defs><radialGradient id='ear2' cx='60%' cy='40%' r='60%'><stop offset='0%' stop-color='white'/><stop offset='100%' stop-color='%23eee'/></radialGradient><filter id='shadow2'><feDropShadow dx='2' dy='4' stdDeviation='3' flood-opacity='0.4'/></filter></defs><path fill='url(%23ear2)' filter='url(%23shadow2)' d='M20,10 C40,-10 80,10 90,50 C100,90 80,110 50,100 C20,90 10,60 20,10 Z'/><path fill='%23ff99bb' d='M30,30 C45,15 65,30 70,55 C75,80 55,90 45,75 C35,60 25,45 30,30 Z'/><circle cx='60' cy='30' r='12' fill='%23222'/><circle cx='75' cy='75' r='10' fill='%23222'/><ellipse cx='35' cy='80' rx='15' ry='10' fill='%23222' transform='rotate(20 35 80)'/></svg>",
  
  // Realistic Dog Nose
  dogNose: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60'><defs><radialGradient id='n' cx='30%' cy='20%' r='60%'><stop offset='0%' stop-color='%23444'/><stop offset='100%' stop-color='black'/></radialGradient></defs><path fill='url(%23n)' d='M10,20 C10,-10 90,-10 90,20 C90,60 60,60 50,60 C40,60 10,60 10,20 Z'/><ellipse cx='30' cy='15' rx='12' ry='6' fill='white' opacity='0.8' transform='rotate(-10 30 15)'/></svg>",
  
  // 3D Pink Bow
  pinkBow: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 100'><defs><linearGradient id='b1' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23ff99bb'/><stop offset='50%' stop-color='%23ff3377'/><stop offset='100%' stop-color='%23cc0044'/></linearGradient><filter id='ds'><feDropShadow dx='0' dy='5' stdDeviation='4' flood-opacity='0.4'/></filter></defs><path fill='url(%23b1)' filter='url(%23ds)' d='M10,10 C40,-10 50,40 60,50 C70,40 80,-10 110,10 C130,40 100,80 60,50 C20,80 -10,40 10,10 Z'/><circle cx='60' cy='50' r='15' fill='url(%23b1)' stroke='%23990033' stroke-width='2'/><path fill='none' stroke='%23ff99bb' stroke-width='4' stroke-linecap='round' d='M25,40 Q45,25 55,45 M95,40 Q75,25 65,45'/></svg>",
  
  // Bear Ears
  bearEarLeft: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%236b4226'/><circle cx='50' cy='50' r='25' fill='%23c99c75'/></svg>",
  bearEarRight: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%236b4226'/><circle cx='50' cy='50' r='25' fill='%23c99c75'/></svg>",
  bearNose: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 80'><ellipse cx='50' cy='40' rx='45' ry='35' fill='%23c99c75'/><path fill='%23222' d='M35,30 C35,10 65,10 65,30 C65,50 55,60 50,60 C45,60 35,50 35,30 Z'/></svg>",
};

const output = \`export const AR_ASSETS = {
  pixelGlasses: "\${svgAssets.pixelGlasses}",
  nerdGlasses: "\${svgAssets.nerdGlasses}",
  heart: "\${svgAssets.heart}",
  dogEarLeft: "\${svgAssets.dogEarLeft}",
  dogEarRight: "\${svgAssets.dogEarRight}",
  dogNose: "\${svgAssets.dogNose}",
  pinkBow: "\${svgAssets.pinkBow}",
  bearEarLeft: "\${svgAssets.bearEarLeft}",
  bearEarRight: "\${svgAssets.bearEarRight}",
  bearNose: "\${svgAssets.bearNose}",
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
        console.error(\\\`Failed to load AR asset: \${key}\\\`);
        loaded++;
        if (loaded === keys.length) resolve();
      };
      img.src = AR_ASSETS[key];
    });
  });
}
\`;

fs.writeFileSync('src/lib/ar-assets.ts', output);
