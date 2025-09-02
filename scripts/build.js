const fs = require('fs');
const path = require('path');

// This is the placeholder we'll use in our HTML files
const apiKeyPlaceholder = '__GOOGLE_MAPS_API_KEY__';
// This is the real API key that Netlify will provide
const realApiKey = process.env.GOOGLE_MAPS_API_KEY;

if (!realApiKey) {
    console.error('ERROR: GOOGLE_MAPS_API_KEY environment variable not set.');
    process.exit(1);
}

// The 'dist' folder is where Netlify will look for the final site
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

// List of all HTML files that need the API key
const filesToProcess = [
    'global-map.html',
    'public/countries/somalia/map.html'
];

filesToProcess.forEach(filePath => {
    const fullPath = path.join(__dirname, '..', filePath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const newContent = content.replace(apiKeyPlaceholder, realApiKey);
    
    const destPath = path.join(distDir, filePath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, newContent);
    console.log(`Processed and copied: ${filePath}`);
});

// Simple function to copy all other necessary files and folders
function copyRecursiveSync(src, dest) {
    const exists = fs.existsSync(src);
    const stats = exists && fs.statSync(src);
    const isDirectory = exists && stats.isDirectory();
    if (isDirectory) {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(childItemName => {
            copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

console.log('Copying remaining assets...');
// Copy everything from the root that isn't an HTML file we processed
copyRecursiveSync('public', path.join(distDir, 'public'));
copyRecursiveSync('homepage-style.css', path.join(distDir, 'homepage-style.css'));
copyRecursiveSync('index.html', path.join(distDir, 'index.html')); // Copy the main homepage
console.log('Build complete!');