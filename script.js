// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  initCursorHearts();
  initBackgroundCanvas();
  initGiftBox();
  initLockSlider();
  initBabyIntro();
  initGreeting();
  initIceCreamGate();
  initSlider();
  initMemoryGame();
  initMusic();
  initReasonsBox();
  initTimelineAndCounter();
  initGameGate();
  initGame();
  initScratchCard();
  initTypewriter();
  initCard();
  initLastSurpriseChain();
  initEvasiveButtons();
  initSecretHeart();
  initFinalStarryEnding();
});

// --- AUDIO SYNTHESIZER (MUSIC BOX TUNE) ---
let audioCtx = null;
let musicInterval = null;
let isPlaying = false;
let currentNoteIndex = 0;
let notesInterval = null;
let bgAudio = null;
let isUsingSynth = false;

const MELODY = [
  { freq: 392.00, dur: 0.75 }, // G4
  { freq: 392.00, dur: 0.25 }, // G4
  { freq: 440.00, dur: 1.0 },  // A4
  { freq: 392.00, dur: 1.0 },  // G4
  { freq: 523.25, dur: 1.0 },  // C5
  { freq: 493.88, dur: 2.0 },  // B4
  
  { freq: 392.00, dur: 0.75 }, // G4
  { freq: 392.00, dur: 0.25 }, // G4
  { freq: 440.00, dur: 1.0 },  // A4
  { freq: 392.00, dur: 1.0 },  // G4
  { freq: 587.33, dur: 1.0 },  // D5
  { freq: 523.25, dur: 2.0 },  // C5
  
  { freq: 392.00, dur: 0.75 }, // G4
  { freq: 392.00, dur: 0.25 }, // G4
  { freq: 783.99, dur: 1.0 },  // G5
  { freq: 659.25, dur: 1.0 },  // E5
  { freq: 523.25, dur: 1.0 },  // C5
  { freq: 493.88, dur: 1.0 },  // B4
  { freq: 440.00, dur: 2.0 },  // A4
  
  { freq: 698.46, dur: 0.75 }, // F5
  { freq: 698.46, dur: 0.25 }, // F5
  { freq: 659.25, dur: 1.0 },  // E5
  { freq: 523.25, dur: 1.0 },  // C5
  { freq: 587.33, dur: 1.0 },  // D5
  { freq: 523.25, dur: 2.5 }   // C5
];

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
}

function playTone(freq, duration, type = "triangle", gainValue = 0.25) {
  initAudioContext();
  if (!audioCtx) return;
  
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(gainValue, audioCtx.currentTime + 0.04);
  gainNode.gain.setValueAtTime(gainValue, audioCtx.currentTime + 0.04); // Set start value for exponential ramp
  gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + duration);
}

function playChime() {
  playTone(523.25, 0.15, "sine", 0.15); // C5
  setTimeout(() => playTone(659.25, 0.15, "sine", 0.15), 100); // E5
  setTimeout(() => playTone(783.99, 0.3, "sine", 0.15), 200); // G5
}

function playErrorTone() {
  playTone(180, 0.25, "sawtooth", 0.1);
}

function playSuccessChime() {
  playTone(440, 0.1, "sine");
  setTimeout(() => playTone(554.37, 0.1, "sine"), 80);
  setTimeout(() => playTone(659.25, 0.1, "sine"), 160);
  setTimeout(() => playTone(880.00, 0.4, "sine"), 240);
}

function startMusic() {
  isPlaying = true;
  isUsingSynth = false;
  
  if (notesInterval) clearInterval(notesInterval);
  notesInterval = setInterval(spawnFloatingNote, 400);
  
  // Synchronize UI elements
  const floatBtn = document.getElementById("floating-music-btn");
  if (floatBtn) {
    floatBtn.classList.add("playing");
    const tooltip = floatBtn.querySelector(".music-tooltip");
    if (tooltip) tooltip.innerText = "Pause Tune ⏸️";
  }
  const mainVinyl = document.getElementById("vinyl-player-btn");
  if (mainVinyl) {
    mainVinyl.classList.add("playing");
  }
  const stateText = document.getElementById("music-state-text");
  if (stateText) {
    stateText.innerText = "Playing a sweet birthday tune for my love... 🎵";
  }
  
  // Start the lyric text typing overlay if on Level 4
  const activeSongLevel = document.getElementById("level-song");
  if (activeSongLevel && activeSongLevel.classList.contains("active")) {
    startLyricsOverlay();
  }
  
  if (!bgAudio) {
    bgAudio = new Audio("https://www.chosic.com/wp-content/uploads/2022/09/Happy-Birthday-Music-Box.mp3");
    bgAudio.loop = true;
  }
  
  bgAudio.play().then(() => {
    console.log("Playing Happy Birthday MP3 music box...");
  }).catch(err => {
    console.warn("HTML5 audio playback blocked or failed, falling back to synth melody:", err);
    // Fallback to Web Audio synthesizer
    isUsingSynth = true;
    currentNoteIndex = 0;
    playNextNote();
  });
}

function playNextNote() {
  if (!isPlaying || !isUsingSynth) return;
  
  const noteObj = MELODY[currentNoteIndex];
  const beatDuration = 0.55; // 110 bpm approx
  const duration = noteObj.dur * beatDuration;
  
  playTone(noteObj.freq, duration * 1.5, "triangle", 0.2);
  
  currentNoteIndex = (currentNoteIndex + 1) % MELODY.length;
  musicInterval = setTimeout(playNextNote, duration * 1000);
}

function stopMusic() {
  isPlaying = false;
  isUsingSynth = false;
  
  // Stop lyrics overlay
  stopLyricsOverlay();
  
  // Synchronize UI elements
  const floatBtn = document.getElementById("floating-music-btn");
  if (floatBtn) {
    floatBtn.classList.remove("playing");
    const tooltip = floatBtn.querySelector(".music-tooltip");
    if (tooltip) tooltip.innerText = "Play Tune 🎵";
  }
  const mainVinyl = document.getElementById("vinyl-player-btn");
  if (mainVinyl) {
    mainVinyl.classList.remove("playing");
  }
  const stateText = document.getElementById("music-state-text");
  if (stateText) {
    stateText.innerText = "Paused 🎵 Click to resume";
  }
  
  if (bgAudio) {
    bgAudio.pause();
  }
  if (musicInterval) {
    clearTimeout(musicInterval);
  }
  if (notesInterval) {
    clearInterval(notesInterval);
    notesInterval = null;
  }
}

function spawnFloatingNote() {
  const container = document.querySelector(".music-player-container");
  if (!container) return;
  
  const note = document.createElement("div");
  note.classList.add("floating-note");
  
  const noteSymbols = ["🎵", "🎶", "♩", "♪", "🎹", "✨"];
  note.innerText = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];
  
  const xOffset = `${Math.random() * 120 - 60}px`;
  const rotation = `${Math.random() * 90 - 45}deg`;
  
  note.style.setProperty("--x-offset", xOffset);
  note.style.setProperty("--rotation", rotation);
  
  container.appendChild(note);
  
  setTimeout(() => {
    note.remove();
  }, 2500);
}


