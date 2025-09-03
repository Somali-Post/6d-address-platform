const fs = require('fs');
const path = require('path');

const apiKeyPlaceholder = '__GOOGLE_MAPS_API_KEY__';
const realApiKey = process.env.GOOGLE_MAPS_API_KEY;
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else if (exists) {
        fs.copyFileSync(src, dest);
    }
}

console.log('Starting build process...');

if (!realApiKey) {
    console.error('ERROR: GOOGLE_MAPS_API_KEY environment variable not set.');
    process.exit(1);
}

if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// --- UPDATED LOGIC ---
// We will now copy the entire project structure to 'dist' first,
// and then modify the HTML files in place.

console.log('Copying all project files to dist...');
copyRecursiveSync(path.join(rootDir, 'public'), path.join(distDir, 'public'));
copyRecursiveSync(path.join(rootDir, 'index.html'), path.join(distDir, 'index.html'));
copyRecursiveSync(path.join(rootDir, 'global-map.html'), path.join(distDir, 'global-map.html'));
copyRecursiveSync(path.join(rootDir, 'homepage-style.css'), path.join(distDir, 'homepage-style.css'));
copyRecursiveSync(path.join(rootDir, 'global-map.css'), path.join(distDir, 'global-map.css'));

console.log('Injecting API key into HTML files...');
const htmlFilesToProcess = [
    'global-map.html',
    'public/countries/somalia/map.html'
];

htmlFilesToProcess.forEach(filePath => {
    const fullPathInDist = path.join(distDir, filePath);
    try {
        let content = fs.readFileSync(fullPathInDist, 'utf-8');
        let newContent = content.replace(new RegExp(apiKeyPlaceholder, 'g'), realApiKey);
        fs.writeFileSync(fullPathInDist, newContent);
        console.log(`Processed: ${filePath}`);
    } catch (error) {
        console.warn(`Warning: Could not process file ${filePath}. It might not exist.`, error.message);
    }
});

console.log('Build complete! Output is in the /dist directory.');