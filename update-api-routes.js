// This script updates all API routes to handle build phase correctly
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const apiDir = path.join(__dirname, 'src', 'app', 'api');

// Pattern to match: await dbConnect();
const dbConnectPattern = /await dbConnect\(\);/g;
const dbConnectReplacement = `const conn = await dbConnect();
    
    // Skip during build time
    if (conn.isConnectSkipped) {
      return NextResponse.json({
        success: true,
        message: "Build phase - operation skipped"
      });
    }`;

async function processFile(filePath) {
  try {
    // Read the file content
    const content = await readFileAsync(filePath, 'utf8');
    
    // Skip if file doesn't import dbConnect or NextResponse
    if (!content.includes('dbConnect') || !content.includes('NextResponse')) {
      return;
    }
    
    // Replace the pattern
    const newContent = content.replace(dbConnectPattern, dbConnectReplacement);
    
    // Write back only if changes were made
    if (content !== newContent) {
      await writeFileAsync(filePath, newContent, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

async function processDirectory(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        await processDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        await processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${dirPath}:`, error);
  }
}

// Start processing
processDirectory(apiDir)
  .then(() => console.log('✅ All API routes updated successfully'))
  .catch((error) => console.error('❌ Error updating API routes:', error));
