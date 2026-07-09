// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  initCursorHearts();
  initBackgroundCanvas();
  initGiftBox();
  initQuiz();
  initGreeting();
  initSlider();
  initMusic();
  initTimelineAndCounter();
  initGame();
  initTypewriter();
  initCard();
  initLastSurprise();
});

// --- AUDIO SYNTHESIZER (MUSIC BOX TUNE) ---
let audioCtx = null;
let musicInterval = null;
let isPlaying = false;
let currentNoteIndex = 0;

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
  currentNoteIndex = 0;
  playNextNote();
}

function playNextNote() {
  if (!isPlaying) return;
  
  const noteObj = MELODY[currentNoteIndex];
  const beatDuration = 0.55; // 110 bpm approx
  const duration = noteObj.dur * beatDuration;
  
  playTone(noteObj.freq, duration * 1.5, "triangle", 0.2);
  
  currentNoteIndex = (currentNoteIndex + 1) % MELODY.length;
  musicInterval = setTimeout(playNextNote, duration * 1000);
}

function stopMusic() {
  isPlaying = false;
  if (musicInterval) {
    clearTimeout(musicInterval);
  }
}


// --- CURSOR HEARTS TRAILER ---
function initCursorHearts() {
  const container = document.getElementById("hearts-pointer-container");
  
  const spawnHeart = (x, y) => {
    const heart = document.createElement("div");
    heart.classList.add("cursor-heart");
    heart.innerText = "❤️";
    
    // Slight random offset
    const offsetX = Math.random() * 16 - 8;
    const offsetY = Math.random() * 16 - 8;
    
    heart.style.left = `${x + offsetX}px`;
    heart.style.top = `${y + offsetY}px`;
    
    // Randomize scaling
    const scale = Math.random() * 0.6 + 0.6;
    heart.style.transform = `scale(${scale})`;
    
    container.appendChild(heart);
    
    // Remove heart element after animation completes
    setTimeout(() => {
      heart.remove();
    }, 1200);
  };

  window.addEventListener("mousemove", (e) => {
    // Only spawn occasionally to reduce clutter
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

function initBackgroundCanvas() {
  bgCanvas = document.getElementById("canvas-bg");
  bgCtx = bgCanvas.getContext("2d");
  
  const resizeBg = () => {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  };
  resizeBg();
  window.addEventListener("resize", resizeBg);
  
  // Animation Loop
  animateBg();
  
  // click burst
  window.addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON" && e.target.tagName !== "INPUT") {
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

function animateBg() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  
  // Ambient floaters
  if (Math.random() < 0.02 && bgHearts.filter(h => h.speedY < 0).length < 18) {
    bgHearts.push(new BGHeart(Math.random() * bgCanvas.width, bgCanvas.height + 20));
  }
  
  // Draw hearts
  for (let i = bgHearts.length - 1; i >= 0; i--) {
    bgHearts[i].update();
    bgHearts[i].draw();
    if (bgHearts[i].opacity <= 0) {
      bgHearts.splice(i, 1);
    }
  }

  // Draw confetti
  for (let i = bgConfetti.length - 1; i >= 0; i--) {
    bgConfetti[i].update();
    bgConfetti[i].draw();
    if (bgConfetti[i].y > bgCanvas.height + 20) {
      bgConfetti.splice(i, 1);
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
  
  // Level-specific initialization hook
  if (levelId === "level-timeline") {
    startTimelineFeatures();
  } else if (levelId === "level-typewriter") {
    startQuestTypewriter();
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
      goToLevel("level-greeting");
    }, 700);
  });
}


// --- LEVEL 1: GATEKEEPER QUIZ ---
function initQuiz() {
  const submitBtn = document.getElementById("quiz-submit-btn");
  const inputField = document.getElementById("meet-input");
  const errorMsg = document.getElementById("quiz-error-msg");
  const card = inputField.closest(".glass-card");

  submitBtn.addEventListener("click", () => {
    const answer = inputField.value.trim().toLowerCase();
    const correctAnswer = CONFIG.firstMetPlace.toLowerCase();
    
    if (answer === correctAnswer) {
      errorMsg.classList.add("hidden");
      playSuccessChime();
      triggerBGConfettiBurst();
      goToLevel("level-greeting");
    } else {
      // Shake animation and show error
      playErrorTone();
      errorMsg.classList.remove("hidden");
      card.classList.remove("shake-element");
      void card.offsetWidth; // Trigger reflow to restart animation
      card.classList.add("shake-element");
    }
  });

  inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      submitBtn.click();
    }
  });
}


