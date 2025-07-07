// Script to run the update_gift_translations.js file
import { exec } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the update script
const scriptPath = path.join(__dirname, 'update_gift_translations.js');

// Run the script with Node.js
exec(`node --experimental-modules ${scriptPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing script: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.error(`Script stderr: ${stderr}`);
  }
  
  console.log(`Script output: ${stdout}`);
});
