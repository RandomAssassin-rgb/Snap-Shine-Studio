const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');

async function downloadImages() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const assets = {
    'dog.png': 'https://www.pngfind.com/pngs/m/172-1725619_snapchat-dog-filter-png-snapchat-dog-ears-transparent.png',
    'glasses.png': 'https://www.pngfind.com/pngs/m/6-60965_thug-life-glasses-png-pixel-sunglasses-png-transparent.png',
    'crown.png': 'https://www.pngfind.com/pngs/m/8-85418_snapchat-heart-crown-png-snapchat-heart-filter-transparent.png',
    'bows.png': 'https://www.pngfind.com/pngs/m/72-720645_pink-snapchat-bows-png-snapchat-pink-bow-filter.png'
  };

  for (const [filename, url] of Object.entries(assets)) {
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      const imgUrl = await page.evaluate(() => {
        const img = document.querySelector('img[src$=".png"]');
        return img ? img.src : null;
      });
      if (imgUrl) {
        console.log('Downloading ' + filename + ' from ' + imgUrl);
        const viewSource = await page.goto(imgUrl);
        fs.writeFileSync('public/ar-assets/' + filename, await viewSource.buffer());
        console.log('Successfully saved ' + filename);
      }
    } catch (e) {
      console.log('Failed ' + filename + ': ', e.message);
    }
  }

  await browser.close();
}

downloadImages();
