// Popup script - handles extension popup UI

document.getElementById('testBtn').addEventListener('click', async () => {
  const status = document.getElementById('status');

  status.textContent = 'Status: Sending test command...';

  // Get active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Send test message to content script
  chrome.tabs.sendMessage(tab.id, { action: 'test' }, (response) => {
    if (chrome.runtime.lastError) {
      status.textContent = 'Status: Error - ' + chrome.runtime.lastError.message;
    } else {
      status.textContent = 'Status: Test successful! ✅';
    }
  });
});
