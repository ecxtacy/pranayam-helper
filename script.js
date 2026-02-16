// Screen elements
const configScreen = document.getElementById('configScreen');
const breathingScreen = document.getElementById('breathingScreen');

// Config elements
const breatheInInput = document.getElementById('breatheIn');
const holdInput = document.getElementById('hold');
const breatheOutInput = document.getElementById('breatheOut');
const totalDurationInput = document.getElementById('totalDuration');
const startBtn = document.getElementById('startBtn');

// Breathing elements
const timeRemaining = document.getElementById('timeRemaining');
const breathingCircle = document.getElementById('breathingCircle');
const breathingText = document.getElementById('breathingText');
const breathingTimer = document.getElementById('breathingTimer');
const stopBtn = document.getElementById('stopBtn');

// Audio elements (preloaded in HTML)
const inhaleAudio = document.getElementById('inhaleAudio');
const holdAudio = document.getElementById('holdAudio');
const exhaleAudio = document.getElementById('exhaleAudio');
let currentPlayingAudio = null;

// Set audio volumes
inhaleAudio.volume = 1.0;
holdAudio.volume = 1.0;
exhaleAudio.volume = 1.0;

// Mobile audio unlock flag
let audioUnlocked = false;
let audioLoaded = false;

// Check if all audio files are loaded
function checkAudioLoaded() {
    const allAudio = [inhaleAudio, holdAudio, exhaleAudio];
    const allLoaded = allAudio.every(audio => audio.readyState >= 2);
    
    if (allLoaded && !audioLoaded) {
        audioLoaded = true;
        startBtn.disabled = false;
        startBtn.textContent = 'Start Pranayam';
        console.log('All audio files loaded');
    }
}

// Unlock audio for mobile browsers (iOS Safari, etc.)
function unlockAudio() {
    if (audioUnlocked) return Promise.resolve();
    
    return Promise.all([
        // Play and immediately pause each audio to unlock them on mobile
        inhaleAudio.play().then(() => { inhaleAudio.pause(); inhaleAudio.currentTime = 0; }).catch(() => {}),
        holdAudio.play().then(() => { holdAudio.pause(); holdAudio.currentTime = 0; }).catch(() => {}),
        exhaleAudio.play().then(() => { exhaleAudio.pause(); exhaleAudio.currentTime = 0; }).catch(() => {})
    ]).then(() => {
        audioUnlocked = true;
        console.log('Audio unlocked for mobile');
    }).catch(() => {
        console.log('Audio unlock attempted');
    });
}

// State
let breathingInterval = null;
let totalDurationInterval = null;
let currentPhase = 'breatheIn';
let phaseTimeRemaining = 0;
let totalSecondsRemaining = 0;
let breathingConfig = {
    breatheIn: 4,
    hold: 7,
    breatheOut: 8
};

// Switch screens
function showScreen(screen) {
    [configScreen, breathingScreen].forEach(s => {
        s.classList.remove('active');
    });
    screen.classList.add('active');
}

// Audio playback with time stretching
function playStretchedAudio(audio, targetDuration) {
    return new Promise((resolve) => {
        // Stop any currently playing audio
        if (currentPlayingAudio) {
            currentPlayingAudio.pause();
            currentPlayingAudio.currentTime = 0;
        }
        
        audio.currentTime = 0;
        currentPlayingAudio = audio;
        
        // Wait for audio to load metadata
        const playAudio = () => {
            const originalDuration = audio.duration;
            if (originalDuration && originalDuration > 0) {
                // Calculate playback rate to stretch/compress audio
                audio.playbackRate = originalDuration / targetDuration;
                
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => {
                        console.error('Audio play error:', e);
                        // Still resolve so breathing exercise continues
                        setTimeout(resolve, targetDuration * 1000);
                    });
                }
                
                // Resolve when audio ends
                audio.onended = () => {
                    currentPlayingAudio = null;
                    resolve();
                };
            } else {
                // Fallback: just wait for target duration
                setTimeout(resolve, targetDuration * 1000);
            }
        };
        
        if (audio.readyState >= 2) {
            playAudio();
        } else {
            audio.addEventListener('loadedmetadata', playAudio, { once: true });
        }
    });
}

