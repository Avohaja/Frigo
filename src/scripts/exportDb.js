// const fs = require('fs');
// const path = require('path');
// const fetch = require('node-fetch'); // Install with: npm install node-fetch

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportAllTables() {
  try {
    const response = await fetch('http://localhost:5000/api/export-all');
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    const data = await response.json();

    // Ensure the data directory exists
    const dir = path.join(__dirname, '../data');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write the JSON file
    fs.writeFileSync(
      path.join(dir, 'myDb.json'),
      JSON.stringify(data, null, 2),
      'utf-8'
    );

    console.log('Data exported to src/data/myDb.json');
  } catch (error) {
    console.error('Error exporting data:', error);
  }
}

exportAllTables();
