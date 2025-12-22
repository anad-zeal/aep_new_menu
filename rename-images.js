const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const IMAGE_ROOT = path.join(__dirname, 'assets', 'images');
const FOLDERS = [
  'encaustic',
  'drip-series',
  'black-and-white',
  'project-series',
  'decorative',
  'historic-preservation'
];

function sanitizeFilename(name) {
  return name
    .toLowerCase()               // Force lowercase
    .replace(/\s+/g, '-')        // Replace spaces with dashes
    .replace(/[^a-z0-9\.\-_]/g, ''); // Remove special characters (except dots/dashes/underscores)
}

function renameFilesInFolders() {
  console.log('🚀 Starting Bulk Rename...');

  FOLDERS.forEach(folder => {
    const dirPath = path.join(IMAGE_ROOT, folder);

    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️ Folder not found: ${folder}, skipping.`);
      return;
    }

    const files = fs.readdirSync(dirPath);

    files.forEach(oldName => {
      // Skip hidden files like .DS_Store
      if (oldName.startsWith('.')) return;

      const newName = sanitizeFilename(oldName);

      // Only rename if the name actually changed
      if (oldName !== newName) {
        const oldPath = path.join(dirPath, oldName);
        const newPath = path.join(dirPath, newName);

        // Safety check: Don't overwrite if the destination file already exists
        if (fs.existsSync(newPath)) {
          console.log(`🛑 Conflict: Could not rename "${oldName}" because "${newName}" already exists.`);
        } else {
          fs.renameSync(oldPath, newPath);
          console.log(`✅ Renamed: [${folder}] ${oldName} -> ${newName}`);
        }
      }
    });
  });

  console.log('\n✨ Done! All images processed.');
}

renameFilesInFolders();