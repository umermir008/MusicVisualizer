// Three.js Visualizer for Music
let scene, camera, renderer, orb, analyser, audioContext, audioElement;
let animationId;
let isVisualizerRunning = false;
let particles = [];
let waveformObjects = [];
let backgroundElements = []; // New array for background elements

// Initialize the visualizer
function initVisualizer(audioEl, audioCtx) {
    audioElement = audioEl;
    audioContext = audioCtx;
    
    // Set up Three.js scene
    setupScene();
    
    // Create the orb
    createOrb();
    
    // Create particles
    createParticles();
    
    // Create background animation elements
    createBackgroundElements();
    
    // Set up audio analysis
    setupAudioAnalysis();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Initial render
    render();
}

// Set up Three.js scene
function setupScene() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0c14);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Add renderer to DOM
    const container = document.getElementById('threejs-container') || 
                     document.getElementById('visualizer-container') || 
                     document.body;
    container.appendChild(renderer.domElement);
    
    // Add orbit controls for dragging
    setupOrbitControls();
    
    // Add lighting
    addLights();
}

// Set up orbit controls
function setupOrbitControls() {
    // Simple orbit controls implementation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    // Mouse events for orbit controls
    renderer.domElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });
    
    window.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            // Rotate camera based on mouse movement
            camera.rotation.y += deltaX * 0.01;
            camera.rotation.x += deltaY * 0.01;
            
            previousMousePosition = { x: e.clientX, y: e.clientY };
        }
    });
    
    window.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

// Add lighting to the scene
function addLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Point lights for glow effect
    const pointLight1 = new THREE.PointLight(0xa855f7, 1, 100);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x06b6d4, 1, 100);
    pointLight2.position.set(-5, -5, -5);
    scene.add(pointLight2);
}

// Create the central orb
function createOrb() {
    // Create geometry and material
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    
    // Custom shader material for glow effect
    const material = new THREE.MeshPhongMaterial({
        color: 0xa855f7,
        emissive: 0x7a2dd0,
        shininess: 100,
        transparent: true,
        opacity: 0.9
    });
    
    // Create mesh
    orb = new THREE.Mesh(geometry, material);
    scene.add(orb);
}

// Create particle system
function createParticles() {
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // Generate particle positions and colors
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Random positions in a sphere
        const radius = 3 + Math.random() * 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);
        
        // Colors (purple to cyan gradient)
        colors[i3] = 0.5 + Math.random() * 0.5; // R
        colors[i3 + 1] = 0.2 + Math.random() * 0.4; // G
        colors[i3 + 2] = 0.8 + Math.random() * 0.2; // B
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Particle material
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });
    
    // Create particle system
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    particles.push(particleSystem);
}

// Create background animation elements
function createBackgroundElements() {
    const container = document.getElementById('threejs-container');
    if (!container) return;
    
    // Clear any existing elements
    backgroundElements.forEach(el => el.remove());
    backgroundElements = [];
    
    // Create 8 background elements with different sizes and positions
    for (let i = 0; i < 8; i++) {
        const element = document.createElement('div');
        element.classList.add('music-bg-animation');
        
        // Random size between 50px and 200px
        const size = 50 + Math.random() * 150;
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;
        
        // Random position
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        element.style.left = `${posX}%`;
        element.style.top = `${posY}%`;
        
        // Random animation duration
        const duration = 10 + Math.random() * 20;
        element.style.animationDuration = `${duration}s`;
        
        // Random color (purple or cyan)
        if (Math.random() > 0.5) {
            element.style.background = 'radial-gradient(circle, var(--neon-cyan) 0%, transparent 70%)';
        }
        
        container.appendChild(element);
        backgroundElements.push(element);
    }
}

// Update background elements based on audio data
function updateBackgroundElements(dataArray) {
    if (backgroundElements.length === 0) return;
    
    // Calculate average frequency for different ranges
    let bass = 0;
    for (let i = 0; i < 10; i++) {
        bass += dataArray[i];
    }
    bass /= 10;
    
    let mids = 0;
    for (let i = 10; i < 50; i++) {
        mids += dataArray[i];
    }
    mids /= 40;
    
    // Normalize values (0-1)
    bass /= 256;
    mids /= 256;
    
    // Apply effects to background elements
    backgroundElements.forEach((element, index) => {
        // Pulsing effect based on bass
        const scale = 1 + bass * 0.5;
        element.style.transform = `scale(${scale})`;
        
        // Opacity based on mids
        const opacity = 0.2 + mids * 0.3;
        element.style.opacity = opacity;
        
        // Add pulse class for stronger effects during beats
        if (bass > 0.7) {
            element.classList.add('pulse');
        } else {
            element.classList.remove('pulse');
        }
    });
}

