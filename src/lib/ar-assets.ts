export const AR_ASSETS = {
  pixelGlasses: "/ar-assets/glasses.png",
  nerdGlasses: "/ar-assets/glasses.png", // Will use the same for now or fallback
  heart: "/ar-assets/crown.png",
  dogEarLeft: "/ar-assets/dog.png", // We will use clipping in the tracking engine, or just draw the whole image
  dogEarRight: "/ar-assets/dog.png",
  dogNose: "/ar-assets/dog.png",
  pinkBow: "/ar-assets/bows.png",
  bearEarLeft: "/ar-assets/dog.png",
  bearEarRight: "/ar-assets/dog.png",
  bearNose: "/ar-assets/dog.png",
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
