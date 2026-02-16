// DOM Elements
const playBtn = document.getElementById('playBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const audioElement = document.getElementById('audioElement');
const progressBar = document.getElementById('progressBar');
const currentTimeDisplay = document.getElementById('currentTime');
const totalTimeDisplay = document.getElementById('totalTime');
const volumeSlider = document.getElementById('volumeSlider');
const muteBtn = document.getElementById('muteBtn');
const loadDefaultTrackBtn = document.getElementById('loadDefaultTrack');
const uploadTrackInput = document.getElementById('uploadTrack');
const visualizerModeSelect = document.getElementById('visualizerMode');
const speedControlSelect = document.getElementById('speedControl');
const qualityControlSelect = document.getElementById('qualityControl');
const repeatBtn = document.getElementById('repeatBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const playButton = document.getElementById('playButton'); // Hero section play button

// Audio state variables
let isPlaying = false;
let isMuted = false;
let currentVolume = 1;
let repeatMode = false;
let shuffleMode = false;
let audioContext;
let heroBackgroundElements = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    setupEventListeners();
    
    // Initialize visualizer
    initVisualizer();
    
    // Update time displays
    updateTotalTime();
    
    // Create hero section background animations
    createHeroBackgroundAnimations();
    
    // Set up audio context initialization on first user interaction
    document.body.addEventListener('click', initAudioContext, { once: true });
    document.body.addEventListener('touchstart', initAudioContext, { once: true });
});

// Initialize audio context on first user interaction
function initAudioContext() {
    if (!audioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
    }
}

// Set up event listeners
function setupEventListeners() {
    playBtn.addEventListener('click', playAudio);
    pauseBtn.addEventListener('click', pauseAudio);
    stopBtn.addEventListener('click', stopAudio);
    progressBar.addEventListener('input', seekAudio);
    volumeSlider.addEventListener('input', changeVolume);
    muteBtn.addEventListener('click', toggleMute);
    loadDefaultTrackBtn.addEventListener('click', loadDefaultTrack);
    uploadTrackInput.addEventListener('change', uploadTrack);
    visualizerModeSelect.addEventListener('change', changeVisualizerMode);
    speedControlSelect.addEventListener('change', changeSpeed);
    qualityControlSelect.addEventListener('change', changeQuality);
    repeatBtn.addEventListener('click', toggleRepeat);
    shuffleBtn.addEventListener('click', toggleShuffle);
    playButton.addEventListener('click', playDefaultTrack); // Hero section play button
    
    // Audio element events
    audioElement.addEventListener('timeupdate', updateProgress);
    audioElement.addEventListener('ended', handleAudioEnd);
    audioElement.addEventListener('loadedmetadata', updateTotalTime);

    // Add audio analysis for hero background
    audioElement.addEventListener('timeupdate', function() {
        // Only update if we have the necessary audio analysis capabilities
        if (isPlaying && audioContext && typeof window.updateHeroBackgroundWithAudio === 'function') {
            window.updateHeroBackgroundWithAudio();
        }
    });

}

// Global variables for audio analysis
let analyser;
let audioDataArray;

// Update hero background with audio analysis
function updateHeroBackgroundWithAudio() {
    // If we don't have an analyser, create one
    if (!analyser && audioContext) {
        try {
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            
            // Connect audio element to analyser
            const source = audioContext.createMediaElementSource(audioElement);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
        } catch (error) {
            console.error('Error setting up audio analysis:', error);
            return;
        }
    }
    
    // If we have an analyser, get frequency data
    if (analyser) {
        if (!audioDataArray) {
            audioDataArray = new Uint8Array(analyser.frequencyBinCount);
        }
        
        analyser.getByteFrequencyData(audioDataArray);
        
        // Calculate average frequency for bass (lower frequencies)
        let bass = 0;
        for (let i = 0; i < 10; i++) {
            bass += audioDataArray[i];
        }
        bass /= 10;
        
        // Calculate average frequency for mids
        let mids = 0;
        for (let i = 10; i < 50; i++) {
            mids += audioDataArray[i];
        }
        mids /= 40;
        
        // Normalize values (0-1)
        bass /= 256;
        mids /= 256;
        
        // Update hero background elements
        updateHeroBackgroundElements(bass, mids);
    }
}