// --- LEVEL 2: GREETING ---
function initGreeting() {
  const nextBtn = document.getElementById("greeting-next-btn");
  nextBtn.addEventListener("click", () => {
    goToLevel("level-slider");
  });
}


// --- LEVEL 3: POLAROID SLIDER ---
let currentSlide = 0;

function initSlider() {
  const track = document.getElementById("slider-track");
  const dotsContainer = document.getElementById("slider-dots");
  const prevBtn = document.getElementById("slider-prev");
  const nextBtn = document.getElementById("slider-next");
  const proceedBtn = document.getElementById("slider-next-btn");
  
  // Populated slides
  track.innerHTML = "";
  dotsContainer.innerHTML = "";
  
  CONFIG.slides.forEach((slide, idx) => {
    // Create slide
    const slideElem = document.createElement("div");
    slideElem.classList.add("slide");
    
    slideElem.innerHTML = `
      <div class="slide-img-box">
        <img src="${slide.image}" alt="${slide.title}">
      </div>
      <div class="slide-caption-box">
        <h3>${slide.title}</h3>
        <p>${slide.desc}</p>
      </div>
    `;
    track.appendChild(slideElem);
    
    // Create dot
    const dot = document.createElement("div");
    dot.classList.add("slider-dot");
    if (idx === 0) dot.classList.add("active");
    dot.addEventListener("click", () => {
      currentSlide = idx;
      updateSlider();
    });
    dotsContainer.appendChild(dot);
  });
  
  const updateSlider = () => {
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update dots
    const dots = dotsContainer.querySelectorAll(".slider-dot");
    dots.forEach((dot, idx) => {
      if (idx === currentSlide) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  };
  
  prevBtn.addEventListener("click", () => {
    currentSlide = (currentSlide - 1 + CONFIG.slides.length) % CONFIG.slides.length;
    updateSlider();
    if (audioCtx) playTone(440, 0.1, "sine", 0.1);
  });
  
  nextBtn.addEventListener("click", () => {
    currentSlide = (currentSlide + 1) % CONFIG.slides.length;
    updateSlider();
    if (audioCtx) playTone(440, 0.1, "sine", 0.1);
  });
  
  proceedBtn.addEventListener("click", () => {
    goToLevel("level-song");
  });
}


// --- LEVEL 4: MUSIC RECORD PLAYER ---
function initMusic() {
  const vinyl = document.getElementById("vinyl-player-btn");
  const stateText = document.getElementById("music-state-text");
  const nextBtn = document.getElementById("music-next-btn");
  
  vinyl.addEventListener("click", () => {
    initAudioContext();
    if (isPlaying) {
      stopMusic();
      vinyl.classList.remove("playing");
      stateText.innerText = "Paused 🎵 Click to resume";
    } else {
      startMusic();
      vinyl.classList.add("playing");
      stateText.innerText = "Playing 'Happy Birthday' Music Box... 🎵";
      triggerBGConfettiBurst();
    }
  });
  
  nextBtn.addEventListener("click", () => {
    goToLevel("level-timeline");
  });
}


// --- LEVEL 5: TIMELINE, COUNTER, CHAT ---
let countdownInterval = null;
let chatIndex = 0;

function startTimelineFeatures() {
  // Reset fake chat
  const chatBox = document.getElementById("fake-chat-box");
  chatBox.innerHTML = "";
  chatIndex = 0;
  
  // Load chats bubble-by-bubble
  loadNextChatBubble();
  
  // Initialize Counter
  if (countdownInterval) clearInterval(countdownInterval);
  updateCounter();
  countdownInterval = setInterval(updateCounter, 1000);
  
  // Populate Milestones
  populateTimeline();
}

function initTimelineAndCounter() {
  const nextBtn = document.getElementById("timeline-next-btn");
  nextBtn.addEventListener("click", () => {
    if (countdownInterval) clearInterval(countdownInterval);
    goToLevel("level-game");
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
  
  // Precise conversion values
  const msInSec = 1000;
  const msInMin = 60 * 1000;
  const msInHour = 60 * 60 * 1000;
  const msInDay = 24 * 60 * 60 * 1000;
  
  // Approximate years and months
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();
  
  if (days < 0) {
    months--;
    // Get last day of previous month
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
  if (chatIndex >= CONFIG.chatMessages.length) return;
  
  const chatBox = document.getElementById("fake-chat-box");
  const msgObj = CONFIG.chatMessages[chatIndex];
  
  const bubble = document.createElement("div");
  bubble.classList.add("chat-bubble", msgObj.sender);
  bubble.innerText = msgObj.text;
  
  chatBox.appendChild(bubble);
  chatBox.scrollTop = chatBox.scrollHeight;
  
  // Play subtle bubble chime
  if (audioCtx && chatIndex > 0) {
    playTone(700 + Math.random() * 100, 0.05, "sine", 0.08);
  }
  
  chatIndex++;
  
  // Auto-scroll inside chat
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
        <div class="timeline-date">${item.date}</div>
        <h4>${item.title}</h4>
        <p>${item.desc}</p>
      </div>
    `;
    
    container.appendChild(itemElem);
  });
  
  // Scroll reveal logic
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
    // Fallback if not fully intersecting or no support
    setTimeout(() => card.classList.add("visible"), 600);
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
    this.size = Math.random() * 12 + 10; // Radius
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
    // Expand collision box slightly for comfortable mobile tapping
    const dist = Math.hypot(mx - this.x, my - this.y);
    return dist < (this.size * 1.8);
  }
}

function startGame() {
  gameActive = true;
  gameScore = 0;
  gameHearts = [];
  document.getElementById("game-score").innerText = "0";
  
  // Resize Canvas to container
  const container = gameCanvas.parentElement;
  gameCanvas.width = container.clientWidth;
  gameCanvas.height = container.clientHeight;
  
  // Register click / touch
  gameCanvas.addEventListener("mousedown", handleGameClick);
  gameCanvas.addEventListener("touchstart", handleGameTouch);
  
  // Run Game loop
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
  e.preventDefault(); // Prevent double clicks
  const rect = gameCanvas.getBoundingClientRect();
  const touch = e.touches[0];
  const mx = touch.clientX - rect.left;
  const my = touch.clientY - rect.top;
  checkHit(mx, my);
}

function checkHit(mx, my) {
  for (let i = gameHearts.length - 1; i >= 0; i--) {
    if (gameHearts[i].isClicked(mx, my)) {
      // Hit!
      playTone(550 + Math.random() * 200, 0.1, "sine", 0.2);
      
      // Explode sparks on bg canvas
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
    <h3 class="color-pink pulse-infinite">You Unlocked Level 7! 🔓</h3>
    <p class="margin-t-sm">Perfect score caught! You're ready for the romantic whisper...</p>
    <button class="btn btn-primary margin-t-md" id="game-next-btn">Proceed to Level 7 💌</button>
  `;
  overlay.classList.remove("hidden");
  
  document.getElementById("game-next-btn").addEventListener("click", () => {
    goToLevel("level-typewriter");
  });
  
  playSuccessChime();
  triggerBGConfettiBurst();
}

function gameLoop() {
  if (!gameActive) return;
  
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  
  // Random Spawn
  if (Math.random() < 0.035 && gameHearts.length < 8) {
    gameHearts.push(new FallingHeart());
  }
  
  // Update and draw falling hearts
  for (let i = gameHearts.length - 1; i >= 0; i--) {
    gameHearts[i].update();
    gameHearts[i].draw();
    
    // Check if missed (out of bounds)
    if (gameHearts[i].y > gameCanvas.height + 25) {
      gameHearts.splice(i, 1);
    }
  }
  
  gameLoopId = requestAnimationFrame(gameLoop);
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
      
      // Play soft sound occasionally
      if (charIndex % 3 === 0 && audioCtx) {
        playTone(620 + Math.random() * 150, 0.02, "sine", 0.08);
      }
      
      setTimeout(type, 45);
    } else {
      // Typing done, show proceed btn
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
}


// --- LEVEL 9: LAST SURPRISE (LOVE ME) ---
function initLastSurprise() {
  const loveBtn = document.getElementById("love-only-btn");
  const promptDiv = document.getElementById("last-surprise-prompt");
  const revealDiv = document.getElementById("last-surprise-reveal");
  const photo = document.getElementById("reveal-favorite-photo");
  
  loveBtn.addEventListener("click", () => {
    playSuccessChime();
    
    // Setup favorite image source
    photo.src = CONFIG.favoritePhoto;
    
    // Explode hearts and confetti in columns
    triggerBGConfettiBurst();
    setTimeout(triggerBGConfettiBurst, 400);
    setTimeout(triggerBGConfettiBurst, 800);
    
    promptDiv.classList.add("hidden");
    revealDiv.classList.remove("hidden");
    revealDiv.classList.add("fade-in");
  });
}
