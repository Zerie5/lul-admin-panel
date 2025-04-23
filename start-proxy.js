// Simple script to start the CORS proxy
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting CORS proxy...');

// Spawn the CORS proxy as a child process
const proxyProcess = spawn('node', [join(__dirname, 'cors-proxy.js')], { 
  stdio: 'inherit',
  shell: true
});

proxyProcess.on('error', (error) => {
  console.error('Failed to start CORS proxy:', error);
});

process.on('SIGINT', () => {
  console.log('Stopping CORS proxy...');
  proxyProcess.kill();
  process.exit();
});

console.log('CORS proxy started. Press Ctrl+C to stop.'); 