// Update hero background elements based on audio data
function updateHeroBackgroundElements(bass, mids) {
    if (heroBackgroundElements.length === 0 || typeof gsap === 'undefined') return;
    
    heroBackgroundElements.forEach((element, index) => {
        // Pulsing effect based on bass
        gsap.to(element, {
            scale: 1 + bass * 0.5,
            duration: 0.2,
            ease: "power1.out"
        });
        
        // Opacity based on mids
        gsap.to(element, {
            opacity: 0.1 + mids * 0.4,
            duration: 0.2,
            ease: "power1.out"
        });
        
        // Add glow effect during beats
        if (bass > 0.7) {
            gsap.to(element, {
                duration: 0.1,
                ease: "power2.out",
                onComplete: function() {
                    gsap.to(element, {
                        filter: "blur(15px) brightness(1.8)",
                        duration: 0.2,
                        yoyo: true,
                        repeat: 1
                    });
                }
            });
        }
    });
}

// Make function available globally
window.updateHeroBackgroundWithAudio = updateHeroBackgroundWithAudio;

// Play audio
function playAudio() {
    audioElement.play();
    isPlaying = true;
    updatePlayButtonState();
    
    // Start visualizer if available
    if (typeof window.startVisualizer === 'function') {
        window.startVisualizer();
    }
    
    // Start updating hero background with audio
    if (audioContext) {
        updateHeroBackgroundWithAudio();
        // Continue updating
        const updateLoop = () => {
            if (isPlaying) {
                updateHeroBackgroundWithAudio();
                requestAnimationFrame(updateLoop);
            }
        };
        updateLoop();
    }
}

// Play default track from hero section
function playDefaultTrack() {
    loadDefaultTrack();
    // Initialize audio context on first user interaction
    if (!audioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
    }
    playAudio();
}

// Pause audio
function pauseAudio() {
    audioElement.pause();
    isPlaying = false;
    updatePlayButtonState();
    
    // Pause visualizer if available
    if (typeof window.pauseVisualizer === 'function') {
        window.pauseVisualizer();
    }
}

// Stop audio
function stopAudio() {
    audioElement.pause();
    audioElement.currentTime = 0;
    isPlaying = false;
    updatePlayButtonState();
    updateProgress();
    
    // Stop visualizer if available
    if (typeof window.stopVisualizer === 'function') {
        window.stopVisualizer();
    }
}

// Seek audio
function seekAudio() {
    const seekTime = (progressBar.value / 100) * audioElement.duration;
    audioElement.currentTime = seekTime;
}

// Update progress bar and time display
function updateProgress() {
    if (audioElement.duration) {
        const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
        progressBar.value = progressPercent;
        
        // Update time display
        currentTimeDisplay.textContent = formatTime(audioElement.currentTime);
    }
}

// Update total time display
function updateTotalTime() {
    if (audioElement.duration) {
        totalTimeDisplay.textContent = formatTime(audioElement.duration);
    } else {
        totalTimeDisplay.textContent = '0:00';
    }
}

// Format time in mm:ss
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Change volume
function changeVolume() {
    audioElement.volume = volumeSlider.value;
    currentVolume = volumeSlider.value;
    updateMuteButtonState();
}

// Toggle mute
function toggleMute() {
    isMuted = !isMuted;
    audioElement.volume = isMuted ? 0 : currentVolume;
    volumeSlider.value = isMuted ? 0 : currentVolume;
    updateMuteButtonState();
}

// Update mute button state
function updateMuteButtonState() {
    if (isMuted || audioElement.volume === 0) {
        muteBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
        `;
    } else {
        muteBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M12 6a9 9 0 010 12m-5.5-7.5h.01" />
            </svg>
        `;
    }
}