// --- CURSOR HEARTS TRAILER ---
function initCursorHearts() {
  const container = document.getElementById("hearts-pointer-container");
  
  const spawnHeart = (x, y) => {
    const heart = document.createElement("div");
    heart.classList.add("cursor-heart");
    heart.innerText = Math.random() < 0.3 ? "✨" : "❤️";
    
    const offsetX = Math.random() * 16 - 8;
    const offsetY = Math.random() * 16 - 8;
    
    heart.style.left = `${x + offsetX}px`;
    heart.style.top = `${y + offsetY}px`;
    
    const scale = Math.random() * 0.6 + 0.6;
    heart.style.transform = `scale(${scale})`;
    
    container.appendChild(heart);
    
    setTimeout(() => {
      heart.remove();
    }, 1200);
  };

  window.addEventListener("mousemove", (e) => {
    if (Math.random() < 0.25) {
      spawnHeart(e.pageX, e.pageY);
    }
  });

  window.addEventListener("touchmove", (e) => {
    if (Math.random() < 0.25) {
      const touch = e.touches[0];
      spawnHeart(touch.pageX, touch.pageY);
    }
  });
}


// --- CANVAS EFFECTS (BACKGROUND CONFETTI & PARTICLES) ---
let bgCanvas, bgCtx;
let bgHearts = [];
let bgConfetti = [];
let fireworks = [];
let fireworkParticles = [];
let isFireworksActive = false;

function initBackgroundCanvas() {
  bgCanvas = document.getElementById("canvas-bg");
  bgCtx = bgCanvas.getContext("2d");
  
  const resizeBg = () => {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  };
  resizeBg();
  window.addEventListener("resize", resizeBg);
  
  animateBg();
  
  window.addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON" && e.target.tagName !== "INPUT" && !e.target.closest("#lock-track") && !e.target.closest("#scratch-canvas")) {
      spawnHeartsBurst(e.clientX, e.clientY);
    }
  });
}

class BGHeart {
  constructor(x, y, isBurst = false) {
    this.x = x;
    this.y = y;
    this.size = isBurst ? Math.random() * 8 + 4 : Math.random() * 10 + 6;
    this.speedY = isBurst ? (Math.random() * 3.5 - 1.5) : -(Math.random() * 1.2 + 0.5);
    this.speedX = isBurst ? (Math.random() * 4 - 2) : (Math.random() * 0.6 - 0.3);
    this.opacity = 1;
    this.fade = isBurst ? Math.random() * 0.02 + 0.015 : Math.random() * 0.004 + 0.002;
    this.color = `hsl(${Math.random() * 20 + 340}, 90%, 65%)`; // Pink-red
  }

  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.opacity -= this.fade;
  }

  draw() {
    bgCtx.save();
    bgCtx.globalAlpha = this.opacity;
    bgCtx.fillStyle = this.color;
    
    bgCtx.beginPath();
    const d = this.size;
    bgCtx.moveTo(this.x, this.y + d / 4);
    bgCtx.quadraticCurveTo(this.x, this.y, this.x + d / 2, this.y);
    bgCtx.quadraticCurveTo(this.x + d, this.y, this.x + d, this.y + d / 3);
    bgCtx.quadraticCurveTo(this.x + d, this.y + (d * 2) / 3, this.x + d / 2, this.y + d);
    bgCtx.quadraticCurveTo(this.x - d, this.y + (d * 2) / 3, this.x - d, this.y + d / 3);
    bgCtx.quadraticCurveTo(this.x - d, this.y, this.x - d / 2, this.y);
    bgCtx.quadraticCurveTo(this.x, this.y, this.x, this.y + d / 4);
    bgCtx.closePath();
    bgCtx.fill();
    bgCtx.restore();
  }
}

class BGConfetti {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 7 + 4;
    this.speedY = Math.random() * 5 + 2;
    this.speedX = Math.random() * 6 - 3;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 8 - 4;
    this.color = `hsl(${Math.random() * 360}, 90%, 65%)`;
    this.gravity = 0.12;
  }

  update() {
    this.speedY += this.gravity;
    this.y += this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotationSpeed;
  }

  draw() {
    bgCtx.save();
    bgCtx.translate(this.x, this.y);
    bgCtx.rotate((this.rotation * Math.PI) / 180);
    bgCtx.fillStyle = this.color;
    bgCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    bgCtx.restore();
  }
}

function spawnHeartsBurst(x, y) {
  for (let i = 0; i < 15; i++) {
    bgHearts.push(new BGHeart(x, y, true));
  }
}

function triggerBGConfettiBurst() {
  for (let i = 0; i < 80; i++) {
    bgConfetti.push(new BGConfetti(window.innerWidth / 2, window.innerHeight / 2 - 100));
  }
}

class Firework {
  constructor(targetX, targetY) {
    this.x = Math.random() * bgCanvas.width;
    this.y = bgCanvas.height;
    this.targetX = targetX;
    this.targetY = targetY;
    this.speed = Math.random() * 5 + 6;
    this.angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
    this.speedX = Math.cos(this.angle) * this.speed;
    this.speedY = Math.sin(this.angle) * this.speed;
    this.size = 3;
    this.color = `hsl(${Math.random() * 360}, 100%, 65%)`;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.speedY >= 0 || this.y <= this.targetY) {
      explodeFirework(this.x, this.y, this.color);
      return false; // delete
    }
    return true;
  }

  draw() {
    bgCtx.save();
    bgCtx.fillStyle = this.color;
    bgCtx.beginPath();
    bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    bgCtx.fill();
    bgCtx.restore();
  }
}

class FireworkParticle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 2 + 1;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 4 + 1.5;
    this.speedX = Math.cos(this.angle) * this.speed;
    this.speedY = Math.sin(this.angle) * this.speed;
    this.opacity = 1;
    this.fade = Math.random() * 0.015 + 0.008;
    this.gravity = 0.06;
    this.color = color;
  }

  update() {
    this.speedY += this.gravity;
    this.x += this.speedX;
    this.y += this.speedY;
    this.opacity -= this.fade;
  }

  draw() {
    bgCtx.save();
    bgCtx.globalAlpha = this.opacity;
    bgCtx.fillStyle = this.color;
    bgCtx.beginPath();
    bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    bgCtx.fill();
    bgCtx.restore();
  }
}

function explodeFirework(x, y, color) {
  for (let i = 0; i < 35; i++) {
    fireworkParticles.push(new FireworkParticle(x, y, color));
  }
  if (audioCtx) {
    playTone(180 + Math.random() * 100, 0.2, "sine", 0.04);
  }
}

function animateBg() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  
  if (Math.random() < 0.02 && bgHearts.filter(h => h.speedY < 0).length < 18) {
    bgHearts.push(new BGHeart(Math.random() * bgCanvas.width, bgCanvas.height + 20));
  }
  
  // Fireworks launch
  if (isFireworksActive && Math.random() < 0.035 && fireworks.length < 5) {
    fireworks.push(new Firework(Math.random() * bgCanvas.width, Math.random() * (bgCanvas.height * 0.5) + 50));
  }
  
  for (let i = bgHearts.length - 1; i >= 0; i--) {
    bgHearts[i].update();
    bgHearts[i].draw();
    if (bgHearts[i].opacity <= 0) {
      bgHearts.splice(i, 1);
    }
  }

  for (let i = bgConfetti.length - 1; i >= 0; i--) {
    bgConfetti[i].update();
    bgConfetti[i].draw();
    if (bgConfetti[i].y > bgCanvas.height + 20) {
      bgConfetti.splice(i, 1);
    }
  }
  
  // Draw fireworks
  for (let i = fireworks.length - 1; i >= 0; i--) {
    if (!fireworks[i].update()) {
      fireworks.splice(i, 1);
    } else {
      fireworks[i].draw();
    }
  }
  
  // Draw firework particles
  for (let i = fireworkParticles.length - 1; i >= 0; i--) {
    fireworkParticles[i].update();
    fireworkParticles[i].draw();
    if (fireworkParticles[i].opacity <= 0) {
      fireworkParticles.splice(i, 1);
    }
  }
  
  requestAnimationFrame(animateBg);
}


