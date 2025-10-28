// Background service worker - handles native messaging

console.log('🚀 Voice Assistant background service worker loaded');

// Native messaging port (will connect to desktop app)
let nativePort = null;

// Try to connect to native app
function connectToNativeApp() {
  try {
    console.log('📡 Attempting to connect to native app...');

    // This will connect to our Electron app via native messaging
    nativePort = chrome.runtime.connectNative('com.voiceassistant.host');

    nativePort.onMessage.addListener((message) => {
      console.log('📨 Received from native app:', message);

      // Forward command to content script with proper error handling
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          console.log('📤 Forwarding to tab:', tabs[0].id, tabs[0].url);

          chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            if (chrome.runtime.lastError) {
              console.error('❌ Failed to send message:', chrome.runtime.lastError.message);
              console.log('💡 Try reloading the page');
            } else {
              console.log('✅ Content script responded:', response);
            }
          });
        } else {
          console.error('❌ No active tab found');
        }
      });
    });

    nativePort.onDisconnect.addListener(() => {
      console.log('🔌 Native app disconnected');
      nativePort = null;
    });

    console.log('✅ Connected to native app');

  } catch (error) {
    console.log('⚠️ Native app not connected yet (this is OK for now):', error.message);
  }
}

// Test connection on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('🎉 Extension installed');
  connectToNativeApp();
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📬 Message from content script:', message);

  // If we have native connection, forward to desktop app
  if (nativePort) {
    nativePort.postMessage(message);
  }

  sendResponse({ received: true });
});
