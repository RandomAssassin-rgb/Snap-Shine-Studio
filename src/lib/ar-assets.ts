export const AR_ASSETS = {
  pixelGlasses: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 30'><path fill='black' d='M0,10 h10 v-5 h30 v5 h5 v-5 h30 v5 h10 v5 h-10 v5 h-5 v-5 h-20 v5 h-5 v-5 h-10 v5 h-5 v-5 h-20 v5 h-5 v-5 h-5 z'/><path fill='white' d='M12,12 h4 v4 h-4 z M18,12 h4 v4 h-4 z M24,12 h4 v4 h-4 z M62,12 h4 v4 h-4 z M68,12 h4 v4 h-4 z M74,12 h4 v4 h-4 z'/></svg>",
  heart: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path fill='%23ffb3c6' stroke='%23333' stroke-width='4' d='M50,85 C50,85 10,55 10,30 C10,15 25,10 35,20 C42,27 50,35 50,35 C50,35 58,27 65,20 C75,10 90,15 90,30 C90,55 50,85 50,85 Z'/></svg>",
  dogEarLeft: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120'><path fill='white' stroke='%23333' stroke-width='3' d='M80,20 C60,0 20,20 10,60 C0,100 40,110 60,90 C80,70 100,60 80,20 Z'/><path fill='%23ff9eb5' d='M70,30 C55,15 35,30 25,60 C20,80 45,90 55,75 C65,60 75,50 70,30 Z'/><circle cx='40' cy='40' r='12' fill='black'/><circle cx='25' cy='75' r='8' fill='black'/><circle cx='70' cy='70' r='10' fill='black'/></svg>",
  dogEarRight: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120'><path fill='white' stroke='%23333' stroke-width='3' d='M20,20 C40,0 80,20 90,60 C100,100 60,110 40,90 C20,70 0,60 20,20 Z'/><path fill='%23ff9eb5' d='M30,30 C45,15 65,30 75,60 C80,80 55,90 45,75 C35,60 25,50 30,30 Z'/><circle cx='60' cy='40' r='12' fill='black'/><circle cx='75' cy='75' r='8' fill='black'/><circle cx='30' cy='70' r='10' fill='black'/></svg>",
  dogNose: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 60'><path fill='black' d='M10,20 C10,0 90,0 90,20 C90,50 60,60 50,60 C40,60 10,50 10,20 Z'/><ellipse cx='35' cy='15' rx='12' ry='6' fill='white' opacity='0.7'/></svg>",
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
        console.error(`Failed to load AR asset: ${key}`);
        loaded++;
        if (loaded === keys.length) resolve();
      };
      img.src = AR_ASSETS[key];
    });
  });
}