// --- GENERAL NAVIGATION STATE ---
function goToLevel(levelId) {
  document.querySelectorAll(".level").forEach(lvl => {
    lvl.classList.remove("active");
  });
  
  const targetLevel = document.getElementById(levelId);
  targetLevel.classList.add("active");
  
  playChime();
  triggerBGConfettiBurst();
  
  // Toggle floating music button visibility
  const floatMusicBtn = document.getElementById("floating-music-btn");
  if (floatMusicBtn) {
    if (levelId === "level-landing" || levelId === "level-lock") {
      floatMusicBtn.classList.add("hidden");
    } else {
      floatMusicBtn.classList.remove("hidden");
    }
  }
  
  // Toggle secret heart button visibility
  const secretHeart = document.getElementById("secret-heart-btn");
  if (secretHeart) {
    if (levelId === "level-landing" || levelId === "level-lock") {
      secretHeart.style.display = "none";
    } else {
      secretHeart.style.display = "flex";
    }
  }
  
  // Level-specific initialization hook
  if (levelId === "level-baby-intro") {
    startBabyIntro();
  } else if (levelId === "level-greeting") {
    startGreetingMorph();
  } else if (levelId === "level-song") {
    // If music is already playing, display lyrics immediately
    if (isPlaying) {
      startLyricsOverlay();
    }
  } else if (levelId === "level-timeline") {
    startTimelineFeatures();
  } else if (levelId === "level-typewriter") {
    startQuestTypewriter();
  } else if (levelId === "level-scratch") {
    startScratchFeatures();
  }
}


// --- LEVEL: LANDING PRESENT ---
function initGiftBox() {
  const box = document.getElementById("gift-box-elem");
  box.addEventListener("click", () => {
    if (box.classList.contains("open")) return;
    
    box.classList.add("open");
    playSuccessChime();
    triggerBGConfettiBurst();
    
    setTimeout(() => {
      goToLevel("level-lock");
    }, 700);
  });
}


// --- [NEW] LEVEL 1.5: THE HEART LOCK SLIDER ---
function initLockSlider() {
  const track = document.getElementById("lock-track");
  const handle = document.getElementById("lock-handle");
  const fill = document.getElementById("lock-fill");
  
  let isDragging = false;
  let startX = 0;
  let currentX = 0;
  
  const getPositionX = (e) => {
    return e.type.includes("touch") ? e.touches[0].clientX : e.clientX;
  };
  
  const onStart = (e) => {
    isDragging = true;
    startX = getPositionX(e) - handle.offsetLeft;
    handle.style.transition = "none";
    fill.style.transition = "none";
  };
  
  const onMove = (e) => {
    if (!isDragging) return;
    
    const posX = getPositionX(e);
    const maxDrag = track.clientWidth - handle.clientWidth - 8;
    currentX = posX - startX;
    
    // Boundary checks
    if (currentX < 4) currentX = 4;
    if (currentX > maxDrag) currentX = maxDrag;
    
    handle.style.left = `${currentX}px`;
    fill.style.width = `${currentX + handle.clientWidth / 2}px`;
    
    // Dynamically accelerate the heartbeat pulse animation based on drag progress
    const progress = (currentX - 4) / (maxDrag - 4 || 1);
    if (progress > 0.72) {
      handle.classList.remove("pulse-fast");
      handle.classList.add("pulse-very-fast");
    } else if (progress > 0.35) {
      handle.classList.remove("pulse-very-fast");
      handle.classList.add("pulse-fast");
    } else {
      handle.classList.remove("pulse-fast", "pulse-very-fast");
    }
    
    // Check if unlocked (dragged > 92% of track)
    if (currentX >= maxDrag * 0.94) {
      isDragging = false;
      playSuccessChime();
      triggerBGConfettiBurst();
      
      // Animate slide-out finish
      handle.style.transition = "all 0.2s";
      fill.style.transition = "all 0.2s";
      handle.style.left = `${maxDrag}px`;
      fill.style.width = "100%";
      handle.classList.remove("pulse-fast", "pulse-very-fast");
      
      setTimeout(() => {
        goToLevel("level-baby-intro");
      }, 400);
    }
  };
  
  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    
    // Reset to start if not fully unlocked
    handle.style.transition = "left 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.25)";
    fill.style.transition = "width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.25)";
    handle.style.left = "4px";
    fill.style.width = "0%";
    
    // Reset heartbeat speed
    handle.classList.remove("pulse-fast", "pulse-very-fast");
    
    if (audioCtx) playTone(180, 0.15, "sine", 0.15);
  };
  
  handle.addEventListener("mousedown", onStart);
  handle.addEventListener("touchstart", onStart);
  
  window.addEventListener("mousemove", onMove);
  window.addEventListener("touchmove", onMove);
  
  window.addEventListener("mouseup", onEnd);
  window.addEventListener("touchend", onEnd);
}


// --- LEVEL 2: GREETING ---
function initGreeting() {
  const photo = document.getElementById("welcome-hero-photo");
  if (photo) {
    photo.style.objectPosition = "center 15%";
    photo.src = CONFIG.favoritePhoto;
  }
  const nextBtn = document.getElementById("greeting-next-btn");
  nextBtn.addEventListener("click", () => {
    goToLevel("level-icecream-gate");
  });
}


// --- LEVEL 2.5: ICE CREAM GATE ---
function initIceCreamGate() {
  const yesBtn = document.getElementById("icecream-yes-btn");
  yesBtn.addEventListener("click", () => {
    playSuccessChime();
    goToLevel("level-slider");
  });
}


// --- LEVEL 3: POLAROID CARD DECK ---
function initSlider() {
  const deck = document.getElementById("polaroid-card-deck");
  const progressText = document.getElementById("deck-progress-text");
  const proceedBtn = document.getElementById("slider-next-btn");
  
  deck.innerHTML = "";
  proceedBtn.classList.add("hidden");
  
  let currentCardIndex = 0;
  const totalCards = CONFIG.slides.length;
  
  progressText.innerText = `Card 1 / ${totalCards}`;
  
  // Render cards in reverse order so the first card in config sits on top (highest z-index)
  CONFIG.slides.slice().reverse().forEach((slide, reverseIdx) => {
    const trueIdx = totalCards - 1 - reverseIdx;
    
    const card = document.createElement("div");
    card.classList.add("polaroid-card");
    card.style.zIndex = `${reverseIdx + 1}`;
    
    // Add random rotations/offsets for stacked look
    const randomRot = (Math.random() * 8 - 4).toFixed(1); // -4 to 4 degrees
    const randomOffset = (Math.random() * 6 - 3).toFixed(0); // -3px to 3px
    card.style.transform = `rotate(${randomRot}deg) translate(${randomOffset}px, ${randomOffset}px)`;
    
    card.innerHTML = `
      <img src="${slide.image}" alt="${slide.title}">
      <div class="polaroid-caption">
        <h4>${slide.title}</h4>
        <p>${slide.desc}</p>
      </div>
    `;
    
    // Swipe top card off the stack on click
    card.addEventListener("click", () => {
      if (trueIdx === currentCardIndex) {
        card.classList.add("swipe-off");
        playChime();
        triggerBGConfettiBurst();
        
        currentCardIndex++;
        
        if (currentCardIndex < totalCards) {
          progressText.innerText = `Card ${currentCardIndex + 1} / ${totalCards}`;
        } else {
          progressText.innerText = "All memories viewed! ❤️";
          proceedBtn.classList.remove("hidden");
          proceedBtn.classList.add("pulse-infinite");
        }
      }
    });
    
    deck.appendChild(card);
  });
  
  proceedBtn.addEventListener("click", () => {
    goToLevel("level-memory-match");
    setupMemoryGame();
  });
}


