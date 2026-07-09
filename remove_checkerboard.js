const Jimp = require('jimp');
const fs = require('fs');

async function processImage(filename) {
  try {
    const img = await Jimp.read(\`public/ar-assets/\${filename}\`);
    console.log('Processing ' + filename);
    
    // A checkerboard usually consists of gray and white squares.
    // The background usually is at the edges, so we can do a simple flood fill from the corner (0,0).
    
    // Actually, Jimp doesn't have a built-in flood-fill transparency.
    // Instead, we will iterate all pixels. If a pixel is perfectly grayscale (R==G==B) and is very bright (> 150),
    // and it is part of the background, we make it transparent.
    // To protect white/gray pixels INSIDE the dog ears/nose (like glares), we can just check if they are near the border, or we do a simple flood fill algorithm ourselves.
    
    // Simple Flood Fill Algorithm for transparency
    const width = img.bitmap.width;
    const height = img.bitmap.height;
    
    // Set to keep track of visited pixels
    const visited = new Set();
    const queue = [];
    
    // We add all 4 corners to the queue
    queue.push({x: 0, y: 0});
    queue.push({x: width - 1, y: 0});
    queue.push({x: 0, y: height - 1});
    queue.push({x: width - 1, y: height - 1});
    
    const isCheckerboardColor = (r, g, b, a) => {
        if (a < 10) return true; // Already transparent
        // Checkerboard is usually white (255,255,255) and gray (e.g., 204,204,204)
        const isGray = Math.abs(r - g) < 15 && Math.abs(g - b) < 15;
        const isBright = r > 180;
        return isGray && isBright;
    };
    
    let pixelsMadeTransparent = 0;
    
    while(queue.length > 0) {
        const {x, y} = queue.shift();
        const key = \`\${x},\${y}\`;
        
        if (x < 0 || x >= width || y < 0 || y >= height || visited.has(key)) continue;
        visited.add(key);
        
        const color = Jimp.intToRGBA(img.getPixelColor(x, y));
        
        if (isCheckerboardColor(color.r, color.g, color.b, color.a)) {
            // Make transparent
            img.setPixelColor(Jimp.rgbaToInt(0, 0, 0, 0), x, y);
            pixelsMadeTransparent++;
            
            // Add neighbors
            queue.push({x: x + 1, y});
            queue.push({x: x - 1, y});
            queue.push({x, y: y + 1});
            queue.push({x, y: y - 1});
        }
    }
    
    console.log(\`Made \${pixelsMadeTransparent} pixels transparent in \${filename}\`);
    await img.writeAsync(\`public/ar-assets/\${filename}\`);
    
  } catch (e) {
    console.error(e);
  }
}

async function main() {
    await processImage('dog.png');
    await processImage('crown.png');
    await processImage('bows.png');
    // For glasses.png, we fetched the real one from internet via puppeteer successfully! So we don't need to process it if it's already true transparent.
    // But let's process it anyway, the flood fill won't hurt a true transparent image.
    await processImage('glasses.png');
}

main();
