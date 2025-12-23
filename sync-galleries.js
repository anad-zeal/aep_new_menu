/**
 * sync-galleries.js
 * Professional Artist Workflow: Auto-rename, Metadata Extraction, Git Push.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const chokidar = require('chokidar');
const ExifReader = require('exifreader');

const PROJECT_ROOT = __dirname;
const PATHS = {
  images: path.join(PROJECT_ROOT, 'assets', 'images'),
  json: path.join(PROJECT_ROOT, 'json-files'),
  webRoot: 'assets/images/',
};

const GALLERIES = [
  { folder: 'encaustic', json: 'encaustic-slideshow.json', prefix: 'encaustic' },
  { folder: 'drip-series', json: 'drip-series-slideshow.json', prefix: 'drip' },
  { folder: 'black-and-white', json: 'black-and-white-slideshow.json', prefix: 'bw' },
  { folder: 'project-series', json: 'projects-slideshow.json', prefix: 'proj' },
  { folder: 'decorative', json: 'decorative-slideshow.json', prefix: 'deco' },
  { folder: 'historic-preservation', json: 'preservation-slideshow.json', prefix: 'pres' },
];

// 1. Rename file to lowercase-with-dashes
function sanitizeFileOnDisk(dir, filename) {
  const newName = filename.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\.\-_]/g, '');
  if (filename !== newName) {
    const oldPath = path.join(dir, filename);
    const newPath = path.join(dir, newName);
    if (!fs.existsSync(newPath)) {
      fs.renameSync(oldPath, newPath);
      return newName;
    }
  }
  return filename;
}

// 2. Extract Professional Metadata
async function getMetadata(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const tags = ExifReader.load(fileBuffer);
    const getText = (tag) => (tags[tag] ? (Array.isArray(tags[tag].description) ? tags[tag].description[0] : tags[tag].description) : '');

    return {
      title: getText('Headline') || getText('ObjectName') || '',
      medium: getText('Credit') || '',
      dimensions: getText('Source') || '',
      description: getText('Instructions') || getText('Caption/Abstract') || getText('ImageDescription') || ''
    };
  } catch (e) {
    return { title: '', medium: '', dimensions: '', description: '' };
  }
}

function formatFallbackTitle(filename) {
  return filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function commitAndPush(message) {
  console.log('☁️ Git: Syncing changes...');
  const command = `git add . && git commit -m "Gallery Update: ${message}" && git push`;
  exec(command, (err) => {
    if (err) return console.error(`❌ Git Error: ${err.message}`);
    console.log(`✅ Git Push Successful.`);
  });
}

// 3. Core Sync Logic
async function syncAllGalleries() {
  let globalChanges = false;

  for (const config of GALLERIES) {
    const imgDir = path.join(PATHS.images, config.folder);
    const jsonPath = path.join(PATHS.json, config.json);

    if (!fs.existsSync(imgDir)) continue;

    const rawFiles = fs.readdirSync(imgDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    let existingData = [];
    if (fs.existsSync(jsonPath)) {
      try { existingData = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); } catch (e) {}
    }

    const newJsonData = [];
    let galleryChanged = false;

    for (let i = 0; i < rawFiles.length; i++) {
      const originalFile = rawFiles[i];
      const file = sanitizeFileOnDisk(imgDir, originalFile); // AUTO-RENAME STEP
      const filePath = path.join(imgDir, file);
      const webPath = `${PATHS.webRoot}${config.folder}/${file}`;
      
      const meta = await getMetadata(filePath);
      const oldEntry = existingData.find(item => item.src === webPath);
      
      const entry = {
        id: oldEntry ? oldEntry.id : `${config.prefix}-${Date.now()}-${i}`,
        title: meta.title || (oldEntry ? oldEntry.title : formatFallbackTitle(file)),
        src: webPath,
        description: meta.description || (oldEntry ? oldEntry.description : ''),
        medium: meta.medium || (oldEntry ? oldEntry.medium : ''),
        dimensions: meta.dimensions || (oldEntry ? oldEntry.dimensions : '')
      };

      if (!oldEntry || JSON.stringify(oldEntry) !== JSON.stringify(entry)) {
        galleryChanged = true;
      }
      newJsonData.push(entry);
    }

    if (existingData.length !== newJsonData.length) galleryChanged = true;

    if (galleryChanged) {
      fs.writeFileSync(jsonPath, JSON.stringify(newJsonData, null, 2));
      console.log(`[Updated] ${config.json}`);
      globalChanges = true;
    }
  }
  return globalChanges;
}

// Start
console.log('--- Portfolio Engine Running ---');
syncAllGalleries().then(changed => { if (changed) commitAndPush('Initial Sync'); });

const watcher = chokidar.watch(PATHS.images, { 
  ignored: /(^|[\/\\])\../, 
  persistent: true, 
  ignoreInitial: true,
  awaitWriteFinish: { stabilityThreshold: 2000 } 
});

watcher.on('all', (event, filePath) => {
  console.log(`Change detected: ${path.basename(filePath)}`);
  syncAllGalleries().then(changed => {
    if (changed) commitAndPush(`Update: ${path.basename(filePath)}`);
  });
});