function stopAllAudio() {
    [inhaleAudio, holdAudio, exhaleAudio].forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
    currentPlayingAudio = null;
}

// Start button handler
startBtn.addEventListener('click', async () => {
    // Unlock audio on first user interaction (required for mobile)
    await unlockAudio();
    
    breathingConfig.breatheIn = parseInt(breatheInInput.value) || 4;
    breathingConfig.hold = parseInt(holdInput.value) || 7;
    breathingConfig.breatheOut = parseInt(breatheOutInput.value) || 8;
    
    const durationMinutes = parseInt(totalDurationInput.value) || 5;
    totalSecondsRemaining = durationMinutes * 60;
    
    startBreathing();
});

// Format time as MM:SS
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Update total time remaining display
function updateTotalTimeDisplay() {
    timeRemaining.textContent = formatTime(totalSecondsRemaining);
}

// Breathing functionality
function startBreathing() {
    showScreen(breathingScreen);
    updateTotalTimeDisplay();
    
    // Start total duration countdown
    totalDurationInterval = setInterval(() => {
        totalSecondsRemaining--;
        updateTotalTimeDisplay();
        
        if (totalSecondsRemaining <= 0) {
            stopBreathing();
        }
    }, 1000);
    
    currentPhase = 'breatheIn';
    startPhase('breatheIn', breathingConfig.breatheIn);
}

async function startPhase(phase, duration) {
    currentPhase = phase;
    phaseTimeRemaining = duration;
    
    // Update UI based on phase
    breathingCircle.className = 'breathing-circle ' + phase.replace(/([A-Z])/g, '-$1').toLowerCase();
    breathingCircle.style.setProperty('--duration', duration + 's');
    
    if (phase === 'breatheIn') {
        breathingText.textContent = 'Breathe In';
    } else if (phase === 'hold') {
        breathingText.textContent = 'Hold';
    } else if (phase === 'breatheOut') {
        breathingText.textContent = 'Breathe Out';
    }
    
    breathingTimer.textContent = phaseTimeRemaining;
    
    // Clear any existing interval
    if (breathingInterval) {
        clearInterval(breathingInterval);
    }
    
    // Start audio based on phase
    if (phase === 'breatheIn') {
        // Play stretched inhale audio
        playStretchedAudio(inhaleAudio, duration);
    } else if (phase === 'hold') {
        // Play stretched hold audio
        playStretchedAudio(holdAudio, duration);
    } else if (phase === 'breatheOut') {
        // Play stretched exhale audio
        playStretchedAudio(exhaleAudio, duration);
    }
    
    // Start countdown
    breathingInterval = setInterval(() => {
        phaseTimeRemaining--;
        breathingTimer.textContent = phaseTimeRemaining;
        
        if (phaseTimeRemaining <= 0) {
            clearInterval(breathingInterval);
            handlePhaseEnd();
        }
    }, 1000);
}

function handlePhaseEnd() {
    // Move to next phase
    moveToNextPhase();
}

function moveToNextPhase() {
    if (currentPhase === 'breatheIn') {
        if (breathingConfig.hold > 0) {
            startPhase('hold', breathingConfig.hold);
        } else {
            startPhase('breatheOut', breathingConfig.breatheOut);
        }
    } else if (currentPhase === 'hold') {
        startPhase('breatheOut', breathingConfig.breatheOut);
    } else if (currentPhase === 'breatheOut') {
        // Loop back to breathe in
        startPhase('breatheIn', breathingConfig.breatheIn);
    }
}

function stopBreathing() {
    clearInterval(breathingInterval);
    clearInterval(totalDurationInterval);
    breathingInterval = null;
    totalDurationInterval = null;
    stopAllAudio();
    showScreen(configScreen);
}

stopBtn.addEventListener('click', () => {
    stopBreathing();
});

// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Initialize: disable start button until audio loads
startBtn.disabled = true;
startBtn.textContent = 'Loading Audio...';

// Add event listeners to check when audio is loaded
[inhaleAudio, holdAudio, exhaleAudio].forEach(audio => {
    audio.addEventListener('loadeddata', checkAudioLoaded);
    audio.addEventListener('canplaythrough', checkAudioLoaded);
});

// Initial check in case audio is already loaded
checkAudioLoaded();