// --- [NEW] LEVEL 3.5: LOVE MATCH CARD GAME ---
let firstCard = null;
let secondCard = null;
let lockGrid = false;
let matchedCount = 0;

function setupMemoryGame() {
  const grid = document.getElementById("memory-grid");
  grid.innerHTML = ""; // Clear
  
  firstCard = null;
  secondCard = null;
  lockGrid = false;
  matchedCount = 0;
  
  // Match symbols: 3 pairs
  const symbols = ["🍕", "🍕", "🍦", "🍦", "💖", "💖"];
  
  // Shuffle cards
  symbols.sort(() => Math.random() - 0.5);
  
  symbols.forEach((symbol, index) => {
    const card = document.createElement("div");
    card.classList.add("memory-card");
    card.dataset.symbol = symbol;
    
    card.innerHTML = `
      <div class="memory-card-inner">
        <div class="memory-card-side memory-card-front">❓</div>
        <div class="memory-card-side memory-card-back">${symbol}</div>
      </div>
    `;
    
    card.addEventListener("click", () => flipCard(card));
    grid.appendChild(card);
  });
}

function flipCard(card) {
  if (lockGrid) return;
  if (card === firstCard) return;
  if (card.classList.contains("matched")) return;
  
  playTone(550, 0.1, "sine", 0.12);
  card.classList.add("flipped");
  
  if (!firstCard) {
    firstCard = card;
    return;
  }
  
  secondCard = card;
  lockGrid = true;
  
  checkForMatch();
}

function checkForMatch() {
  const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;
  
  if (isMatch) {
    disableCards();
  } else {
    unflipCards();
  }
}

function disableCards() {
  firstCard.classList.add("matched");
  secondCard.classList.add("matched");
  
  playTone(750, 0.25, "sine", 0.15);
  matchedCount += 2;
  
  // Confetti burst on match
  const cardRect = secondCard.getBoundingClientRect();
  spawnHeartsBurst(cardRect.left + cardRect.width / 2, cardRect.top + cardRect.height / 2);
  
  resetBoard();
  
  // Game completed
  if (matchedCount === 6) {
    setTimeout(() => {
      playSuccessChime();
      triggerBGConfettiBurst();
      setTimeout(() => {
        goToLevel("level-song");
      }, 1200);
    }, 500);
  }
}

function unflipCards() {
  playErrorTone();
  
  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetBoard();
  }, 1000);
}

function resetBoard() {
  [firstCard, secondCard] = [null, null];
  lockGrid = false;
}

function initMemoryGame() {
  // Config handled in setupMemoryGame() when navigated to
}