// Load default track
function loadDefaultTrack() {
    // For demo purposes, we'll use a placeholder
    // In a real application, you would load an actual audio file
    audioElement.src = 'https://assets.codepen.io/1468070/Alan_Walker_-_Faded.mp3';
    
    // Initialize audio context on first user interaction
    if (!audioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
    }
}

// Upload track
function uploadTrack(e) {
    const file = e.target.files[0];
    if (file) {
        const fileURL = URL.createObjectURL(file);
        audioElement.src = fileURL;
        
        // Initialize audio context on first user interaction
        if (!audioContext) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
        }
    }
}

// Change visualizer mode
function changeVisualizerMode() {
    // This would interact with the Three.js visualizer
    console.log('Visualizer mode changed to:', visualizerModeSelect.value);
}

// Change playback speed
function changeSpeed() {
    audioElement.playbackRate = parseFloat(speedControlSelect.value);
}

// Change quality
function changeQuality() {
    // This would affect the visualizer quality
    console.log('Quality changed to:', qualityControlSelect.value);
}

// Toggle repeat mode
function toggleRepeat() {
    repeatMode = !repeatMode;
    repeatBtn.classList.toggle('bg-purple-600', repeatMode);
}

// Toggle shuffle mode
function toggleShuffle() {
    shuffleMode = !shuffleMode;
    shuffleBtn.classList.toggle('bg-purple-600', shuffleMode);
}

// Handle audio end
function handleAudioEnd() {
    if (repeatMode) {
        playAudio();
    } else {
        isPlaying = false;
        updatePlayButtonState();
        
        // Stop visualizer if available
        if (typeof window.stopVisualizer === 'function') {
            window.stopVisualizer();
        }
    }
}

// Update play button state
function updatePlayButtonState() {
    if (isPlaying) {
        playBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        `;
    } else {
        playBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        `;
    }
}

// Initialize visualizer
function initVisualizer() {
    // This function initializes the Three.js visualizer
    console.log('Initializing 3D visualizer...');
    
    // Initialize the Three.js visualizer with the audio element
    if (typeof window.initVisualizer === 'function') {
        // Create audio context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        // We'll initialize the audio context on first user interaction
        // since it requires user gesture in modern browsers
    }
    
    // Placeholder for visualizer initialization
    // Actual implementation would be in three-visualizer.js
}

// Create hero section background animations
function createHeroBackgroundAnimations() {
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;
    
    // Clear any existing elements
    heroBackgroundElements.forEach(el => el.remove());
    heroBackgroundElements = [];
    
    // Create 6 background elements with different sizes and positions
    for (let i = 0; i < 6; i++) {
        const element = document.createElement('div');
        element.classList.add('hero-bg-animation');
        
        // Random size between 100px and 300px
        const size = 100 + Math.random() * 200;
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;
        
        // Random position
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        element.style.left = `${posX}%`;
        element.style.top = `${posY}%`;
        
        // Random color class
        const colors = ['purple', 'cyan', 'pink'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        if (randomColor !== 'purple') {
            element.classList.add(randomColor);
        }
        
        heroSection.appendChild(element);
        heroBackgroundElements.push(element);
    }
    
    // Animate the background elements with GSAP
    animateHeroBackground();
}

// Animate hero background elements with GSAP
function animateHeroBackground() {
    if (typeof gsap !== 'undefined' && heroBackgroundElements.length > 0) {
        heroBackgroundElements.forEach((element, index) => {
            // Random movement paths
            const duration = 15 + Math.random() * 20;
            const xDistance = (Math.random() - 0.5) * 200;
            const yDistance = (Math.random() - 0.5) * 200;
            
            gsap.to(element, {
                x: xDistance,
                y: yDistance,
                duration: duration,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut",
                delay: index * 0.5
            });
        });
    }
}
