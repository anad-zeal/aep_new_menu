/**
 * sync-galleries.js
 * Combines IPTC metadata extraction, Git automation, and Directory Watching.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const chokidar = require('chokidar'); // Better than fs.watch
const ExifReader = require('exifreader');

// --- CONFIGURATION (Matched to your TREE) ---
const PROJECT_ROOT = __dirname;
const PATHS = {
  images: path.join(PROJECT_ROOT, 'assets', 'images'),
  json: path.join(PROJECT_ROOT, 'json-files'),
  webRoot: 'assets/images/', // Path used in your JSON/HTML
};

const GALLERIES = [
  { folder: 'encaustic', json: 'encaustic-slideshow.json', prefix: 'encaustic' },
  { folder: 'drip-series', json: 'drip-series-slideshow.json', prefix: 'drip' },
  { folder: 'black-and-white', json: 'black-and-white-slideshow.json', prefix: 'bw' },
  { folder: 'project-series', json: 'projects-slideshow.json', prefix: 'proj' },
  { folder: 'decorative', json: 'decorative-slideshow.json', prefix: 'deco' },
  { folder: 'historic-preservation', json: 'preservation-slideshow.json', prefix: 'pres' },
];

// --- HELPERS ---

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
  const command = `git add . && git commit -m "Auto-update gallery: ${message}" && git push`;
  exec(command, (err, stdout) => {
    if (err) return console.error(`❌ Git Error: ${err.message}`);
    console.log(`✅ Git Push Successful.`);
  });
}

// --- CORE SYNC ---

async function syncAllGalleries() {
  let globalChanges = false;

  for (const config of GALLERIES) {
    const imgDir = path.join(PATHS.images, config.folder);
    const jsonPath = path.join(PATHS.json, config.json);

    if (!fs.existsSync(imgDir)) continue;

    const files = fs.readdirSync(imgDir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
    let existingData = [];
    if (fs.existsSync(jsonPath)) {
      try { existingData = JSON.parse(fs.readFileSync(jsonPath, 'utf8')); } catch (e) {}
    }

    const newJsonData = [];
    let galleryChanged = false;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(imgDir, file);
      const webPath = `${PATHS.webRoot}${config.folder}/${file}`;
      
      const meta = await getMetadata(filePath);
      const oldEntry = existingData.find(item => item.src === webPath);
      
      const entry = {
        id: oldEntry ? oldEntry.id : `${config.prefix}-${Date.now()}-${i}`,
        title: meta.title || (oldEntry ? oldEntry.title : formatFallbackTitle(file)),
        src: webPath,
        caption: meta.title || formatFallbackTitle(file),
        description: meta.description || (oldEntry ? oldEntry.description : `Description for ${formatFallbackTitle(file)}`),
        medium: meta.medium || (oldEntry ? oldEntry.medium : 'Medium TBD'),
        dimensions: meta.dimensions || (oldEntry ? oldEntry.dimensions : '00" x 00"')
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

// --- EXECUTION ---

console.log('--- Portfolio Gallery Sync Started ---');

// Run initial sync
syncAllGalleries().then(changed => {
  if (changed) commitAndPush('Startup Sync');
});

// Watch for changes
const watcher = chokidar.watch(PATHS.images, {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 100 }
});

watcher.on('all', (event, filePath) => {
  console.log(`File ${event}: ${path.basename(filePath)}`);
  syncAllGalleries().then(changed => {
    if (changed) commitAndPush(`File ${event} - ${path.basename(filePath)}`);
  });
});