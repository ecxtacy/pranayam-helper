# Pranayam Helper

A mobile-first web application for guided breathing exercises (Pranayam) with customizable timing and audio cues.

## Features

- **Customizable Breathing Ratios**: Set your own duration for Breathe In, Hold, and Breathe Out phases
- **Timed Sessions**: Set total duration for your pranayam practice (in minutes)
- **Audio Guidance**: Time-stretched audio cues for inhale and exhale phases with notification sounds
- **Visual Feedback**: Animated circle with color-coded phases
- **Mobile Optimized**: Designed for phone usage with elegant, minimal UI

## Setup

### Audio Files Required

Place the following audio files in the same directory as `index.html`:

1. **inhale.mp3** - Sound to play during inhale phase (will be time-stretched to match your configured duration)
2. **exhale.mp3** - Sound to play during exhale phase (will be time-stretched to match your configured duration)
3. **ting.mp3** - Short notification sound played at the end of each phase

### Running the App

1. Place your audio files in the project directory
2. Start a local web server:
   ```bash
   python3 -m http.server 8000
   ```
3. Open in browser: `http://localhost:8000`

### Mobile Access

To use on your phone:
1. Find your computer's IP address: `ip addr` or `ifconfig`
2. On your phone's browser, navigate to: `http://YOUR_IP:8000`
3. Add to home screen for app-like experience

## How It Works

### Audio Playback Sequence

1. **Breathe In Phase**: 
   - Plays `inhale.mp3` stretched to match configured duration
   - Plays `ting.mp3` at the end

2. **Hold Phase**: 
   - Silence for configured duration
   - Plays `ting.mp3` at the end

3. **Breathe Out Phase**: 
   - Plays `exhale.mp3` stretched to match configured duration
   - Plays `ting.mp3` at the end
   - Loops back to Breathe In phase

The audio stretching is done using the Web Audio API's playback rate adjustment, which maintains audio quality while adapting to your custom timing.

## Usage

1. **Configure Your Ratio**: Set seconds for Breathe In, Hold, and Breathe Out
2. **Set Duration**: Choose total practice time (in minutes)
3. **Start**: Press "Start Pranayam" to begin
4. **Follow**: Follow the visual and audio cues
5. **Stop**: Press "Stop" to end early, or let it finish automatically

## Popular Breathing Ratios

- **4-7-8**: Relaxation and sleep (default)
- **4-4-4**: Box breathing for focus
- **5-5-5**: Balanced breathing
- **6-6-6**: Deep relaxation

## Technologies

- Pure HTML, CSS, and JavaScript
- Web Audio API for time-stretching
- Mobile-optimized responsive design
- No dependencies or frameworks
