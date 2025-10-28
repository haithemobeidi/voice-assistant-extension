// Renderer process - handles UI and microphone access
const { ipcRenderer } = require('electron');

let mediaStream = null;
let audioContext = null;
let analyser = null;
let animationId = null;
let recognition = null;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const status = document.getElementById('status');
const indicator = document.getElementById('indicator');
const volumeLevel = document.getElementById('volumeLevel');

// Start listening to microphone
startBtn.addEventListener('click', async () => {
  try {
    status.textContent = 'Requesting microphone access...';
    status.className = '';

    // Request microphone permission and capture audio
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    // Set up Web Audio API for visualization
    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(mediaStream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    // Start visualizing audio levels
    visualizeAudio();

    // Start speech recognition
    startSpeechRecognition();

    status.textContent = '🎤 Listening... (Say "click button" to test)';
    status.className = 'listening';
    indicator.className = 'active';

    startBtn.disabled = true;
    stopBtn.disabled = false;

    console.log('✅ Microphone access granted');
    console.log('Audio tracks:', mediaStream.getAudioTracks());

  } catch (error) {
    console.error('❌ Microphone access error:', error);
    status.textContent = `Error: ${error.message}`;
    status.className = 'error';
  }
});

// Stop listening
stopBtn.addEventListener('click', () => {
  stopListening();
});

// Manual test button (bypass voice recognition for testing)
document.getElementById('testClickBtn').addEventListener('click', () => {
  console.log('🧪 Manual test: Sending click command to Chrome...');

  ipcRenderer.send('send-to-chrome', {
    action: 'click',
    target: 'button'
  });

  const status = document.getElementById('status');
  status.textContent = '✅ Click command sent to Chrome!';

  setTimeout(() => {
    status.textContent = status.className === 'listening'
      ? '🎤 Listening... (Say "click button" to test)'
      : 'Click button to test microphone';
  }, 2000);
});

function stopListening() {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  if (recognition) {
    recognition.stop();
    recognition = null;
  }

  status.textContent = 'Microphone stopped';
  status.className = '';
  indicator.className = '';
  volumeLevel.textContent = '0';

  startBtn.disabled = false;
  stopBtn.disabled = true;

  console.log('🛑 Microphone stopped');
}

// Visualize audio levels
function visualizeAudio() {
  if (!analyser) return;

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  function update() {
    analyser.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

    // Update volume number display (this will be VERY obvious)
    volumeLevel.textContent = Math.round(average);

    // Update indicator brightness based on volume
    const brightness = Math.min(100, average * 2);
    indicator.style.background = `rgb(${brightness * 0.5}, ${brightness + 155}, ${brightness * 0.5})`;

    // Log volume for debugging
    if (average > 10) {
      console.log('📊 Audio level:', Math.round(average));
    }

    animationId = requestAnimationFrame(update);
  }

  update();
}

// Speech recognition for voice commands
function startSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.error('❌ Speech recognition not supported');
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const last = event.results.length - 1;
    const transcript = event.results[last][0].transcript.toLowerCase().trim();

    console.log('🎤 You said:', transcript);
    status.textContent = `Heard: "${transcript}"`;

    // Simple command parsing
    if (transcript.includes('click button') || transcript.includes('click')) {
      console.log('🎯 Sending click command to Chrome...');
      ipcRenderer.send('send-to-chrome', {
        action: 'click',
        target: 'button'
      });

      status.textContent = '✅ Clicked button in Chrome!';
      setTimeout(() => {
        status.textContent = '🎤 Listening... (Say "click button" to test)';
      }, 2000);
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
  };

  recognition.onend = () => {
    // Auto-restart recognition
    if (mediaStream) {
      recognition.start();
    }
  };

  recognition.start();
  console.log('🎤 Speech recognition started');
}

// Clean up on window close
window.addEventListener('beforeunload', () => {
  stopListening();
});
