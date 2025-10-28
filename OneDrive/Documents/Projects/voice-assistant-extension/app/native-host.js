#!/usr/bin/env node

/**
 * Native messaging host - bridges Chrome extension and Electron app
 * Uses Chrome's native messaging protocol (stdin/stdout with message length prefix)
 */

const fs = require('fs');
const path = require('path');

// Log to file for debugging (can't use console.log - it goes to Chrome)
const logFile = path.join(__dirname, 'logs', 'native-host.log');
fs.mkdirSync(path.dirname(logFile), { recursive: true });

function log(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

log('=== Native messaging host started ===');

// Read messages from Chrome (stdin)
let inputBuffer = Buffer.alloc(0);

process.stdin.on('readable', () => {
  let chunk;
  while ((chunk = process.stdin.read()) !== null) {
    inputBuffer = Buffer.concat([inputBuffer, chunk]);

    // Chrome native messaging format: 4-byte length + JSON message
    while (inputBuffer.length >= 4) {
      const messageLength = inputBuffer.readUInt32LE(0);

      if (inputBuffer.length >= 4 + messageLength) {
        const messageBytes = inputBuffer.slice(4, 4 + messageLength);
        const message = JSON.parse(messageBytes.toString('utf8'));

        log('Received from Chrome: ' + JSON.stringify(message));

        // Process message
        handleMessage(message);

        // Remove processed message from buffer
        inputBuffer = inputBuffer.slice(4 + messageLength);
      } else {
        break; // Wait for more data
      }
    }
  }
});

process.stdin.on('end', () => {
  log('Chrome disconnected');
  process.exit(0);
});

// Send message to Chrome (stdout)
function sendMessage(message) {
  const json = JSON.stringify(message);
  const length = Buffer.byteLength(json);

  const header = Buffer.alloc(4);
  header.writeUInt32LE(length, 0);

  process.stdout.write(header);
  process.stdout.write(json);

  log('Sent to Chrome: ' + json);
}

// Handle messages from Chrome extension
function handleMessage(message) {
  log('Processing message type: ' + message.type);

  // For now, just echo back with confirmation
  if (message.type === 'test') {
    sendMessage({
      type: 'test_response',
      success: true,
      message: 'Native messaging is working! 🎉'
    });
  } else if (message.type === 'page_loaded') {
    log('Page loaded: ' + message.url);
    // Just acknowledge, don't send response (not needed)
  } else {
    sendMessage({
      type: 'error',
      message: 'Unknown message type: ' + message.type
    });
  }
}

// Handle errors
process.on('uncaughtException', (error) => {
  log('ERROR: ' + error.message);
  log('Stack: ' + error.stack);
  process.exit(1);
});

log('Native host ready and listening for messages');

// Watch for commands from Electron app
const commandFile = path.join(__dirname, 'logs', 'pending-command.json');
let lastCommandTime = 0;

setInterval(() => {
  try {
    if (fs.existsSync(commandFile)) {
      const stats = fs.statSync(commandFile);
      const mtime = stats.mtimeMs;

      // Only process if file was modified since last check
      if (mtime > lastCommandTime) {
        const command = JSON.parse(fs.readFileSync(commandFile, 'utf8'));
        log('Found new command from Electron: ' + JSON.stringify(command));

        // Forward to Chrome
        sendMessage(command);

        lastCommandTime = mtime;

        // Delete command file after sending
        fs.unlinkSync(commandFile);
      }
    }
  } catch (error) {
    log('Error checking for commands: ' + error.message);
  }
}, 100); // Check every 100ms
