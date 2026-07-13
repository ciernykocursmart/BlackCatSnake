// Black Cat Snake - Web Audio API Sound Synthesizer

let audioCtx = null;
let isSoundEnabled = true;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// 1. Synthesize a quick cat slurp/lick sound for eating
function playLick() {
    if (!isSoundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'triangle';
    // Fast pitch sweep upwards then down to sound like a slurp
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);
    
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    
    osc.start(now);
    osc.stop(now + 0.13);
}

// 2. Synthesize a cat hiss when the snake crashes/takes damage
function playHiss() {
    if (!isSoundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    
    // Generate white noise buffer
    const bufferSize = audioCtx.sampleRate * 0.35;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3500, now);
    filter.frequency.exponentialRampToValueAtTime(1500, now + 0.35);
    filter.Q.value = 1.2;
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    noiseNode.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    noiseNode.start(now);
    noiseNode.stop(now + 0.35);
}

// 3. Synthesize a cheerful cat meow arpeggio for victory/level clear
function playVictory() {
    if (!isSoundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    
    // Cat meow pitch sweep
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);
    osc.frequency.linearRampToValueAtTime(600, now + 0.35);
    
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    
    osc.start(now);
    osc.stop(now + 0.36);

    // Supplementary chime arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
        const oscChime = audioCtx.createOscillator();
        const gainChime = audioCtx.createGain();
        oscChime.connect(gainChime);
        gainChime.connect(audioCtx.destination);
        
        oscChime.type = 'sine';
        oscChime.frequency.setValueAtTime(freq, now + 0.1 + (index * 0.08));
        
        gainChime.gain.setValueAtTime(0.1, now + 0.1 + (index * 0.08));
        gainChime.gain.linearRampToValueAtTime(0.001, now + 0.1 + (index * 0.08) + 0.15);
        
        oscChime.start(now + 0.1 + (index * 0.08));
        oscChime.stop(now + 0.1 + (index * 0.08) + 0.15);
    });
}

// 4. Synthesize a quick click for UI buttons
function playClick() {
    if (!isSoundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.linearRampToValueAtTime(0.001, now + 0.03);
    
    osc.start(now);
    osc.stop(now + 0.03);
}