// Set up audio analysis
function setupAudioAnalysis() {
    try {
        // Create audio analyser
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        // Connect audio element to analyser
        const source = audioContext.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
    } catch (error) {
        console.error('Error setting up audio analysis:', error);
    }
}

// Start the visualizer
function startVisualizer() {
    isVisualizerRunning = true;
    if (!animationId) {
        animate();
    }
}

// Pause the visualizer
function pauseVisualizer() {
    isVisualizerRunning = false;
}

// Stop the visualizer
function stopVisualizer() {
    isVisualizerRunning = false;
    if (orb) {
        orb.scale.set(1, 1, 1);
    }
}

// Reset the visualizer
function resetVisualizer() {
    stopVisualizer();
    if (orb) {
        orb.scale.set(1, 1, 1);
    }
}

// Resize handler
function onWindowResize() {
    if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    // Update background elements on resize
    updateBackgroundElementsOnResize();
}

// Update background elements on resize
function updateBackgroundElementsOnResize() {
    const container = document.getElementById('threejs-container');
    if (!container || backgroundElements.length === 0) return;
    
    // Update positions of background elements to fit new container size
    backgroundElements.forEach(element => {
        // Keep the same percentage positions but recalculate for new size
        const posX = parseFloat(element.style.left);
        const posY = parseFloat(element.style.top);
        // Positions are already in percentages, so they should automatically adjust
        // But we might want to re-randomize some properties
    });
}

// Resize visualizer
function resizeVisualizer() {
    onWindowResize();
}

// Animation loop
function animate() {
    animationId = requestAnimationFrame(animate);
    
    if (isVisualizerRunning && analyser) {
        // Get frequency data
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate average frequency for bass (lower frequencies)
        let bass = 0;
        for (let i = 0; i < 10; i++) {
            bass += dataArray[i];
        }
        bass /= 10;
        
        // Calculate average frequency for mids
        let mids = 0;
        for (let i = 10; i < 50; i++) {
            mids += dataArray[i];
        }
        mids /= 40;
        
        // Calculate average frequency for highs
        let highs = 0;
        for (let i = 50; i < dataArray.length; i++) {
            highs += dataArray[i];
        }
        highs /= (dataArray.length - 50);
        
        // Normalize values (0-1)
        bass /= 256;
        mids /= 256;
        highs /= 256;
        
        // Update orb based on audio
        if (orb) {
            // Scale orb with bass
            const scale = 1 + bass * 0.5;
            orb.scale.set(scale, scale, scale);
            
            // Rotate orb
            orb.rotation.x += 0.005 + mids * 0.01;
            orb.rotation.y += 0.005 + mids * 0.01;
            
            // Pulsing effect
            orb.material.emissiveIntensity = 0.5 + bass * 0.5;
        }
        
        // Update particles
        updateParticles(dataArray);
        
        // Update background elements
        updateBackgroundElements(dataArray);
    }
    
    // Rotate particles continuously
    particles.forEach((particleSystem, index) => {
        particleSystem.rotation.x += 0.001;
        particleSystem.rotation.y += 0.002;
    });
    
    // Render scene
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Update particles based on audio data
function updateParticles(dataArray) {
    particles.forEach(particleSystem => {
        const positions = particleSystem.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Get frequency data for this particle
            const freqIndex = Math.floor((i / 3) % dataArray.length);
            const freqValue = dataArray[freqIndex] / 256;
            
            // Move particles slightly based on frequency
            positions[i] += (Math.random() - 0.5) * freqValue * 0.01;
            positions[i + 1] += (Math.random() - 0.5) * freqValue * 0.01;
            positions[i + 2] += (Math.random() - 0.5) * freqValue * 0.01;
        }
        
        particleSystem.geometry.attributes.position.needsUpdate = true;
    });
}

// Render the scene
function render() {
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// Clean up resources
function disposeVisualizer() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    if (renderer) {
        renderer.dispose();
    }
    
    // Dispose geometries and materials
    if (orb) {
        orb.geometry.dispose();
        orb.material.dispose();
    }
    
    particles.forEach(particleSystem => {
        particleSystem.geometry.dispose();
        particleSystem.material.dispose();
    });
}

// Make functions available globally
window.initVisualizer = initVisualizer;
window.startVisualizer = startVisualizer;
window.pauseVisualizer = pauseVisualizer;
window.stopVisualizer = stopVisualizer;
window.resetVisualizer = resetVisualizer;
window.resizeVisualizer = resizeVisualizer;