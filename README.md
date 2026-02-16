# 3D AI Music Visualizer

A responsive, interactive front-end website where music playback controls a live 3D visualizer using HTML, TailwindCSS, JavaScript, Three.js, and GSAP.

## Features

- **Hero Section**: Dark fullscreen background with a 3D glowing orb that rotates and pulses
- **Visualizer Section**: 3D shapes that morph with the beat and lights that flash in sync with bass frequencies
- **Music Controls**: Play, Pause, Stop buttons with progress bar and volume slider
- **Features Section**: Three glowing cards with hover effects powered by GSAP
- **Gallery Section**: Grid of screenshots with Unsplash images as placeholders
- **Playlist Section**: Curated playlist with interactive track selection

## Technologies Used

- HTML5
- TailwindCSS
- JavaScript (ES6+)
- Three.js for 3D graphics
- GSAP for animations
- Web Audio API for sound analysis

## How to Run

1. Simply open `index.html` in any modern web browser
2. Click the "Play Music" button to start the visualization
3. Use the music controls to play/pause/stop, adjust volume, and seek through the track
4. Drag the visualizer to orbit the camera view
5. Click on any track in the playlist to select it (demo functionality)

## Default Music Track

The project uses a default track from SoundHelix:
https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3

## Uploading Your Own Music

You can upload your own MP3 files using the file upload control in the music section.

## Project Structure

```
.
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   └── three-visualizer.js
└── README.md
```

## Browser Compatibility

This project works best in modern browsers that support:
- WebGL (for Three.js)
- Web Audio API
- ES6 JavaScript features

## Notes

- This is a front-end only application with no backend requirements
- All visualizations are generated in real-time based on the audio input
- The 3D visualizer includes a fallback for devices that don't support WebGL
- Playlist functionality is for demonstration purposes in this frontend-only implementation

## Customization

You can customize the colors, effects, and behaviors by modifying:
- `css/style.css` for styling and effects
- `js/main.js` for UI interactions
- `js/three-visualizer.js` for 3D visualization logic