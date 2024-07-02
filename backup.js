// backup.js

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Ensure the backup directory exists
const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

// Generate a timestamped filename
const filename = `rooms_backup_${new Date().toISOString().replace(/:/g, '-')}.json`;

// Copy the rooms.json file to the backup directory with the new filename
fs.copyFile(path.join(__dirname, 'rooms.json'), path.join(backupDir, filename), (err) => {
    if (err) {
        console.error('Error creating backup:', err);
    } else {
        console.log('Backup created successfully:', filename);
    }
});
