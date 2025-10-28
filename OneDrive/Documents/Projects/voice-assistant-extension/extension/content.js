// Content script - runs on web pages, handles DOM manipulation

console.log('✨ Voice Assistant content script loaded on:', window.location.href);

// Listen for commands from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📥 Content script received command:', message);

  // Handle different command types
  if (message.action === 'test') {
    alert('Voice Assistant is working! 🎤');
    sendResponse({ success: true });
  } else if (message.action === 'click') {
    // Find and click element based on voice command
    const result = handleClickCommand(message);
    sendResponse(result);
  }

  return true;
});

// Handle click commands
function handleClickCommand(message) {
  console.log('🎯 Click command:', message.target);

  // Find any clickable element (button, link, or clickable div)
  const clickableSelectors = [
    'button',           // Actual buttons
    'a[href]',          // Links
    '[role="button"]',  // ARIA buttons
    'input[type="button"]',
    'input[type="submit"]'
  ];

  for (const selector of clickableSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      // Scroll into view first so user can see what's being clicked
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Add visual highlight
      const originalBorder = element.style.border;
      element.style.border = '3px solid #00ff00';

      setTimeout(() => {
        element.click();
        console.log('✅ Clicked:', element);

        // Remove highlight after click
        setTimeout(() => {
          element.style.border = originalBorder;
        }, 500);
      }, 300);

      const elementText = element.textContent?.trim().substring(0, 50) ||
                          element.getAttribute('aria-label') ||
                          element.href ||
                          'unnamed element';

      return {
        success: true,
        message: `Clicked: ${elementText}`
      };
    }
  }

  return {
    success: false,
    message: 'No clickable elements found on page'
  };
}
