const { Jimp } = require('jimp');

async function processImage(filename) {
  try {
    const img = await Jimp.read('public/ar-assets/' + filename);
    console.log('Processing ' + filename);
    
    const width = img.bitmap.width;
    const height = img.bitmap.height;
    
    const visited = new Set();
    const queue = [];
    
    // Add border pixels to start flood fill
    for (let x=0; x<width; x++) {
        queue.push({x, y: 0});
        queue.push({x, y: height-1});
    }
    for (let y=0; y<height; y++) {
        queue.push({x: 0, y});
        queue.push({x: width-1, y});
    }
    
    const isCheckerboardColor = (r, g, b, a) => {
        if (a < 10) return true;
        const isGray = Math.abs(r - g) < 25 && Math.abs(g - b) < 25 && Math.abs(r - b) < 25;
        const isBright = r > 150 && g > 150 && b > 150;
        return isGray && isBright;
    };
    
    let pixelsMadeTransparent = 0;
    
    while(queue.length > 0) {
        const {x, y} = queue.shift();
        const key = x + ',' + y;
        
        if (x < 0 || x >= width || y < 0 || y >= height || visited.has(key)) continue;
        visited.add(key);
        
        const hex = img.getPixelColor(x, y);
        const r = (hex >>> 24) & 255;
        const g = (hex >>> 16) & 255;
        const b = (hex >>> 8) & 255;
        const a = hex & 255;
        
        if (isCheckerboardColor(r, g, b, a)) {
            img.setPixelColor(0x00000000, x, y);
            pixelsMadeTransparent++;
            
            queue.push({x: x + 1, y});
            queue.push({x: x - 1, y});
            queue.push({x, y: y + 1});
            queue.push({x, y: y - 1});
        }
    }
    
    console.log('Made pixels transparent in ' + filename + ': ' + pixelsMadeTransparent);
    await img.write('public/ar-assets/' + filename);
    
  } catch (e) {
    console.error(e);
  }
}

async function main() {
    await processImage('dog.png');
    await processImage('crown.png');
    await processImage('bows.png');
}

main();
