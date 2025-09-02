const fs = require('fs');
const path = require('path');

// --- Configuration ---
const apiKeyPlaceholder = '__GOOGLE_MAPS_API_KEY__';
const realApiKey = process.env.GOOGLE_MAPS_API_KEY;
const rootDir = path.join(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// --- Helper Function to Copy Files Recursively ---
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

// --- Main Build Logic ---
console.log('Starting build process...');

// 1. Check for API Key
if (!realApiKey) {
    console.error('ERROR: GOOGLE_MAPS_API_KEY environment variable not set.');
    process.exit(1);
}

// 2. Clean and create the 'dist' directory
if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 3. Process HTML files (find and replace API key)
const htmlFilesToProcess = [
    'global-map.html',
    'public/countries/somalia/map.html'
];

htmlFilesToProcess.forEach(filePath => {
    const fullPath = path.join(rootDir, filePath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const newContent = content.replace(new RegExp(apiKeyPlaceholder, 'g'), realApiKey);
    
    const destPath = path.join(distDir, filePath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, newContent);
    console.log(`Processed and copied: ${filePath}`);
});

// 4. Copy all other necessary files and folders to 'dist'
console.log('Copying remaining assets...');
const assetsToCopy = [
    'index.html', // The main homepage
    'homepage-style.css',
    'global-map.css',
    'public' // The entire public folder (app, assets, countries, data)
];

assetsToCopy.forEach(assetPath => {
    const srcPath = path.join(rootDir, assetPath);
    const destPath = path.join(distDir, assetPath);
    copyRecursiveSync(srcPath, destPath);
    console.log(`Copied: ${assetPath}`);
});

console.log('Build complete! Output is in the /dist directory.');