#!/usr/bin/env node

// Simple dev server bypass for file watcher issues
const { spawn } = require('child_process');

// Set environment variables to disable file watching
process.env.CHOKIDAR_USEPOLLING = 'true';
process.env.CHOKIDAR_INTERVAL = '1000';

// Start vite with polling
const vite = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5173'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    CHOKIDAR_USEPOLLING: 'true',
    CHOKIDAR_INTERVAL: '1000'
  }
});

vite.on('close', (code) => {
  process.exit(code);
});