// --- LEVEL 4: MUSIC RECORD ---
function initMusic() {
  const vinyl = document.getElementById("vinyl-player-btn");
  const nextBtn = document.getElementById("music-next-btn");
  
  vinyl.addEventListener("click", () => {
    initAudioContext();
    if (isPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  });
  
  const floatBtn = document.getElementById("floating-music-btn");
  if (floatBtn) {
    floatBtn.addEventListener("click", () => {
      initAudioContext();
      if (isPlaying) {
        stopMusic();
      } else {
        startMusic();
      }
    });
  }
  
  nextBtn.addEventListener("click", () => {
    goToLevel("level-reasons");
  });
}


// --- [NEW] LEVEL 4.5: REASONS COMPLIMENT CHEST ---
let reasonsOpened = 0;
let openedIndices = [];

function initReasonsBox() {
  const chest = document.getElementById("chest-btn");
  const icon = document.getElementById("chest-icon");
  const displayBox = document.getElementById("reason-display-box");
  const textElem = document.getElementById("reason-text");
  const progressFill = document.getElementById("reason-progress-fill");
  const countElem = document.getElementById("reasons-count");
  const nextBtn = document.getElementById("reasons-next-btn");
  
  reasonsOpened = 0;
  openedIndices = [];
  
  chest.addEventListener("click", () => {
    if (openedIndices.length >= CONFIG.reasonsList.length) {
      // All reasons opened, reset index array to allow repeats
      openedIndices = [];
    }
    
    // Animate chest jiggle
    icon.style.transform = "scale(0.85)";
    icon.innerText = "🔓";
    playChime();
    
    setTimeout(() => {
      icon.style.transform = "scale(1.1)";
      setTimeout(() => { icon.style.transform = "scale(1)"; }, 150);
      
      // Revert chest icon back to 🎁 after 1.5 seconds
      setTimeout(() => {
        icon.innerText = "🎁";
      }, 1500);
      
      // Get a random index that hasn't been opened yet in this round
      let randIdx;
      do {
        randIdx = Math.floor(Math.random() * CONFIG.reasonsList.length);
      } while (openedIndices.includes(randIdx) && openedIndices.length < CONFIG.reasonsList.length);
      
      openedIndices.push(randIdx);
      
      // Show compliment text
      displayBox.classList.remove("hidden");
      textElem.innerText = CONFIG.reasonsList[randIdx];
      
      // Confetti splash
      const chestRect = chest.getBoundingClientRect();
      spawnHeartsBurst(chestRect.left + chestRect.width / 2, chestRect.top + chestRect.height / 2);
      
      // Track progress
      if (reasonsOpened < 3) {
        reasonsOpened++;
        countElem.innerText = reasonsOpened;
        progressFill.style.width = `${(reasonsOpened / 3) * 100}%`;
        
        if (reasonsOpened === 3) {
          playSuccessChime();
          triggerBGConfettiBurst();
          nextBtn.classList.remove("hidden");
          nextBtn.classList.add("pulse-infinite");
        }
      }
    }, 150);
  });
  
  nextBtn.addEventListener("click", () => {
    goToLevel("level-timeline");
  });
}


// --- LEVEL 5: TIMELINE & LIVE COUNTER ---
let countdownInterval = null;
let chatIndex = 0;

function startTimelineFeatures() {
  const chatBox = document.getElementById("fake-chat-box");
  chatBox.innerHTML = "";
  chatIndex = 0;
  
  loadNextChatBubble();
  
  if (countdownInterval) clearInterval(countdownInterval);
  updateCounter();
  countdownInterval = setInterval(updateCounter, 1000);
  
  populateTimeline();
}

function initTimelineAndCounter() {
  const nextBtn = document.getElementById("timeline-next-btn");
  nextBtn.addEventListener("click", () => {
    if (countdownInterval) clearInterval(countdownInterval);
    goToLevel("level-game-gate");
  });
}

function updateCounter() {
  const display = document.getElementById("countdown-timer");
  const startDate = new Date(CONFIG.relationshipStartDate);
  const now = new Date();
  
  let diff = now - startDate;
  if (diff < 0) {
    display.innerHTML = "<div class='text-md'>Setting up relationship timer...</div>";
    return;
  }
  
  const msInSec = 1000;
  const msInMin = 60 * 1000;
  const msInHour = 60 * 60 * 1000;
  const msInDay = 24 * 60 * 60 * 1000;
  
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();
  
  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  const diffTime = diff % msInDay;
  const hours = Math.floor(diffTime / msInHour);
  const minutes = Math.floor((diffTime % msInHour) / msInMin);
  const seconds = Math.floor((diffTime % msInMin) / msInSec);
  
  display.innerHTML = `
    <div class="time-segment"><span class="time-num">${years}</span><span class="time-label">Years</span></div>
    <div class="time-segment"><span class="time-num">${months}</span><span class="time-label">Months</span></div>
    <div class="time-segment"><span class="time-num">${days}</span><span class="time-label">Days</span></div>
    <div class="time-segment"><span class="time-num">${hours}</span><span class="time-label">Hours</span></div>
    <div class="time-segment"><span class="time-num">${minutes}</span><span class="time-label">Mins</span></div>
    <div class="time-segment"><span class="time-num">${seconds}</span><span class="time-label">Secs</span></div>
  `;
}

function loadNextChatBubble() {
  if (chatIndex >= CONFIG.chatMessages.length) {
    startIfICouldFeatures();
    return;
  }
  
  const chatBox = document.getElementById("fake-chat-box");
  const msgObj = CONFIG.chatMessages[chatIndex];
  
  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble", msgObj.sender);
  bubble.innerText = msgObj.text;
  
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
  
  if (audioCtx && chatIndex > 0) {
    playTone(700 + Math.random() * 100, 0.05, "sine", 0.08);
  }
  
  chatIndex++;
  setTimeout(loadNextChatBubble, 1800);
}

function populateTimeline() {
  const container = document.getElementById("timeline-container");
  container.innerHTML = "";
  
  CONFIG.timelineItems.forEach((item) => {
    const itemElem = document.createElement("div");
    itemElem.classList.add("timeline-item");
    
    itemElem.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-card">
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
      </div>
    `;
    
    container.appendChild(itemElem);
  });
  
  const cards = container.querySelectorAll(".timeline-card");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.15 });
  
  cards.forEach(card => {
    observer.observe(card);
    setTimeout(() => card.classList.add("visible"), 600);
  });
}


// --- LEVEL 5.5: GAMING GATE ---
function initGameGate() {
  const yesBtn = document.getElementById("game-gate-yes-btn");
  yesBtn.addEventListener("click", () => {
    playSuccessChime();
    goToLevel("level-game");
  });
}


// --- LEVEL 6: GAME (CATCH THE HEARTS) ---
let gameCanvas, gameCtx;
let gameHearts = [];
let gameScore = 0;
let gameActive = false;
let gameLoopId = null;

function initGame() {
  gameCanvas = document.getElementById("game-canvas");
  gameCtx = gameCanvas.getContext("2d");
  
  const startBtn = document.getElementById("game-start-btn");
  startBtn.addEventListener("click", () => {
    document.getElementById("game-overlay").classList.add("hidden");
    startGame();
  });
}

class FallingHeart {
  constructor() {
    this.x = Math.random() * (gameCanvas.width - 30) + 15;
    this.y = -20;
    this.size = Math.random() * 12 + 10;
    this.speed = Math.random() * 2 + 1.2;
    this.color = `hsl(${Math.random() * 20 + 340}, 95%, 60%)`;
  }

  update() {
    this.y += this.speed;
  }

  draw() {
    gameCtx.save();
    gameCtx.fillStyle = this.color;
    gameCtx.beginPath();
    const d = this.size;
    gameCtx.moveTo(this.x, this.y + d / 4);
    gameCtx.quadraticCurveTo(this.x, this.y, this.x + d / 2, this.y);
    gameCtx.quadraticCurveTo(this.x + d, this.y, this.x + d, this.y + d / 3);
    gameCtx.quadraticCurveTo(this.x + d, this.y + (d * 2) / 3, this.x + d / 2, this.y + d);
    gameCtx.quadraticCurveTo(this.x - d, this.y + (d * 2) / 3, this.x - d, this.y + d / 3);
    gameCtx.quadraticCurveTo(this.x - d, this.y, this.x - d / 2, this.y);
    gameCtx.quadraticCurveTo(this.x, this.y, this.x, this.y + d / 4);
    gameCtx.closePath();
    gameCtx.fill();
    gameCtx.restore();
  }

  isClicked(mx, my) {
    const dist = Math.hypot(mx - this.x, my - this.y);
    return dist < (this.size * 1.8);
  }
}

function startGame() {
  gameActive = true;
  gameScore = 0;
  gameHearts = [];
  document.getElementById("game-score").innerText = "0";
  
  const container = gameCanvas.parentElement;
  gameCanvas.width = container.clientWidth;
  gameCanvas.height = container.clientHeight;
  
  gameCanvas.addEventListener("mousedown", handleGameClick);
  gameCanvas.addEventListener("touchstart", handleGameTouch);
  
  gameLoop();
}

function handleGameClick(e) {
  if (!gameActive) return;
  const rect = gameCanvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  checkHit(mx, my);
}

function handleGameTouch(e) {
  if (!gameActive) return;
  e.preventDefault();
  const rect = gameCanvas.getBoundingClientRect();
  const touch = e.touches[0];
  const mx = touch.clientX - rect.left;
  const my = touch.clientY - rect.top;
  checkHit(mx, my);
}

function checkHit(mx, my) {
  for (let i = gameHearts.length - 1; i >= 0; i--) {
    if (gameHearts[i].isClicked(mx, my)) {
      playTone(550 + Math.random() * 200, 0.1, "sine", 0.2);
      
      const canvasRect = gameCanvas.getBoundingClientRect();
      spawnHeartsBurst(mx + canvasRect.left, my + canvasRect.top);
      
      gameHearts.splice(i, 1);
      gameScore++;
      document.getElementById("game-score").innerText = gameScore;
      
      if (gameScore >= 10) {
        endGame(true);
      }
      break;
    }
  }
}

function endGame(win) {
  gameActive = false;
  cancelAnimationFrame(gameLoopId);
  
  gameCanvas.removeEventListener("mousedown", handleGameClick);
  gameCanvas.removeEventListener("touchstart", handleGameTouch);
  
  const overlay = document.getElementById("game-overlay");
  overlay.innerHTML = `
    <h3 class="color-pink pulse-infinite">You Unlocked Level 6.5! 🔓</h3>
    <p class="margin-t-sm">Game won! Prepare for a scratch surprises...</p>
    <button class="btn btn-primary margin-t-md" id="game-next-btn">Proceed to Scratch Card 🎫</button>
  `;
  overlay.classList.remove("hidden");
  
  document.getElementById("game-next-btn").addEventListener("click", () => {
    goToLevel("level-scratch");
  });
  
  playSuccessChime();
  triggerBGConfettiBurst();
}

function gameLoop() {
  if (!gameActive) return;
  
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  
  if (Math.random() < 0.035 && gameHearts.length < 8) {
    gameHearts.push(new FallingHeart());
  }
  
  for (let i = gameHearts.length - 1; i >= 0; i--) {
    gameHearts[i].update();
    gameHearts[i].draw();
    
    if (gameHearts[i].y > gameCanvas.height + 25) {
      gameHearts.splice(i, 1);
    }
  }
  
  gameLoopId = requestAnimationFrame(gameLoop);
}


// --- [NEW] LEVEL 6.5: VIRTUAL SCRATCH CARD ---
let scratchCanvas, scratchCtx;
let isScratching = false;

function startScratchFeatures() {
  const under = document.getElementById("scratch-under-text");
  const nextBtn = document.getElementById("scratch-next-btn");
  
  under.innerText = CONFIG.scratchCardMessage;
  nextBtn.classList.add("hidden");
  
  scratchCanvas = document.getElementById("scratch-canvas");
  scratchCtx = scratchCanvas.getContext("2d");
  
  const container = scratchCanvas.parentElement;
  scratchCanvas.width = container.clientWidth;
  scratchCanvas.height = container.clientHeight;
  
  // Fill solid silver coat
  scratchCtx.fillStyle = "#8e9aaf";
  scratchCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);
  
  // Add some sparkles overlay texture
  for (let i = 0; i < 400; i++) {
    scratchCtx.fillStyle = Math.random() < 0.5 ? "#a2aebb" : "#727d8c";
    scratchCtx.fillRect(Math.random() * scratchCanvas.width, Math.random() * scratchCanvas.height, 2, 2);
  }
  
  // Draw instruction text on top
  scratchCtx.fillStyle = "#fff";
  scratchCtx.font = "bold 1.25rem Outfit, sans-serif";
  scratchCtx.textAlign = "center";
  scratchCtx.textBaseline = "middle";
  scratchCtx.fillText("❤️ SCRATCH ME ❤️", scratchCanvas.width / 2, scratchCanvas.height / 2);
  
  // Listeners
  scratchCanvas.addEventListener("mousedown", startDrawing);
  scratchCanvas.addEventListener("touchstart", startDrawing);
  
  scratchCanvas.addEventListener("mousemove", drawScratch);
  scratchCanvas.addEventListener("touchmove", drawScratch);
  
  window.addEventListener("mouseup", stopDrawing);
  window.addEventListener("touchend", stopDrawing);
}

function startDrawing(e) {
  isScratching = true;
  drawScratch(e);
}

function drawScratch(e) {
  if (!isScratching) return;
  e.preventDefault();
  
  const rect = scratchCanvas.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  
  // Erase pixels
  scratchCtx.globalCompositeOperation = "destination-out";
  scratchCtx.beginPath();
  scratchCtx.arc(x, y, 22, 0, Math.PI * 2);
  scratchCtx.fill();
  
  // Occasional sound tick
  if (Math.random() < 0.15 && audioCtx) {
    playTone(350 + Math.random() * 80, 0.03, "sine", 0.05);
  }
  
  // Calculate percentage cleared
  checkScratchPercentage();
}

function checkScratchPercentage() {
  const nextBtn = document.getElementById("scratch-next-btn");
  if (!nextBtn.classList.contains("hidden")) return; // already revealed
  
  // Sample pixels on a 15x15 lightweight grid
  const cols = 15;
  const rows = 15;
  const stepX = scratchCanvas.width / cols;
  const stepY = scratchCanvas.height / rows;
  
  let clearedCount = 0;
  
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const px = Math.floor(c * stepX + stepX / 2);
      const py = Math.floor(r * stepY + stepY / 2);
      
      const imgData = scratchCtx.getImageData(px, py, 1, 1);
      const alpha = imgData.data[3]; // get alpha channel (0 to 255)
      
      // If fully transparent (scratched off)
      if (alpha === 0) {
        clearedCount++;
      }
    }
  }
  
  const percentCleared = (clearedCount / (cols * rows)) * 100;
  
  const progressText = document.getElementById("scratch-progress-text");
  if (progressText) {
    progressText.innerText = `Scratched: ${Math.round(percentCleared)}%`;
  }
  
  // When 45% cleared, fade out remaining silver cover
  if (percentCleared >= 45) {
    if (progressText) {
      progressText.innerText = "Unlocked! 🎁";
    }
    scratchCanvas.style.transition = "opacity 0.8s";
    scratchCanvas.style.opacity = "0";
    
    scratchCanvas.removeEventListener("mousedown", startDrawing);
    scratchCanvas.removeEventListener("touchstart", startDrawing);
    scratchCanvas.removeEventListener("mousemove", drawScratch);
    scratchCanvas.removeEventListener("touchmove", drawScratch);
    
    playSuccessChime();
    triggerBGConfettiBurst();
    
    setTimeout(() => {
      scratchCanvas.remove();
      nextBtn.classList.remove("hidden");
      nextBtn.classList.add("pulse-infinite");
    }, 800);
  }
}

function stopDrawing() {
  isScratching = false;
}

function initScratchCard() {
  const nextBtn = document.getElementById("scratch-next-btn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      goToLevel("level-typewriter");
    });
  }
}


// --- LEVEL 7: TYPEWRITER LETTERS ---
function startQuestTypewriter() {
  const container = document.getElementById("typewriter-quest-output");
  const nextBtn = document.getElementById("typewriter-next-btn");
  
  container.innerHTML = "";
  nextBtn.classList.add("hidden");
  
  let charIndex = 0;
  const textToType = CONFIG.loveLetter;
  
  function type() {
    if (charIndex < textToType.length) {
      container.innerHTML += textToType.charAt(charIndex);
      charIndex++;
      
      if (charIndex % 3 === 0 && audioCtx) {
        playTone(620 + Math.random() * 150, 0.02, "sine", 0.08);
      }
      
      setTimeout(type, 45);
    } else {
      setTimeout(() => {
        nextBtn.classList.remove("hidden");
        triggerBGConfettiBurst();
      }, 500);
    }
  }
  
  setTimeout(type, 1000);
}

function initTypewriter() {
  const nextBtn = document.getElementById("typewriter-next-btn");
  nextBtn.addEventListener("click", () => {
    goToLevel("level-card");
  });
}


// --- LEVEL 8: BIRTHDAY CARD ---
function initCard() {
  const cardTextContainer = document.getElementById("bday-card-text");
  const nextBtn = document.getElementById("card-next-btn");
  
  cardTextContainer.innerHTML = "";
  
  CONFIG.birthdayCard.paragraphs.forEach((pText) => {
    const p = document.createElement("p");
    p.innerText = pText;
    cardTextContainer.appendChild(p);
  });
  
  nextBtn.addEventListener("click", () => {
    goToLevel("level-last");
  });

  // Interactive cake candle logic
  const cake = document.getElementById("bday-cake");
  const flame = document.getElementById("candle-flame");
  
  if (cake && flame) {
    cake.addEventListener("click", () => {
      if (flame.classList.contains("blown-out")) {
        // Relight
        flame.classList.remove("blown-out");
        playChime();
      } else {
        // Blow out
        flame.classList.add("blown-out");
        
        // Whoosh sound effect
        if (audioCtx) {
          playTone(200, 0.05, "sine", 0.08);
          setTimeout(() => playTone(120, 0.2, "sawtooth", 0.02), 40);
        }
        
        // Smoke rings effect
        spawnSmoke();
        
        // Confetti burst
        triggerBGConfettiBurst();
      }
    });
  }
}

function spawnSmoke() {
  const cake = document.getElementById("bday-cake");
  if (!cake) return;
  
  for (let i = 0; i < 3; i++) {
    setTimeout(() => {
      const smoke = document.createElement("div");
      smoke.classList.add("cake-smoke");
      smoke.style.left = "52px";
      smoke.style.top = "-12px";
      cake.appendChild(smoke);
      
      setTimeout(() => {
        smoke.remove();
      }, 1200);
    }, i * 150);
  }
}


// --- LEVEL 9: LAST SURPRISE QUESTION CHAIN ---
function initLastSurpriseChain() {
  const q1Yes = document.getElementById("chain-q1-yes");
  const q2Yes = document.getElementById("chain-q2-yes");
  const finalLoveBtn = document.getElementById("love-only-btn");
  
  const q1Div = document.getElementById("chain-q1");
  const q2Div = document.getElementById("chain-q2");
  const q3Div = document.getElementById("chain-q3");
  
  const promptDiv = document.getElementById("last-surprise-prompt");
  const revealDiv = document.getElementById("last-surprise-reveal");
  const photo = document.getElementById("reveal-favorite-photo");
  
  q1Yes.addEventListener("click", () => {
    playSuccessChime();
    q1Div.classList.add("hidden");
    q2Div.classList.remove("hidden");
    q2Div.classList.add("fade-in");
  });
  
  q2Yes.addEventListener("click", () => {
    playSuccessChime();
    q2Div.classList.add("hidden");
    q3Div.classList.remove("hidden");
    q3Div.classList.add("fade-in");
  });
  
  finalLoveBtn.addEventListener("click", () => {
    playSuccessChime();
    
    // Trigger fake loading console protocol first
    startConsoleSearch(() => {
      const countdownOverlay = document.getElementById("movie-countdown-overlay");
      const countdownNum = document.getElementById("countdown-number");
      const spotlightContainer = document.getElementById("spotlight-container");
      
      // Show theatrical film countdown
      countdownOverlay.classList.remove("hidden");
      
      // Preload favorite image
      photo.src = CONFIG.favoritePhoto;
      
      let count = 3;
      countdownNum.innerText = count;
      
      const countInterval = setInterval(() => {
        count--;
        if (count > 0) {
          countdownNum.innerText = count;
          // Projector countdown sound effect
          if (audioCtx) {
            playTone(480, 0.15, "sine", 0.2);
          }
        } else {
          clearInterval(countInterval);
          
          // Hide countdown and roll the curtain!
          countdownOverlay.classList.add("hidden");
          
          if (spotlightContainer) {
            spotlightContainer.classList.remove("hidden");
          }
          
          promptDiv.classList.add("hidden");
          revealDiv.classList.remove("hidden");
          revealDiv.classList.add("fade-in");
          
          // Music integration on theatrical reveal
          initAudioContext();
          if (!isPlaying) {
            startMusic();
          } else {
            // Play a beautiful success celebratory chime burst!
            playSuccessChime();
            setTimeout(playSuccessChime, 150);
            setTimeout(playSuccessChime, 300);
          }
          
          // Unleash celebratory animations
          isFireworksActive = true;
          triggerBGConfettiBurst();
          setTimeout(triggerBGConfettiBurst, 400);
          setTimeout(triggerBGConfettiBurst, 800);
          setInterval(triggerBGConfettiBurst, 2500);
        }
      }, 1000);
    });
  });
}


// --- EVASIVE WRONG OPTIONS HANDLER ---
function initEvasiveButtons() {
  const evasiveBtns = document.querySelectorAll(".evasive");
  
  evasiveBtns.forEach(btn => {
    const container = btn.closest(".gate-options-container") || btn.closest(".quiz-options-container");
    
    btn.addEventListener("mouseover", (e) => {
      evadeButton(btn, container, e);
    });
    btn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      evadeButton(btn, container, e);
    });
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      evadeButton(btn, container, e);
    });
  });
}

function evadeButton(btn, container, e) {
  if (!container) return;
  
  // Detach the button to place it absolutely within the relative container
  if (btn.style.position !== "absolute") {
    btn.style.position = "absolute";
    btn.style.margin = "0";
    btn.style.zIndex = "100";
    
    const wrapper = btn.parentElement;
    if (wrapper) {
      wrapper.style.position = "static";
    }
  }

  const containerRect = container.getBoundingClientRect();
  const btnRect = btn.getBoundingClientRect();
  
  const maxX = containerRect.width - btnRect.width;
  const maxY = containerRect.height - btnRect.height;
  
  // Calculate relative cursor position
  let mouseX = containerRect.width / 2;
  let mouseY = containerRect.height / 2;
  
  if (e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    if (clientX !== undefined && clientY !== undefined) {
      mouseX = clientX - containerRect.left;
      mouseY = clientY - containerRect.top;
    }
  }
  
  // Find a candidate spot that is far from the mouse
  let newX = Math.random() * maxX;
  let newY = Math.random() * (maxY - 20) + 10;
  
  let attempts = 0;
  while (attempts < 25) {
    const dist = Math.hypot(newX + btnRect.width / 2 - mouseX, newY + btnRect.height / 2 - mouseY);
    if (dist > 130) {
      break;
    }
    newX = Math.random() * maxX;
    newY = Math.random() * (maxY - 20) + 10;
    attempts++;
  }
  
  btn.style.left = `${newX}px`;
  btn.style.top = `${newY}px`;
  
  const currentScale = parseFloat(btn.style.transform.replace("scale(", "").replace(")", "")) || 1;
  if (currentScale > 0.55) {
    btn.style.transform = `scale(${currentScale - 0.08})`;
  }
  
  if (audioCtx) {
    playTone(180, 0.08, "sine", 0.15);
  }
}

// --- [NEW] LEVEL 1.8: BABY INTRO AND STORIES ---
function initBabyIntro() {
  const nextBtn = document.getElementById("baby-intro-next-btn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      goToLevel("level-greeting");
    });
  }
}

function startBabyIntro() {
  const nextBtn = document.getElementById("baby-intro-next-btn");
  const photo = document.getElementById("baby-intro-photo");
  
  if (photo) {
    photo.style.objectPosition = "center 10%";
    photo.src = CONFIG.kidPhoto;
  }
  
  nextBtn.classList.add("hidden");
  
  const paragraphs = [
    document.getElementById("baby-story-p1"),
    document.getElementById("baby-story-p2"),
    document.getElementById("baby-story-portrait"),
    document.getElementById("baby-story-p3"),
    document.getElementById("baby-story-p4"),
    document.getElementById("baby-story-p5"),
    document.getElementById("baby-story-p6")
  ];
  
  paragraphs.forEach(p => {
    if (p) {
      p.classList.add("hidden");
      p.classList.remove("show-block");
    }
  });
  
  let delay = 300;
  
  paragraphs.forEach((p, idx) => {
    setTimeout(() => {
      if (p) {
        p.classList.remove("hidden");
        p.classList.add("show-block");
        if (audioCtx) {
          playTone(550 + idx * 50, 0.08, "sine", 0.08);
        }
      }
      
      if (idx === paragraphs.length - 1) {
        setTimeout(() => {
          nextBtn.classList.remove("hidden");
          nextBtn.classList.add("pulse-infinite");
        }, 1500);
      }
    }, delay);
    
    // Storytelling delay offsets
    if (idx === 1) {
      delay += 1800;
    } else if (idx === 2) {
      delay += 1200;
    } else if (idx === 4) {
      delay += 2200;
    } else if (idx === 5) {
      delay += 2000;
    } else {
      delay += 1500;
    }
  });
}

// --- LEVEL 2: GREETING MORPHING AVATAR ---
function startGreetingMorph() {
  const photo = document.getElementById("welcome-hero-photo");
  const morphText = document.getElementById("morphing-text");
  const silhouette = document.getElementById("teen-silhouette");
  const badge = document.getElementById("welcome-hero-badge");
  
  if (!photo || !morphText || !silhouette) return;
  
  photo.style.opacity = "1";
  photo.style.objectPosition = "center 10%";
  photo.src = CONFIG.kidPhoto;
  silhouette.classList.add("hidden");
  silhouette.style.opacity = "0";
  morphText.innerText = "From this tiny smile...";
  badge.innerText = "Baby Tushar 🍼";
  
  // Teen step
  setTimeout(() => {
    photo.style.opacity = "0";
    silhouette.classList.remove("hidden");
    silhouette.style.opacity = "1";
    morphText.innerText = "growing into a teenager with big dreams...";
    badge.innerText = "Dreaming Teen 💫";
    if (audioCtx) playTone(440, 0.2, "sine", 0.1);
    
    // Adult step
    setTimeout(() => {
      silhouette.style.opacity = "0";
      photo.style.objectPosition = "center 15%";
      photo.src = CONFIG.favoritePhoto;
      photo.style.opacity = "1";
      morphText.innerText = "...to the handsome man who stole my heart. ❤️";
      badge.innerText = "❤️ My Favorite Human";
      playChime();
      triggerBGConfettiBurst();
      
      setTimeout(() => {
        silhouette.classList.add("hidden");
      }, 600);
    }, 2200);
  }, 2200);
}

// --- FLOATING LYRICS OVERLAY ---
let lyricsTimeout = null;
function startLyricsOverlay() {
  const container = document.getElementById("floating-lyrics-container");
  if (!container) return;
  
  stopLyricsOverlay();
  
  const lyrics = [
    "Happy Birthday,",
    "my favorite person... 🎂",
    "This little website...",
    "is just one tiny way",
    "of saying...",
    "I love you. ❤️"
  ];
  
  let index = 0;
  
  function showNextLyric() {
    if (!isPlaying) return;
    
    container.innerHTML = "";
    const text = lyrics[index];
    
    const line = document.createElement("div");
    line.classList.add("lyric-line");
    line.innerText = text;
    container.appendChild(line);
    
    index = (index + 1) % lyrics.length;
    lyricsTimeout = setTimeout(showNextLyric, 4200);
  }
  
  showNextLyric();
}

function stopLyricsOverlay() {
  if (lyricsTimeout) {
    clearTimeout(lyricsTimeout);
    lyricsTimeout = null;
  }
  const container = document.getElementById("floating-lyrics-container");
  if (container) container.innerHTML = "";
}

// --- FAKE CONSOLE LOADING TERMINAL ---
function startConsoleSearch(callback) {
  const overlay = document.getElementById("fake-loading-overlay");
  const consoleDiv = document.getElementById("loading-console");
  
  if (!overlay || !consoleDiv) {
    callback();
    return;
  }
  
  overlay.classList.remove("hidden");
  consoleDiv.innerHTML = "";
  
  const lines = [
    "Initializing boyfriend search protocol...",
    "Query: boyfriend_name == 'Tushar'",
    "Loading criteria: cute, caring, makes me laugh...",
    "Scanning databases...",
    "Checking global indices...",
    "Loading...",
    "Loading...",
    "Checking for compatibility score > 9000...",
    "Loading...",
    "❌ No better boyfriend found.",
    "Match Found ❤️",
    "Selected: Tushar (My Superhero)",
    "Launching Premiere Projection System..."
  ];
  
  let lineIndex = 0;
  
  function printNextLine() {
    if (lineIndex < lines.length) {
      const p = document.createElement("p");
      p.classList.add("console-line");
      p.innerText = lines[lineIndex];
      
      if (lines[lineIndex].startsWith("❌")) {
        p.style.color = "#ff3366";
        p.style.fontWeight = "bold";
      } else if (lines[lineIndex].startsWith("Match Found")) {
        p.style.color = "#ff99bb";
        p.style.fontWeight = "bold";
      }
      
      consoleDiv.appendChild(p);
      overlay.scrollTop = overlay.scrollHeight;
      
      if (audioCtx) {
        playTone(320 + lineIndex * 20, 0.04, "sine", 0.05);
      }
      
      lineIndex++;
      
      let lineDelay = 250;
      if (lines[lineIndex - 1].includes("Loading")) {
        lineDelay = 400;
      } else if (lines[lineIndex - 1].includes("Scan") || lines[lineIndex - 1].includes("Check")) {
        lineDelay = 500;
      } else if (lines[lineIndex - 1].startsWith("❌")) {
        lineDelay = 1000;
      }
      
      setTimeout(printNextLine, lineDelay);
    } else {
      setTimeout(() => {
        overlay.classList.add("hidden");
        callback();
      }, 1200);
    }
  }
  
  printNextLine();
}

// --- INTERACTIVE SECRET HEART ---
function initSecretHeart() {
  const heartBtn = document.getElementById("secret-heart-btn");
  const modal = document.getElementById("secret-heart-modal");
  const closeBtn = document.getElementById("close-secret-modal");
  
  if (!heartBtn || !modal || !closeBtn) return;
  
  heartBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    playSuccessChime();
  });
  
  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    if (audioCtx) playChime();
  });
}

// --- FINAL STARRY ENDING ---
function initFinalStarryEnding() {
  const triggerBtn = document.getElementById("trigger-final-stars-btn");
  const endingScreen = document.getElementById("final-starry-ending");
  const starsContainer = document.getElementById("stars-container");
  
  if (!triggerBtn || !endingScreen || !starsContainer) return;
  
  triggerBtn.addEventListener("click", () => {
    endingScreen.classList.remove("hidden");
    endingScreen.classList.add("fade-in");
    
    // Twinkling stars generator
    starsContainer.innerHTML = "";
    const starCount = 65;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement("div");
      star.classList.add("star-particle");
      
      const size = Math.random() * 3 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      
      const duration = Math.random() * 3 + 2;
      const delay = Math.random() * 5;
      star.style.animationDuration = `${duration}s`;
      star.style.animationDelay = `${delay}s`;
      
      starsContainer.appendChild(star);
    }
    
    triggerBGConfettiBurst();
    setTimeout(triggerBGConfettiBurst, 500);
  });
}

// --- IF I COULD CARDS GENERATOR ---
function startIfICouldFeatures() {
  const section = document.getElementById("if-i-could-section");
  const cardsContainer = document.getElementById("if-cards-container");
  const nextBtn = document.getElementById("timeline-next-btn");
  
  if (!section || !cardsContainer) return;
  
  section.classList.remove("hidden");
  section.classList.add("fade-in");
  cardsContainer.innerHTML = "";
  nextBtn.classList.add("hidden");
  
  const cards = [
    "❤️ I'd hug you tight.",
    "❤️ I'd hold your hand.",
    "❤️ I'd annoy you forever.",
    "❤️ I'd celebrate every birthday with you.",
    "❤️ I'd choose you, always."
  ];
  
  cards.forEach((text, idx) => {
    setTimeout(() => {
      const card = document.createElement("div");
      card.classList.add("if-card");
      card.innerText = text;
      cardsContainer.appendChild(card);
      
      if (audioCtx) {
        playTone(600 + idx * 80, 0.1, "sine", 0.08);
      }
      
      if (idx === cards.length - 1) {
        setTimeout(() => {
          nextBtn.classList.remove("hidden");
          nextBtn.classList.add("pulse-infinite");
        }, 1200);
      }
    }, idx * 1800);
  });
}
