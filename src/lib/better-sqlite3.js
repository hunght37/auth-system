const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure /tmp exists
const tmpDir = '/tmp';
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

// Copy the database to /tmp on startup
const dbPath = path.join(process.cwd(), 'prisma/dev.db');
const tmpDbPath = path.join(tmpDir, 'dev.db');

// Only copy if the source exists and the destination doesn't
if (fs.existsSync(dbPath) && !fs.existsSync(tmpDbPath)) {
  fs.copyFileSync(dbPath, tmpDbPath);
}

// Create the database connection
const db = new Database(tmpDbPath);

// Export the database connection
module.exports = db;
