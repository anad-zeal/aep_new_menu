const fs = require('fs').promises;
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

// CLI Arguments: Check if user passed '--dry-run'
const IS_DRY_RUN = process.argv.includes('--dry-run');

/**
 * Sanitizes a filename:
 * 1. Lowercases
 * 2. Replaces spaces with dashes
 * 3. Removes special chars (keeps alphanumeric, dots, dashes, underscores)
 */
function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\.\-_]/g, '');
}

/**
 * Checks if a file exists (Case insensitive safe wrapper)
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function processFolders() {
  console.log(`\n🚀 Starting Bulk Rename ${IS_DRY_RUN ? '(DRY RUN MODE)' : ''}...`);
  if (IS_DRY_RUN) console.log('   (No files will actually be modified)\n');

  let renameCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const folder of FOLDERS) {
    const dirPath = path.join(IMAGE_ROOT, folder);
    
    // Check if folder exists
    if (!(await fileExists(dirPath))) {
      console.warn(`⚠️  Folder not found: "${folder}" -> Skipping.`);
      continue;
    }

    try {
      const files = await fs.readdir(dirPath);

      for (const oldName of files) {
        // Skip hidden files or system files
        if (oldName.startsWith('.')) continue;

        const newName = sanitizeFilename(oldName);

        // If names are identical, do nothing
        if (oldName === newName) continue;

        const oldPath = path.join(dirPath, oldName);
        const newPath = path.join(dirPath, newName);

        // Check for conflicts
        // We skip the check if the only difference is casing (e.g. Image.jpg -> image.jpg)
        // because on Windows/Mac, exists() returns true for the file itself.
        const isCaseChangeOnly = oldName.toLowerCase() === newName;
        const targetExists = await fileExists(newPath);

        if (targetExists && !isCaseChangeOnly) {
          console.log(`🛑 Conflict: [${folder}] "${oldName}" skipped. "${newName}" already exists.`);
          skipCount++;
          continue;
        }

        // Perform Rename
        try {
          if (!IS_DRY_RUN) {
            await fs.rename(oldPath, newPath);
          }
          console.log(`✅ ${IS_DRY_RUN ? '[Dry Run] ' : ''}Renamed: [${folder}] ${oldName} -> ${newName}`);
          renameCount++;
        } catch (err) {
          console.error(`❌ Error renaming "${oldName}": ${err.message}`);
          errorCount++;
        }
      }
    } catch (err) {
      console.error(`❌ Error reading directory ${folder}: ${err.message}`);
    }
  }

  console.log('\n--------------------------------------------------');
  console.log(`✨ Process Complete.`);
  console.log(`   Renamed: ${renameCount}`);
  console.log(`   Skipped: ${skipCount}`);
  console.log(`   Errors:  ${errorCount}`);
  if (IS_DRY_RUN) console.log('   (Run without --dry-run to apply changes)');
  console.log('--------------------------------------------------\n');
}

processFolders();