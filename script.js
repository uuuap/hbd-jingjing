// ========================================================
// 0. CONFIGURATION & SECRET PASSCODE ("ยืนยันความน่ารัก")
// ========================================================
// รหัสผ่านลับ 4 หลักสำหรับปลดล็อกเข้าเว็บ (ตั้งค่าเป็น "0711")
let SECRET_PASSCODE = "0711";

// รองรับการระบุรหัสผ่านผ่าน URL เช่น ?code=0711 หรือ ?pin=0711
try {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('code')) {
    SECRET_PASSCODE = urlParams.get('code');
  } else if (urlParams.has('pin')) {
    SECRET_PASSCODE = urlParams.get('pin');
  }

  // Creator photo customization shortcut via URL (?photos=1 or ?edit=1)
  if (urlParams.has('photos') || urlParams.has('edit')) {
    const showPhotosEditor = () => {
      const photosBtn = document.getElementById('customPhotosBtn');
      if (photosBtn) photosBtn.style.display = 'flex';
      const modal = document.getElementById('photosModal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('active');
      }
    };
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', showPhotosEditor);
    } else {
      setTimeout(showPhotosEditor, 100);
    }
  }

  // Keyboard shortcut Ctrl + Shift + P for Creator to open photos modal anytime
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
      e.preventDefault();
      const photosBtn = document.getElementById('customPhotosBtn');
      if (photosBtn) photosBtn.style.display = 'flex';
      const modal = document.getElementById('photosModal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('active');
      }
    }
  });

  // Developer preview shortcut
  if (urlParams.has('stage')) {
    const targetStage = urlParams.get('stage');
    const runShortcut = () => {
      const passcodeSection = document.getElementById('passcodeSection');
      if (passcodeSection) {
        passcodeSection.classList.remove('active');
        passcodeSection.classList.add('hidden');
        passcodeSection.style.display = 'none';
      }
      if (targetStage === 'gift') {
        const countdownSection = document.getElementById('countdownSection');
        if (countdownSection) {
          countdownSection.classList.remove('hidden');
          countdownSection.classList.add('active');
          revealGiftCharacter();
        }
      } else if (targetStage === 'countdown') {
        const countdownSection = document.getElementById('countdownSection');
        if (countdownSection) {
          countdownSection.classList.remove('hidden');
          countdownSection.classList.add('active');
          countdownNum = 5;
          start5SecondCountdown();
        }
      } else if (targetStage === 'cake') {
        const topBar = document.getElementById('topBarControls');
        if (topBar) topBar.style.display = 'flex';
        showCakeStage();
      } else if (targetStage === 'globe') {
        const topBar = document.getElementById('topBarControls');
        if (topBar) topBar.style.display = 'flex';
        launch3DPhotoExperience();
      } else if (targetStage === 'room' || targetStage === '3d' || targetStage === 'cards' || targetStage === 'letter' || targetStage === 'coupons' || targetStage === 'heart' || targetStage === 'polaroid' || targetStage === 'photos') {
        const topBar = document.getElementById('topBarControls');
        if (topBar) topBar.style.display = 'flex';
        launch3DPhotoExperience();
        setTimeout(() => {
          triggerGlobeExplosion();
          if (targetStage === 'cards') {
            setTimeout(() => {
              const cardsSec = document.getElementById('surpriseCardsSection');
              if (cardsSec) cardsSec.scrollIntoView({ behavior: 'smooth' });
            }, 1200);
          } else if (targetStage === 'letter') {
            setTimeout(() => {
              const envCard = document.getElementById('envelopeCard');
              if (envCard) envCard.scrollIntoView({ behavior: 'smooth' });
              const envOuter = document.getElementById('envelopeOuter');
              if (envOuter) envOuter.click();
            }, 1200);
          } else if (targetStage === 'polaroid' || targetStage === 'photos') {
            setTimeout(() => {
              const polSec = document.querySelector('.polaroid-gallery-card');
              if (polSec) polSec.scrollIntoView({ behavior: 'smooth' });
            }, 1200);
          } else if (targetStage === 'coupons') {
            setTimeout(() => {
              const coupSec = document.querySelector('.coupons-card');
              if (coupSec) coupSec.scrollIntoView({ behavior: 'smooth' });
            }, 1200);
          } else if (targetStage === 'heart') {
            setTimeout(() => {
              const heartSec = document.querySelector('.heart-tap-card');
              if (heartSec) heartSec.scrollIntoView({ behavior: 'smooth' });
            }, 1200);
          }
        }, 400);
      }
    };
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', runShortcut);
    } else {
      setTimeout(runShortcut, 50);
    }
  }
} catch (e) {}

// ========================================================
// 1. ภาพถ่ายความทรงจำ 4 รูป (วนซ้ำรอบลูกโลกและห้องภาพ 3D)
//    (ใช้รูปภาพ 4 รูป วนซ้ำให้เต็มลูกโลก 100 ใบ และห้องภาพ 360°)
// ========================================================
const DEFAULT_PHOTOS = [
  "images/photo1.jpg?v=20261106_1930",
  "images/photo2.jpg?v=20261106_1930",
  "images/photo3.jpg?v=20261106_1930",
  "images/photo4.jpg?v=20261106_1930"
];

function getActivePhotos() {
  try {
    const saved = localStorage.getItem('nongjingjing_photos');
    if (saved) {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr) && arr.length === 4 && arr[0].startsWith('data:')) {
        return arr;
      }
    }
  } catch (e) {}
  return [...DEFAULT_PHOTOS];
}

let GALLERY_PHOTOS = getActivePhotos();

// Pastel palette for Confetti (Cute White & Pastel Pink)
const PASTEL_PALETTE = ['#fed3e6', '#fca5cc', '#ff8fb8', '#ffb3d1', '#ffffff', '#ffe5f1', '#ff5c8a', '#ffd166'];

// ========================================================
// 2. BACKGROUND STARS GENERATOR
// ========================================================
function initStars() {
  const container = document.getElementById('starsBg');
  if (!container) return;
  container.innerHTML = '';
  const count = 45;

  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.className = 'star-dot';
    const size = Math.random() * 3 + 2;
    dot.style.width = `${size}px`;
    dot.style.height = `${size}px`;
    dot.style.left = `${Math.random() * 100}vw`;
    dot.style.top = `${Math.random() * 100}vh`;
    dot.style.animationDuration = `${Math.random() * 2 + 1.5}s`;
    dot.style.animationDelay = `${Math.random() * 2}s`;
    container.appendChild(dot);
  }
}

// ========================================================
// 3. SYNTHESIZED AUDIO & BGM (WEB AUDIO API)
// ========================================================
let audioCtx = null;
let isBgmPlaying = false;
let bgmTimeout = null;
const bgmBtn = document.getElementById('bgmBtn');

const HBD_NOTES = [
  { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.35 }, { f: 293.66, d: 0.7 }, { f: 261.63, d: 0.7 }, { f: 349.23, d: 0.7 }, { f: 329.63, d: 1.2 },
  { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.35 }, { f: 293.66, d: 0.7 }, { f: 261.63, d: 0.7 }, { f: 392.00, d: 0.7 }, { f: 349.23, d: 1.2 },
  { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.35 }, { f: 523.25, d: 0.7 }, { f: 440.00, d: 0.7 }, { f: 349.23, d: 0.7 }, { f: 329.63, d: 0.7 }, { f: 293.66, d: 1.0 },
  { f: 466.16, d: 0.35 }, { f: 466.16, d: 0.35 }, { f: 440.00, d: 0.7 }, { f: 349.23, d: 0.7 }, { f: 392.00, d: 0.7 }, { f: 349.23, d: 1.4 }
];

function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playTone(freq, duration, delay, type = 'sine', volume = 0.22) {
  try {
    ensureAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);

    gain.gain.setValueAtTime(0.0001, audioCtx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(volume, audioCtx.currentTime + delay + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(audioCtx.currentTime + delay);
    osc.stop(audioCtx.currentTime + delay + duration);
  } catch (e) {}
}

function playCountTick(num) {
  const f = 400 + (6 - num) * 80;
  playTone(f, 0.18, 0, 'triangle', 0.28);
}

function playKeypadBeep(digit) {
  const tones = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, 1174.66, 1318.51];
  const freq = tones[digit % tones.length] || 660;
  playTone(freq, 0.12, 0, 'sine', 0.25);
}

function playErrorSound() {
  playTone(260, 0.22, 0, 'sawtooth', 0.2);
  playTone(220, 0.3, 0.08, 'sawtooth', 0.2);
}

function playPlantSound(index) {
  const scale = [261.6, 293.7, 329.6, 349.2, 392.0, 440.0, 523.3];
  const f = scale[index % scale.length];
  playTone(f, 0.45, 0, 'sine', 0.3);
  playTone(f * 2, 0.35, 0.05, 'triangle', 0.15);
}

function playBlowSound() {
  try {
    ensureAudio();
    const bufferSize = audioCtx.sampleRate * 0.9;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.25));
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.85);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.85);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    noise.start();
  } catch (e) {}
}

function playGrandFanfare() {
  const chords = [
    [523.25, 659.25, 783.99],
    [587.33, 739.99, 880.00],
    [659.25, 830.61, 987.77],
    [1046.50, 1318.51, 1567.98]
  ];
  chords.forEach((chord, i) => {
    const delay = i * 0.22;
    chord.forEach(f => playTone(f, 0.55, delay, 'triangle', 0.22));
  });
}

function playExplosionSound() {
  try {
    ensureAudio();
    const duration = 1.2;
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.35));
    }
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + duration);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.65, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    noise.start();

    // Deep bass punch
    playTone(110, 0.8, 0, 'sine', 0.5);
    playTone(55, 1.0, 0.05, 'sine', 0.6);
  } catch (e) {}
}

function playHBDMelody() {
  if (!isBgmPlaying) return;
  let curDelay = 0;
  HBD_NOTES.forEach(note => {
    playTone(note.f, note.d, curDelay, 'sine', 0.16);
    curDelay += note.d + 0.05;
  });
  bgmTimeout = setTimeout(() => {
    if (isBgmPlaying) playHBDMelody();
  }, (curDelay + 2.5) * 1000);
}

function startBGM() {
  if (isBgmPlaying) return;
  ensureAudio();
  isBgmPlaying = true;
  bgmBtn.classList.remove('hidden');
  bgmBtn.classList.add('playing');

  const bgmAudio = document.getElementById('bgmAudio');
  if (bgmAudio) {
    bgmAudio.volume = 0.8;
    const p = bgmAudio.play();
    if (p !== undefined) {
      p.catch(() => {});
    }
  } else {
    playHBDMelody();
  }
  updateMusicCardState(true);
}

function stopBGM() {
  isBgmPlaying = false;
  if (bgmTimeout) clearTimeout(bgmTimeout);
  bgmBtn.classList.remove('playing');
  const bgmAudio = document.getElementById('bgmAudio');
  if (bgmAudio) {
    bgmAudio.pause();
  }
  updateMusicCardState(false);
}

bgmBtn.addEventListener('click', () => {
  ensureAudio();
  if (isBgmPlaying) stopBGM();
  else startBGM();
});

// ========================================================
// 3.5 STAGE 0: PASSCODE SCREEN ("ยืนยันความน่ารัก")
// ========================================================
const passcodeSection = document.getElementById('passcodeSection');
const passcodeCard = document.getElementById('passcodeCard');
const passcodePillBox = document.getElementById('passcodePillBox');
const hiddenPasscodeInput = document.getElementById('hiddenPasscodeInput');
const pinSlots = document.querySelectorAll('.pin-slot');
const passcodeResetBtn = document.getElementById('passcodeResetBtn');
const passcodeFeedback = document.getElementById('passcodeFeedback');

let enteredPin = "";
const MAX_PIN_LEN = 4;
let isPasscodeUnlocked = false;

// Global Keypad Press Handler (เรียกได้โดยตรงจาก onclick / onpointerdown)
window.handleKeypadPress = function(val) {
  try {
    ensureAudio();
    if (val === 'clear') {
      resetPasscode();
    } else if (val === 'backspace') {
      deletePasscodeDigit();
    } else if (val >= '0' && val <= '9') {
      appendPasscodeDigit(val);
    }
  } catch (e) {
    console.error("handleKeypadPress error:", e);
  }
};

function updatePinDisplay() {
  const slots = document.querySelectorAll('.pin-slot');
  slots.forEach((slot, idx) => {
    if (idx < enteredPin.length) {
      slot.textContent = "●";
      slot.classList.add('filled');
      slot.style.color = '#ff3377';
      slot.style.transform = 'scale(1.25)';
      slot.style.textShadow = '0 0 10px rgba(255, 51, 119, 0.45)';
    } else {
      slot.textContent = "∗";
      slot.classList.remove('filled');
      slot.style.color = '#b0a0b2';
      slot.style.transform = 'scale(1)';
      slot.style.textShadow = 'none';
    }
  });
}

function appendPasscodeDigit(digit) {
  if (isPasscodeUnlocked) return;
  if (enteredPin.length >= MAX_PIN_LEN) return;
  ensureAudio();
  enteredPin += digit;
  if (hiddenPasscodeInput && hiddenPasscodeInput.value !== enteredPin) {
    hiddenPasscodeInput.value = enteredPin;
  }
  updatePinDisplay();
  playKeypadBeep(parseInt(digit, 10) || enteredPin.length);

  if (enteredPin.length === MAX_PIN_LEN) {
    checkPasscode();
  }
}

function deletePasscodeDigit() {
  if (isPasscodeUnlocked) return;
  if (enteredPin.length > 0) {
    ensureAudio();
    enteredPin = enteredPin.slice(0, -1);
    if (hiddenPasscodeInput) hiddenPasscodeInput.value = enteredPin;
    updatePinDisplay();
    playTone(400, 0.08, 0, 'triangle', 0.2);
    if (passcodeFeedback) {
      passcodeFeedback.textContent = "";
      passcodeFeedback.className = "passcode-feedback";
    }
    if (passcodePillBox) {
      passcodePillBox.classList.remove('error');
    }
  }
}

function resetPasscode() {
  if (isPasscodeUnlocked) return;
  ensureAudio();
  enteredPin = "";
  if (hiddenPasscodeInput) {
    hiddenPasscodeInput.value = "";
    hiddenPasscodeInput.focus();
  }
  updatePinDisplay();
  playTone(350, 0.1, 0, 'sine', 0.2);
  if (passcodeFeedback) {
    passcodeFeedback.textContent = "";
    passcodeFeedback.className = "passcode-feedback";
  }
  if (passcodePillBox) {
    passcodePillBox.classList.remove('error');
    passcodePillBox.classList.remove('success');
  }
}

function checkPasscode() {
  if (enteredPin === SECRET_PASSCODE || enteredPin === "0711") {
    // ปลดล็อกสำเร็จ!
    isPasscodeUnlocked = true;
    if (hiddenPasscodeInput) hiddenPasscodeInput.blur();
    if (passcodePillBox) {
      passcodePillBox.classList.remove('error');
      passcodePillBox.classList.add('success');
    }
    if (passcodeFeedback) {
      passcodeFeedback.textContent = "✓ ยืนยันความน่ารักสำเร็จ! ✨";
      passcodeFeedback.className = "passcode-feedback success-text";
    }

    playGrandFanfare();
    celebrateConfettiWave();
    if (!isBgmPlaying) startBGM();

    // ค่อยๆ สลับหน้าไปยัง Stage 1: Countdown
    setTimeout(() => {
      if (passcodeSection) {
        passcodeSection.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        passcodeSection.style.opacity = '0';
        passcodeSection.style.transform = 'scale(0.96)';
        setTimeout(() => {
          passcodeSection.classList.remove('active');
          passcodeSection.classList.add('hidden');
          passcodeSection.style.opacity = '';
          passcodeSection.style.transform = '';
          passcodeSection.style.transition = '';

          if (countdownSection) {
            countdownSection.classList.remove('hidden');
            countdownSection.classList.add('active');
          }

          // แสดงแถบปุ่มควบคุมด้านบนเมื่อปลดล็อคผ่านแล้ว
          const topBar = document.getElementById('topBarControls');
          if (topBar) {
            topBar.style.display = 'flex';
            topBar.style.opacity = '0';
            topBar.style.transition = 'opacity 0.6s ease';
            setTimeout(() => { topBar.style.opacity = '1'; }, 50);
          }

          start5SecondCountdown();
        }, 600);
      }
    }, 700);
  } else {
    // รหัสไม่ถูกต้อง
    playErrorSound();
    if (passcodePillBox) {
      passcodePillBox.classList.add('error');
    }
    if (passcodeFeedback) {
      passcodeFeedback.textContent = "รหัสยังไม่ถูกต้องน้า ลองใหม่อีกครั้งค่ะ ♡ (ใบ้ให้นะ: วันสำคัญของเราสองคน 🎂)";
      passcodeFeedback.className = "passcode-feedback error-text";
    }

    setTimeout(() => {
      enteredPin = "";
      if (hiddenPasscodeInput) {
        hiddenPasscodeInput.value = "";
        hiddenPasscodeInput.focus();
      }
      updatePinDisplay();
      if (passcodePillBox) passcodePillBox.classList.remove('error');
    }, 750);
  }
}

// Expose globally so inline engine and buttons can call them directly
window.checkPasscode = checkPasscode;
window.start5SecondCountdown = start5SecondCountdown;
window.revealGiftCharacter = revealGiftCharacter;
window.showCakeStage = showCakeStage;

function initPasscodeStage() {
  if (window.location.search.includes('stage=')) return;
  enteredPin = "";
  isPasscodeUnlocked = false;
  updatePinDisplay();

  // จัดการ input จากทั้ง mobile keyboard และ desktop
  if (hiddenPasscodeInput) {
    hiddenPasscodeInput.addEventListener('focus', () => {
      if (passcodePillBox) passcodePillBox.classList.add('focused');
    });

    hiddenPasscodeInput.addEventListener('blur', () => {
      if (passcodePillBox) passcodePillBox.classList.remove('focused');
    });

    hiddenPasscodeInput.addEventListener('input', (e) => {
      if (isPasscodeUnlocked) return;
      ensureAudio();
      const cleanVal = hiddenPasscodeInput.value.replace(/\D/g, '').slice(0, MAX_PIN_LEN);
      if (cleanVal.length > enteredPin.length) {
        const lastChar = cleanVal[cleanVal.length - 1];
        playKeypadBeep(parseInt(lastChar, 10) || cleanVal.length);
      } else if (cleanVal.length < enteredPin.length) {
        playTone(400, 0.08, 0, 'triangle', 0.2);
      }
      enteredPin = cleanVal;
      hiddenPasscodeInput.value = cleanVal;
      updatePinDisplay();

      if (enteredPin.length === MAX_PIN_LEN) {
        checkPasscode();
      }
    });
  }

  // ปล่อยให้ inline engine ใน HTML จัดการ keypad โดยตรง เพื่อไม่ให้เกิดการกดซ้ำซ้อน 2 ตัว

  // แตะที่การ์ด กล่องรหัส หรือหน้าจอเพื่อเปิดคีย์บอร์ด
  if (passcodeSection) {
    passcodeSection.addEventListener('click', (e) => {
      if (!e.target.closest('.num-key-btn') && e.target !== passcodeResetBtn && hiddenPasscodeInput && !isPasscodeUnlocked) {
        hiddenPasscodeInput.focus();
      }
    });
  }

  if (passcodeResetBtn) {
    passcodeResetBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      resetPasscode();
    };
  }

  window.addEventListener('keydown', (e) => {
    if (isPasscodeUnlocked) return;
    if (passcodeSection && passcodeSection.classList.contains('hidden')) return;

    // ป้องกันการพิมพ์เบิ้ล 2 ตัว: ถ้า <input> โฟกัสอยู่แล้ว ปล่อยให้ input event ของ <input> ทำงานโดยตรง
    if (document.activeElement === hiddenPasscodeInput) {
      if (e.key === 'Escape') {
        resetPasscode();
      }
      return;
    }

    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      appendPasscodeDigit(e.key);
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      deletePasscodeDigit();
    } else if (e.key === 'Escape') {
      resetPasscode();
    }
  });
}

// ========================================================
// 4. STAGE 1: 5-SECOND COUNTDOWN (นับ 5 วิแล้วเต้กออกมา)
// ========================================================
const countdownSection = document.getElementById('countdownSection');
const countdownDigit = document.getElementById('countdownDigit');
const countdownSub = document.getElementById('countdownSub');

let countdownNum = 5;
let countdownTimer = null;

function start5SecondCountdown() {
  countdownNum = 5;
  updateCountdownDisplay();

  countdownTimer = setInterval(() => {
    countdownNum--;
    if (countdownNum > 0) {
      updateCountdownDisplay();
    } else {
      clearInterval(countdownTimer);
      revealGiftCharacter();
    }
  }, 1000);
}

function revealGiftCharacter() {
  // ซ่อน stage badge ด้านบน เพื่อให้การ์ดดูคลีนและมีเฉพาะรูปกับข้อความ
  const stageBadge = document.getElementById('countdownBadge');
  if (stageBadge) {
    stageBadge.style.display = 'none';
  }

  const countdownCard = document.getElementById('countdownCard') || document.querySelector('.countdown-card');
  if (countdownCard) {
    countdownCard.classList.add('clickable');
  }

  // เปลี่ยนจากเค้กเป็นรูปที่ 2 (รูปน้องเชอร์รี่น่ารัก)
  const countdownNumberWrapper = document.getElementById('countdownNumberWrapper');
  if (countdownNumberWrapper) {
    countdownNumberWrapper.style.height = 'auto';
    countdownNumberWrapper.style.margin = '6px 0 12px 0';
    countdownNumberWrapper.innerHTML = `
      <div class="gift-character-wrapper">
        <img src="images/gift_character.png" alt="เรามีของมาให้" class="gift-character-reveal-img">
      </div>
    `;
  }

  // มีข้อความขึ้นว่า "เค้ามีอะไรจะให้" ตามคำขอของผู้ใช้
  countdownSub.style.display = 'block';
  countdownSub.innerHTML = `
    <div class="gift-reveal-message">เค้ามีอะไรจะให้</div>
  `;

  countdownSection.style.cursor = 'pointer';

  playGrandFanfare();
  celebrateConfettiWave();

  // ยิงพลุลูกที่ 2 และ 3 เพิ่มความตระการตา
  setTimeout(() => {
    if (!hasTransitioned) celebrateConfettiWave();
  }, 1200);

  setTimeout(() => {
    if (!hasTransitioned) celebrateConfettiWave();
  }, 2400);

  // ค้างหน้านี้ไว้ ไม่ตั้งเวลาข้ามอัตโนมัติ (ต้องกด/แตะเท่านั้นถึงจะไปหน้าต่อไป)
  let hasTransitioned = false;
  const transitionToCake = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (hasTransitioned) return;
    hasTransitioned = true;
    countdownSection.onclick = null;
    countdownSection.style.cursor = '';
    if (countdownCard) countdownCard.classList.remove('clickable');

    playPlantSound(0);
    countdownSection.style.transition = 'opacity 0.6s ease';
    countdownSection.style.opacity = '0';
    setTimeout(() => {
      countdownSection.classList.remove('active');
      countdownSection.classList.add('hidden');
      countdownSection.style.opacity = '';
      countdownSection.style.transition = '';
      showCakeStage();
    }, 600);
  };

  // แตะที่การ์ด รูป หรือหน้าจอเพื่อไปหน้าต่อไป
  countdownSection.onclick = transitionToCake;
  if (countdownCard) {
    countdownCard.onclick = transitionToCake;
  }
}

function updateCountdownDisplay() {
  const countdownCard = document.getElementById('countdownCard') || document.querySelector('.countdown-card');
  if (countdownCard) countdownCard.classList.remove('clickable');
  countdownSection.onclick = null;
  countdownSection.style.cursor = '';

  const stageBadge = document.getElementById('countdownBadge');
  if (stageBadge) stageBadge.style.display = '';

  const countdownNumberWrapper = document.getElementById('countdownNumberWrapper');
  if (countdownNumberWrapper) {
    countdownNumberWrapper.style.height = '';
    countdownNumberWrapper.style.margin = '';
    countdownNumberWrapper.innerHTML = `<span class="countdown-digit pulse-in" id="countdownDigit">${countdownNum}</span>`;
  }

  countdownSub.innerHTML = '';
  countdownSub.style.fontSize = '';
  countdownSub.style.color = '';
  countdownSub.style.fontWeight = '';

  playCountTick(countdownNum);
  countdownSub.textContent = "";
}

// ========================================================
// 5. STAGE 2: INTERACTIVE CAKE & CANDLES (ปักเทียน 7 เล่ม)
// ========================================================
const cakeSection = document.getElementById('cakeSection');
const cakeInteractWrapper = document.getElementById('cakeInteractWrapper');
const candlePromptText = document.getElementById('candlePromptText');
const candlePromptSub = document.getElementById('candlePromptSub');
const candleCountBadge = document.getElementById('candleCountBadge');
const candlesSlotLayer = document.getElementById('candlesSlotLayer');
const cakeHalo = document.getElementById('cakeHalo');
const clickHintFooter = document.getElementById('clickHintFooter');

let candleCount = 0;
const MAX_CANDLES = 7;
let isSetupComplete = false;
let isBlownOut = false;

// 7 ตำแหน่งพิกัดแนวนอนบนหน้าเค้กชั้นบนสุด (Left % from 14% to 86%)
const CANDLE_X_PERCENTAGES = [14, 26, 38, 50, 62, 74, 86];

let isAutoPlantingActive = false;
let autoPlantTimeouts = [];

function clearAutoPlantTimers() {
  autoPlantTimeouts.forEach(t => clearTimeout(t));
  autoPlantTimeouts = [];
  isAutoPlantingActive = false;
}

function showCakeStage() {
  cakeSection.classList.remove('hidden');
  cakeSection.classList.add('active');
  candleCount = 0;
  isSetupComplete = false;
  isBlownOut = false;
  candlesSlotLayer.innerHTML = '';
  cakeHalo.classList.add('dimmed');

  // แสดงปุ่มไมค์เฉพาะตอนเป่าเค้กวันเกิด
  if (micToggleBtn) {
    micToggleBtn.style.display = 'flex';
  }

  // เริ่มอนิเมชันตัวละครเดินมาจากซ้ายมือสุดเพื่อปักเทียนอัตโนมัติ
  startCharacterPlantingSequence();
}

cakeInteractWrapper.addEventListener('click', handleCakeClick);

function handleCakeClick(e) {
  ensureAudio();

  // 1. ถ้าเทียนครบ 7 เล่มแล้ว และยังไม่ได้เป่า ➔ แตะเพื่อเป่าเค้ก
  if (isSetupComplete && !isBlownOut) {
    blowOutCandles();
    return;
  }

  // 2. ถ้ากำลังเล่นอนิเมชันปักเทียนอยู่ ➔ ห้ามกดข้ามเด็ดขาด ต้องให้อิโมจิปักจนครบ 7 เล่มเท่านั้น
  if (isAutoPlantingActive && !isSetupComplete) {
    return;
  }
}

function plantCandle(count) {
  playPlantSound(count - 1);

  // เอฟเฟกต์ละอองวิบวับเบาๆ ทุกครั้งที่ปักเทียน
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 15,
      spread: 45,
      origin: { x: 0.5, y: 0.45 },
      colors: ['#ffe29a', '#ffd166', '#ff8fb8', '#ffffff', '#ff5c8a'],
      scalar: 0.75,
      ticks: 40
    });
  }

  const candleDiv = document.createElement('div');
  candleDiv.className = 'candle-instance';
  candleDiv.id = `candle-${count}`;
  candleDiv.style.left = `${CANDLE_X_PERCENTAGES[count - 1]}%`;

  candleDiv.innerHTML = `
    <div class="flame-box">
      <div class="flame-shape" id="flame-${count}"></div>
    </div>
    <div class="candle-wick"></div>
    <div class="candle-stick"></div>
  `;

  candlesSlotLayer.appendChild(candleDiv);
  cakeHalo.classList.remove('dimmed');
}

function startCharacterPlantingSequence() {
  window.startCharacterPlantingSequence = startCharacterPlantingSequence;
  clearAutoPlantTimers();
  isAutoPlantingActive = true;

  const actor = document.getElementById('candleCarrierActor');
  const heldCandle = document.getElementById('carrierHeldCandle');
  const bubble = document.getElementById('carrierBubble');

  candleCount = 0;
  candlesSlotLayer.innerHTML = '';
  cakeHalo.classList.add('dimmed');

  candleCountBadge.textContent = "🎂 เค้กวันเกิดของ NONGJINGJING";
  candlePromptText.textContent = "กำลังเดินมาปักเทียนให้ที่รัก... ♡";
  candlePromptSub.textContent = "(เจ้าของวันเกิดรอเป่าเทียนได้เลยนะคะ ✨)";
  clickHintFooter.textContent = "🕯️ ตัวละครกำลังเดินมาปักเทียนทีละเล่ม... 🕯️";

  if (!actor) {
    for (let i = 1; i <= MAX_CANDLES; i++) {
      plantCandle(i);
    }
    finishAllCandles();
    return;
  }

  // รีเซ็ตตำแหน่งเริ่มต้นของตัวละครที่ซ้ายมือสุดนอกการ์ด
  actor.style.transition = 'none';
  actor.style.left = '-80px';
  actor.className = 'candle-carrier-actor is-walking';
  if (heldCandle) {
    heldCandle.style.opacity = '1';
    heldCandle.style.transform = 'scale(1)';
  }
  if (bubble) {
    bubble.classList.add('hidden');
    bubble.textContent = 'อธิษฐานแล้วเป่าได้เลยย';
  }

  void actor.offsetWidth; // บังคับให้เบราว์เซอร์ reflow

  // 7 พิกัดแนวนอนสำหรับตัวละครเพื่อให้เทียนที่ถือตรงกับตำแหน่งปักบนหน้าเค้ก
  const slotPositions = [35, 51, 68, 85, 102, 119, 135];

  // ก้าวที่ 1: เดินมาจากซ้ายมือสุด (-80px) ไปยังเล่มที่ 1 (35px)
  actor.style.transition = 'left 0.85s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  actor.style.left = `${slotPositions[0]}px`;
  actor.classList.add('is-walking');

  function schedulePlantStep(slotIdx, delay) {
    const t = setTimeout(() => {
      if (!isAutoPlantingActive) return;

      // เดินมาถึงจุดปักเทียนแล้ว
      actor.classList.remove('is-walking');
      actor.classList.add('is-planting');

      const num = slotIdx + 1;
      candleCount = num;
      plantCandle(num);

      if (num === 1) {
        candlePromptText.textContent = "ปักเทียนเล่มที่ 1 แล้วค่ะ ♡";
        candleCountBadge.textContent = "🕯️ เทียนเล่มที่ 1 / 7";
      } else if (num < 6) {
        candlePromptText.textContent = `ปักเทียนเล่มที่ ${num} แล้วค่ะ ♡`;
        candleCountBadge.textContent = `🕯️ เทียนเล่มที่ ${num} / 7`;
      } else if (num === 6) {
        candlePromptText.textContent = "อีกเล่มเดียวจะครบแล้วนะคะที่รัก ♡";
        candleCountBadge.textContent = "🕯️ เทียนเล่มที่ 6 / 7";
      } else if (num === 7) {
        candleCountBadge.textContent = "🎉 ครบ 7 เล่มสมบูรณ์แบบ!";
      }

      // เมื่อก้มปักเสร็จ ให้เดินต่อไปยังเล่มถัดไป
      const tNext = setTimeout(() => {
        if (!isAutoPlantingActive) return;
        actor.classList.remove('is-planting');

        if (slotIdx < 6) {
          // เดินไปจุดถัดไป
          actor.style.transition = 'left 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          actor.style.left = `${slotPositions[slotIdx + 1]}px`;
          actor.classList.add('is-walking');
        } else {
          // ปักครบทั้ง 7 เล่มแล้ว!
          finishAllCandles();
        }
      }, 280);
      autoPlantTimeouts.push(tNext);
    }, delay);
    autoPlantTimeouts.push(t);
  }

  // ตั้งเวลาการปักทีละเล่ม (เล่ม 1-7)
  let stepDelay = 850;
  for (let i = 0; i < 7; i++) {
    schedulePlantStep(i, stepDelay);
    stepDelay += (280 + 380);
  }
}

function finishAllCandles() {
  const actor = document.getElementById('candleCarrierActor');
  const heldCandle = document.getElementById('carrierHeldCandle');
  const bubble = document.getElementById('carrierBubble');

  if (heldCandle) {
    heldCandle.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    heldCandle.style.opacity = '0';
    heldCandle.style.transform = 'scale(0.3)';
  }

  if (actor) {
    actor.style.transition = 'left 0.48s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    actor.style.left = '210px';
    actor.classList.add('is-walking');

    setTimeout(() => {
      actor.classList.remove('is-walking');
      actor.classList.add('is-cheering');
      if (bubble) {
        bubble.textContent = 'อธิษฐานแล้วเป่าได้เลยย';
        bubble.classList.remove('hidden');
      }
    }, 500);
  }

  isSetupComplete = true;
  isAutoPlantingActive = false;

  playGrandFanfare();
  celebrateConfettiWave();

  candlePromptText.textContent = "🎂 เป่าเทียนเลย! 🎂";
  candlePromptSub.textContent = "✨ เทียนสว่างครบ 7 เล่มแล้ว เป่าลมใส่ไมค์ หรือแตะที่หน้าเค้กเพื่อเป่าได้เลย ✨";
  candleCountBadge.textContent = "🎉 ครบ 7 เล่มสมบูรณ์แบบ!";
  clickHintFooter.textContent = "💨 เจ้าของวันเกิดเป่าเทียนอธิษฐานได้เลยค่ะ ♡ 💨";
}

function fastForwardPlanting() {
  clearAutoPlantTimers();

  for (let i = candleCount + 1; i <= MAX_CANDLES; i++) {
    plantCandle(i);
  }
  candleCount = MAX_CANDLES;

  finishAllCandles();
}

// ฟังก์ชันเป่าดับเทียน (Blow Out Interaction)
function blowOutCandles() {
  if (isBlownOut) return;
  isBlownOut = true;
  clearAutoPlantTimers();

  // ซ่อนปุ่มไมค์และปิดไมโครโฟนทันทีเมื่อเป่าเทียนเสร็จ
  if (micToggleBtn) {
    micToggleBtn.style.display = 'none';
  }
  if (isMicActive && micStream) {
    micStream.getTracks().forEach(t => t.stop());
    isMicActive = false;
    micToggleBtn.classList.remove('active');
    if (micStatusText) micStatusText.textContent = "เปิดไมค์เป่า";
  }

  playBlowSound();

  const actor = document.getElementById('candleCarrierActor');
  const bubble = document.getElementById('carrierBubble');
  if (actor) {
    actor.className = 'candle-carrier-actor is-cheering';
  }
  if (bubble) {
    bubble.textContent = 'เย่! สุขสันต์วันเกิดน้าาา! 💖✨';
    bubble.classList.remove('hidden');
  }

  // ดับเปลวไฟทุกเล่ม + เพิ่มควันสีขาวพาสเทล
  for (let i = 1; i <= MAX_CANDLES; i++) {
    const flame = document.getElementById(`flame-${i}`);
    if (flame) {
      flame.style.opacity = '0';
      flame.style.transform = 'scale(0.2)';
    }

    const candleEl = document.getElementById(`candle-${i}`);
    if (candleEl) {
      const smoke = document.createElement('div');
      smoke.className = 'smoke-puff';
      candleEl.appendChild(smoke);
    }
  }

  cakeHalo.classList.add('dimmed');
  candlePromptText.textContent = "✨ อธิษฐานสำเร็จแล้ว ✨";
  candlePromptText.style.color = "#ff3377";
  candlePromptSub.textContent = "ขอให้ทุกความปรารถนาของ NONGJINGJING เป็นจริงนะคะ ♡";
  clickHintFooter.textContent = "";

  setTimeout(() => {
    cakeSection.classList.remove('active');
    cakeSection.classList.add('hidden');
    runPostCakeFadeScenes();
  }, 1600);
}

// ========================================================
// 6. STAGE 3: POST-CAKE FADE SCENES:
//    HAPPY ➔ BIRTHDAY ➔ TO ➔ NONGJINGJING (แบบ เปลี่ยนฉาก fade)
// ========================================================
const fadeSceneStage = document.getElementById('fadeSceneStage');
const fadeWordBox = document.getElementById('fadeWordBox');
const fadeMainText = document.getElementById('fadeMainText');
const fadeBadge = document.getElementById('fadeBadge');
const fadeSubNote = document.getElementById('fadeSubNote');

const waitMs = ms => new Promise(res => setTimeout(res, ms));

const POST_CAKE_SCENES = [
  { text: "HAPPY", duration: 1100, badge: "✦ WISHING YOU ✦", note: "สุขสันต์วันเกิดคนพิเศษ ♡", isClimax: false },
  { text: "BIRTHDAY", duration: 1100, badge: "✦ THE HAPPIEST ✦", note: "ขอให้รอยยิ้มนี้อยู่ตลอดไป ✨", isClimax: false },
  { text: "TO", duration: 900, badge: "✦ DEDICATED TO ✦", note: "แด่คนนี้คนเดียวเท่านั้น 💫", isClimax: false },
  { text: "NONGJINGJING 💖", duration: 3200, badge: "👑 PRINCESS OF THE DAY ✨", note: "เจ้าหญิงคนสวยของวันนี้ ♡", isClimax: true }
];

async function runPostCakeFadeScenes() {
  fadeSceneStage.classList.remove('hidden');
  void fadeSceneStage.offsetWidth;
  fadeSceneStage.classList.add('visible');

  for (let i = 0; i < POST_CAKE_SCENES.length; i++) {
    const scene = POST_CAKE_SCENES[i];

    fadeBadge.textContent = scene.badge;
    fadeSubNote.textContent = scene.note;
    fadeMainText.textContent = scene.text;
    fadeMainText.className = 'fade-main-text ' + (scene.isClimax ? 'fade-climax' : 'fade-word');

    fadeWordBox.classList.remove('fade-out');
    fadeWordBox.classList.add('fade-in');

    if (scene.isClimax) {
      playGrandFanfare();
      celebrateFullFirework();
      startBGM();
    } else {
      playTone(520 + i * 85, 0.35, 0, 'sine', 0.28);
    }

    await waitMs(scene.duration);

    if (i < POST_CAKE_SCENES.length - 1) {
      fadeWordBox.classList.remove('fade-in');
      fadeWordBox.classList.add('fade-out');
      await waitMs(450);
    }
  }

  await waitMs(400);
  fadeSceneStage.classList.remove('visible');
  setTimeout(() => {
    fadeSceneStage.classList.add('hidden');
    launch3DPhotoExperience();
  }, 600);
}

// ========================================================
// 7. STAGE 4: THREE.JS FULLSCREEN 3D PHOTO GLOBE &
//    CYLINDRICAL ROOM GALLERY
// ========================================================
const threeSection = document.getElementById('threeSection');
const threeCanvasContainer = document.getElementById('threeCanvasContainer');
const galleryModeHint = document.getElementById('galleryModeHint');
const centerRoomMessage = document.getElementById('centerRoomMessage');
const globeTapHintWrapper = document.getElementById('globeTapHintWrapper');
const explodeGlobeBtn = document.getElementById('explodeGlobeBtn');
const whiteFlashOverlay = document.getElementById('whiteFlashOverlay');

let scene, camera, renderer, controls;
let photoMeshes = [];
let roomMeshes = [];
let globeGroup;
let globeCoreMesh;
let roomGroup;
let is3DActive = false;
let isExploded = false;
let isGlobeAssembled = false;
let assembleTimeouts = [];

function clearAllSequenceTimeouts() {
  assembleTimeouts.forEach(t => clearTimeout(t));
  assembleTimeouts = [];
}

function launch3DPhotoExperience() {
  // ซ่อนปุ่มไมค์ในห้องภาพ 3D และหน้าการ์ดเซอร์ไพรส์
  if (micToggleBtn) {
    micToggleBtn.style.display = 'none';
  }
  if (isMicActive && micStream) {
    micStream.getTracks().forEach(t => t.stop());
    isMicActive = false;
    if (micToggleBtn) micToggleBtn.classList.remove('active');
    if (micStatusText) micStatusText.textContent = "เปิดไมค์เป่า";
  }

  threeSection.classList.remove('hidden');
  is3DActive = true;
  isExploded = false;

  initThreeJS();
  createPhotoTilesAndAnimate();
}

function initThreeJS() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xfff7fb);
  scene.fog = new THREE.FogExp2(0xfff5f8, 0.0008);

  // กล้องตั้งระยะที่มองเห็นลูกโลกกลมเนียน ชัดเจน เต็มตา (FOV 55, Distance 235, near 1.0 เพื่อความแม่นยำของ Z-buffer สูงสุด)
  camera = new THREE.PerspectiveCamera(55, width / height, 1.0, 2500);
  camera.position.set(0, 0, 235);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0xfff7fb, 1);
  threeCanvasContainer.innerHTML = '';
  threeCanvasContainer.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = false;
  controls.autoRotateSpeed = 0.8;
  controls.maxDistance = 550;
  controls.minDistance = 20;
  controls.enableZoom = false; // ปิด zoom ใน OrbitControls เพื่อให้เลื่อน mouse wheel ลงมาดูการ์ดข้างล่างได้
  if (renderer.domElement) {
    renderer.domElement.style.touchAction = 'pan-y'; // ให้บนมือถือปัดนิ้วขึ้น-ลงเพื่อเลื่อนหน้าจอได้
    renderer.domElement.addEventListener('wheel', (e) => {
      const stage = document.getElementById('threeSection');
      if (stage) stage.scrollTop += e.deltaY;
    }, { passive: true });
  }

  // แสงจัดให้ออกโทนน่ารัก ละมุน ขาวชมพูพาสเทล
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
  scene.add(ambientLight);

  const pinkLight = new THREE.PointLight(0xfed3e6, 2.5, 800);
  pinkLight.position.set(0, 70, 180);
  scene.add(pinkLight);

  const roseLight = new THREE.PointLight(0xfca5cc, 2.2, 800);
  roseLight.position.set(0, -70, -120);
  scene.add(roseLight);

  globeGroup = new THREE.Group();
  scene.add(globeGroup);

  roomGroup = new THREE.Group();
  roomGroup.visible = false;
  scene.add(roomGroup);

  window.addEventListener('resize', onThreeResize);
  renderer.domElement.addEventListener('click', onThreeCanvasClick);

  animateThreeJS();
}

function onThreeResize() {
  if (!renderer || !camera) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ========================================================
// ฟังก์ชันสร้างรูปทรงการ์ดสี่เหลี่ยมแนวตั้ง ผิวดัดโค้งตามผิวทรงกลม (R = 120)
// ทำให้การ์ดทั้ง 100 ใบแนบชิดผิวทรงกลม เรียบเนียน ไร้มุมเหลี่ยมคม
// ตรงตามภาพอ้างอิง media_1793645157628_20ee20ac.png
// ========================================================
function createCurvedCardGeometry(w, h, R) {
  const geom = new THREE.PlaneGeometry(w, h, 4, 4);
  const pos = geom.attributes.position;
  for (let k = 0; k < pos.count; k++) {
    const vx = pos.getX(k);
    const vy = pos.getY(k);
    const distSq = vx * vx + vy * vy;
    const vz = Math.sqrt(Math.max(0, R * R - distSq)) - R;
    pos.setZ(k, vz);
  }
  geom.computeVertexNormals();
  return geom;
}

// 7 วงละติจูดรอบลูกโลก (รวมทั้งสิ้น 100 ใบ แนบสนิท ขอบบางสม่ำเสมอ)
const GLOBE_TIERS = [
  { phi: 62 * (Math.PI / 180), count: 8, offset: 0 },
  { phi: 42 * (Math.PI / 180), count: 14, offset: Math.PI / 14 },
  { phi: 21 * (Math.PI / 180), count: 18, offset: 0 },
  { phi: 0, count: 20, offset: Math.PI / 20 },
  { phi: -21 * (Math.PI / 180), count: 18, offset: 0 },
  { phi: -42 * (Math.PI / 180), count: 14, offset: Math.PI / 14 },
  { phi: -62 * (Math.PI / 180), count: 8, offset: 0 }
];

// ========================================================
// ลูกโลกรูปภาพ 3D (100 ใบ) และห้องภาพ 360° ทรงกระบอก
// แผ่นการ์ดทุกใบมีกรอบสีขาวคมชัด สไตล์โพลาลอยด์
// เมื่อกดระเบิด รูปทั้ง 100 ใบจะระเบิดกระจายตัวพุ่งออกในอวกาศ 3D
// แล้วเลี้ยวโค้งเข้ามาประกอบเป็นห้องภาพ 360° โค้งโอบรอบตัว
// ตรงตาม media_1793647499275_55d3ad2d.png
// ========================================================
function createPhotoTilesAndAnimate() {
  const textureLoader = new THREE.TextureLoader();
  textureLoader.setCrossOrigin('anonymous');

  photoMeshes = [];
  while (globeGroup.children.length > 0) {
    globeGroup.remove(globeGroup.children[0]);
  }

  const globeRadius = 120;
  const roomRadius = 275;

  // โหลด Texture ของรูปทั้ง 4 รูปเก็บไว้ เพื่อความลื่นไหลและคมชัดสูงสุด
  const loadedTextures = GALLERY_PHOTOS.map(url => {
    const tex = textureLoader.load(url);
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  });

  const frameW = 32;
  const frameH = 39;
  const photoW = 29.5;
  const photoH = 36.5;

  const borderW = 32.8;
  const borderH = 39.8;

  const borderGeom = createCurvedCardGeometry(borderW, borderH, globeRadius);
  const frameGeom = createCurvedCardGeometry(frameW, frameH, globeRadius);
  const photoGeom = createCurvedCardGeometry(photoW, photoH, globeRadius);

  // วัสดุกรอบหลังและขอบการ์ด (ชมพูพาสเทลเนียนเรียบ) ด้านหลังการ์ดจะเป็นสีชมพูสะอาดตา ไม่ให้ภาพถ่ายทะลุไปโผล่ด้านหลัง
  const borderMat = new THREE.MeshBasicMaterial({
    color: 0xffd6e8,
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: 2,
    polygonOffsetUnits: 2
  });
  // กรอบสีขาวโพลารอยด์ แสดงเฉพาะด้านหน้า (FrontSide) ป้องกันการซ้อนเหลื่อม
  const frameMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.FrontSide,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1
  });

  let cardIndex = 0;

  for (let t = 0; t < GLOBE_TIERS.length; t++) {
    const tier = GLOBE_TIERS[t];
    const phi = tier.phi;
    const count = tier.count;
    const offset = tier.offset;
    const step = (Math.PI * 2) / count;

    for (let k = 0; k < count; k++) {
      const lambda = k * step + offset;

      // 1. ตำแหน่งและการหมุนบนผิวทรงกลมลูกโลก (Radius = 120)
      const cx = globeRadius * Math.cos(phi) * Math.sin(lambda);
      const cy = globeRadius * Math.sin(phi);
      const cz = globeRadius * Math.cos(phi) * Math.cos(lambda);
      const globeCenterPos = new THREE.Vector3(cx, cy, cz);

      const R_globe = new THREE.Vector3(Math.cos(lambda), 0, -Math.sin(lambda));
      const N_globe = new THREE.Vector3(Math.cos(phi) * Math.sin(lambda), Math.sin(phi), Math.cos(phi) * Math.cos(lambda));
      const U_globe = new THREE.Vector3(
        -Math.sin(phi) * Math.sin(lambda),
        Math.cos(phi),
        -Math.sin(phi) * Math.cos(lambda)
      );
      const globeMatrix = new THREE.Matrix4().makeBasis(R_globe, U_globe, N_globe);
      const globeQuat = new THREE.Quaternion().setFromRotationMatrix(globeMatrix);

      // 2. ตำแหน่งและการหมุนในห้องภาพ 360° (5 แถว x 20 คอลัมน์ = 100 ใบ พอดีเป๊ะ)
      const roomRow = Math.floor(cardIndex / 20); // 0, 1, 2, 3, 4
      const roomCol = cardIndex % 20;             // 0..19
      const rowY = (2 - roomRow) * 62;            // +124, +62, 0, -62, -124
      const roomStagger = (roomRow % 2 === 1) ? (Math.PI / 20) : 0; // ลายสับหว่างอิฐ
      const roomAngle = roomCol * (Math.PI * 2 / 20) + roomStagger;

      const rx = roomRadius * Math.sin(roomAngle);
      const rz = roomRadius * Math.cos(roomAngle);
      const roomTargetPos = new THREE.Vector3(rx, rowY, rz);

      // มุมเอียงหันหน้าเข้าหาจุดกึ่งกลางสายตากล้อง (Concave Amphitheater Tilt)
      const lookTarget = new THREE.Vector3(0, rowY * 0.22, 15);
      const N_room = lookTarget.clone().sub(roomTargetPos).normalize();
      const tempUp = new THREE.Vector3(0, 1, 0);
      const R_room = new THREE.Vector3().crossVectors(tempUp, N_room).normalize();
      const U_room = new THREE.Vector3().crossVectors(N_room, R_room).normalize();
      const roomMatrix = new THREE.Matrix4().makeBasis(R_room, U_room, N_room);
      const roomQuat = new THREE.Quaternion().setFromRotationMatrix(roomMatrix);

      // 3. วนซ้ำรูปภาพ 4 รูปสลับกันอย่างสมดุล (รูปละ 25 ใบ)
      const photoIdx = (k + t) % GALLERY_PHOTOS.length;
      const imgUrl = GALLERY_PHOTOS[photoIdx];
      const texture = loadedTextures[photoIdx];

      // รูปภาพถ่ายแสดงเฉพาะด้านหน้า (FrontSide) 100% ป้องกันภาพสะท้อนทะลุไปโผล่หลังการ์ด
      const photoMat = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.FrontSide,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1
      });

      // ประกอบการ์ด: ขอบเงาสีชมพูพาสเทล + กรอบสีขาวโพลารอยด์ + รูปถ่ายด้านหน้า
      const borderMesh = new THREE.Mesh(borderGeom, borderMat);
      borderMesh.position.z = 0;
      const frameMesh = new THREE.Mesh(frameGeom, frameMat);
      frameMesh.position.z = 0.12;
      const photoMesh = new THREE.Mesh(photoGeom, photoMat);
      photoMesh.position.z = 0.24;

      const cardGroup = new THREE.Group();
      cardGroup.add(borderMesh);
      cardGroup.add(frameMesh);
      cardGroup.add(photoMesh);

      cardGroup.userData = {
        id: cardIndex,
        imgUrl: imgUrl,
        globePos: globeCenterPos,
        globeQuat: globeQuat,
        roomPos: roomTargetPos,
        roomQuat: roomQuat
      };
      photoMesh.userData = { id: cardIndex, imgUrl: imgUrl };
      frameMesh.userData = { id: cardIndex, imgUrl: imgUrl };

      globeGroup.add(cardGroup);
      photoMeshes.push(cardGroup);
      cardIndex++;
    }
  }

  playAssembleSequence();
}

function playAssembleSequence() {
  isExploded = false;
  isGlobeAssembled = false;
  clearAllSequenceTimeouts();

  // รีเซ็ตสถานะหน้าจอแฟลชสีขาว
  if (whiteFlashOverlay) {
    whiteFlashOverlay.className = 'white-flash-overlay';
  }

  if (globeGroup) {
    globeGroup.rotation.y = 0;
  }

  // 1. ตั้งกล้องให้อยู่ตำแหน่งมุมมองลูกโลกทรงกลมสวยๆ เต็มตา พอดี ไม่ขาดไม่เกิน
  new TWEEN.Tween(camera.position)
    .to({ x: 0, y: 0, z: 275 }, 800)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();

  controls.target.set(0, 0, 0);
  controls.autoRotate = false;

  // 2. ซ่อนข้อความกลางห้อง และปุ่มระเบิด
  const bottomActions = document.getElementById('threeBottomActions');
  if (bottomActions) {
    bottomActions.style.display = 'none';
  }
  if (centerRoomMessage) {
    centerRoomMessage.classList.add('hidden');
    centerRoomMessage.classList.remove('visible');
  }
  if (globeTapHintWrapper) {
    globeTapHintWrapper.classList.add('hidden');
  }

  galleryModeHint.textContent = "✨ กำลังรวบรวมรูปภาพ 100 ใบ เป็นลูกโลกความทรงจำ 3D...";

  // 3. Animation: กระจายรูปภาพอยู่ไกลๆ ในอวกาศ แล้วบินมารวมตัวกันเป็นลูกโลกทรงกลมสมูท
  photoMeshes.forEach((cardGroup, idx) => {
    const spawnPos = new THREE.Vector3(
      (Math.random() - 0.5) * 1800,
      (Math.random() - 0.5) * 1400,
      (Math.random() - 0.5) * 1800
    );
    cardGroup.position.copy(spawnPos);
    cardGroup.scale.set(0.08, 0.08, 0.08);

    cardGroup.quaternion.set(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();

    const startQuat = cardGroup.quaternion.clone();
    const animState = { t: 0 };

    new TWEEN.Tween(animState)
      .to({ t: 1 }, 1900)
      .delay(idx * 12)
      .easing(TWEEN.Easing.Cubic.Out)
      .onUpdate(() => {
        cardGroup.position.lerpVectors(spawnPos, cardGroup.userData.globePos, animState.t);
        cardGroup.quaternion.slerpQuaternions(startQuat, cardGroup.userData.globeQuat, animState.t);
        const s = 0.08 + animState.t * 0.92;
        cardGroup.scale.set(s, s, s);
      })
      .onComplete(() => {
        cardGroup.position.copy(cardGroup.userData.globePos);
        cardGroup.quaternion.copy(cardGroup.userData.globeQuat);
        cardGroup.scale.set(1, 1, 1);
      })
      .start();
  });

  // เมื่อรวบรวมรูปภาพเป็นลูกโลกครบสมบูรณ์ (~2.5 วินาที)
  const t1 = setTimeout(() => {
    isGlobeAssembled = true;
    galleryModeHint.textContent = "🌍 ลูกโลกความทรงจำ 3D (แตะที่ลูกโลกเพื่อระเบิดสู่ห้องภาพ 360°)";
    playPlantSound(6);
    celebrateConfettiWave();
    if (renderer && renderer.domElement) {
      renderer.domElement.style.cursor = 'pointer';
    }
    // หมุนวนเป็นลูกโลก 3D รอให้ผู้ใช้กดคลิกเองที่ลูกโลกถึงจะระเบิด (ไม่มีปุ่ม/UI เพิ่มเติมตามที่ขอ)
  }, 2500);
  assembleTimeouts.push(t1);
}

// ========================================================
// ฟังก์ชันระเบิดลูกโลก: ระเบิดกระจายตัวพุ่งออกในอวกาศ 3D (Explosive Blast Out)
// พร้อมแสงวาบระเบิด และกล้องพุ่งทะลุเข้าสู่ห้องภาพ 360° ทรงกระบอก
// ตรงตาม media_1793647499275_55d3ad2d.png
// ========================================================
function triggerGlobeExplosion() {
  if (isExploded) return;
  isExploded = true;
  clearAllSequenceTimeouts();

  if (renderer && renderer.domElement) {
    renderer.domElement.style.cursor = 'default';
  }

  if (globeTapHintWrapper) {
    globeTapHintWrapper.classList.add('hidden');
  }

  // 1. แสงวาบระเบิดแบบเรืองรอง (Luminous Explosion Flash - ไม่ทึบ ไม่บังการกระจายของรูป)
  if (whiteFlashOverlay) {
    whiteFlashOverlay.className = 'white-flash-overlay flashing-burst';
    setTimeout(() => {
      whiteFlashOverlay.className = 'white-flash-overlay fade-burst';
    }, 180);
  }

  playExplosionSound();
  celebrateFullFirework();

  galleryModeHint.textContent = "💥 กำลังระเบิดขยายเป็นห้องภาพ 3D รอบตัวคุณ...";

  // 2. แอนิเมชันกล้องพุ่งทะลุผ่านแรงระเบิดเข้าไปในใจกลางห้องภาพ 360°
  new TWEEN.Tween(camera.position)
    .to({ x: 0, y: 0, z: 15 }, 1600)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onComplete(() => {
      // แสดงข้อความอวยพรลอยกลางอากาศ พร้อมแสงนีออนอบอุ่น
      if (centerRoomMessage) {
        centerRoomMessage.classList.remove('hidden');
        void centerRoomMessage.offsetWidth;
        centerRoomMessage.classList.add('visible');
      }

      // ซ่อนปุ่มนำทางด้านล่างเพื่อให้ห้อง 3D คลีน 100%
      const bottomActions = document.getElementById('threeBottomActions');
      if (bottomActions) {
        bottomActions.style.display = 'none';
      }

      controls.target.set(0, 0, 0);
      controls.minDistance = 1;
      controls.maxDistance = 60;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
      galleryModeHint.textContent = "✨ ห้องภาพ 360° หมุนรอบตัว NONGJINGJING (ลากนิ้ว/เมาส์หมุนดูรอบทิศได้นะ!)";
    })
    .start();

  // 3. แอนิเมชันรูปภาพทั้ง 100 ใบระเบิดกระจายตัวพุ่งออกในอวกาศ (Explosive Radial Blast & Settle)
  photoMeshes.forEach((cardGroup, idx) => {
    const fromPos = cardGroup.position.clone();
    const fromQuat = cardGroup.quaternion.clone();

    // ทิศทางระเบิดพุ่งออกจากจุดศูนย์กลางลูกโลก (Radial Blast Vector)
    const blastDir = fromPos.clone().normalize();
    const blastDist = 340 + (idx % 7) * 18 + Math.random() * 40;
    const blastPeakPos = blastDir.multiplyScalar(blastDist).add(
      new THREE.Vector3(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 50
      )
    );

    // หมุนสุ่มเล็กน้อยตามแรงระเบิด (Explosion Tumble)
    const tumbleAxis = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();
    const blastQuat = fromQuat.clone().multiply(
      new THREE.Quaternion().setFromAxisAngle(tumbleAxis, (Math.random() - 0.5) * 0.7)
    );

    const anim = { t: 0 };
    const delay = (idx % 6) * 14;

    new TWEEN.Tween(anim)
      .to({ t: 1 }, 1550)
      .delay(delay)
      .easing(TWEEN.Easing.Cubic.Out)
      .onUpdate(() => {
        if (anim.t < 0.45) {
          // ช่วงระเบิดพุ่งกระจายออกสู่อวกาศ (0 -> 0.45)
          const p = anim.t / 0.45;
          const easeOut = 1 - Math.pow(1 - p, 2);
          cardGroup.position.lerpVectors(fromPos, blastPeakPos, easeOut);
          cardGroup.quaternion.slerpQuaternions(fromQuat, blastQuat, p);
          const s = 1.0 + easeOut * 0.65; // ขยายขนาดตามแรงระเบิด
          cardGroup.scale.set(s, s, s);
        } else {
          // ช่วงเลี้ยวโค้งเข้าสู่ตำแหน่งห้องภาพ 360° (0.45 -> 1.0)
          const p = (anim.t - 0.45) / 0.55;
          const easeIn = TWEEN.Easing.Back.Out(p);
          cardGroup.position.lerpVectors(blastPeakPos, cardGroup.userData.roomPos, easeIn);
          cardGroup.quaternion.slerpQuaternions(blastQuat, cardGroup.userData.roomQuat, p);
          const s = 1.65 - p * 0.23; // คลายขนาดลงสู่ 1.42 พอดีในห้องภาพ
          cardGroup.scale.set(s, s, s);
        }
      })
      .onComplete(() => {
        cardGroup.position.copy(cardGroup.userData.roomPos);
        cardGroup.quaternion.copy(cardGroup.userData.roomQuat);
        cardGroup.scale.set(1.42, 1.42, 1.42);
      })
      .start();
  });
}

if (explodeGlobeBtn) {
  explodeGlobeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    triggerGlobeExplosion();
  });
}

function animateThreeJS(time) {
  if (!is3DActive) return;
  requestAnimationFrame(animateThreeJS);

  TWEEN.update();

  // หมุนลูกโลกอย่างนุ่มนวลระหว่างที่ยังไม่ระเบิด
  if (!isExploded && globeGroup) {
    globeGroup.rotation.y += 0.005;
  }

  // เมื่ออยู่ในห้องภาพ 360° หมุนห้องภาพเบาๆ ในพื้นหลัง
  if (isExploded && globeGroup) {
    globeGroup.rotation.y += 0.0018;
  }

  controls.update();
  renderer.render(scene, camera);
}

// Raycaster แตะรูปภาพเพื่อเปิดดูรูปใหญ่ หรือแตะลูกโลกเพื่อระเบิด
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const photoLightbox = document.getElementById('photoLightbox');
const lightboxImg = document.getElementById('lightboxImg');
const closeLightboxBtn = document.getElementById('closeLightboxBtn');

function onThreeCanvasClick(event) {
  // 1. ถ้าลูกโลกรวมตัวเสร็จแล้ว และยังไม่ระเบิด ➔ เมื่อแตะที่ลูกโลก ให้ระเบิดทันที!
  if (!isExploded && isGlobeAssembled) {
    triggerGlobeExplosion();
    return;
  }

  // 2. ถ้าอยู่ในห้องภาพระเบิดแล้ว แตะที่รูปเพื่อดูรูปใหญ่
  if (isExploded) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(photoMeshes, true);

    if (intersects.length > 0) {
      let clickedObj = intersects[0].object;
      let imgUrl = clickedObj.userData ? clickedObj.userData.imgUrl : null;
      if (!imgUrl && clickedObj.parent && clickedObj.parent.userData) {
        imgUrl = clickedObj.parent.userData.imgUrl;
      }
      if (imgUrl) {
        openPhotoLightbox(imgUrl);
      }
    }
  }
}

function openPhotoLightbox(imgUrl) {
  if (!imgUrl) return;
  lightboxImg.src = imgUrl;
  photoLightbox.classList.remove('hidden');
}

closeLightboxBtn.addEventListener('click', () => photoLightbox.classList.add('hidden'));
photoLightbox.addEventListener('click', (e) => {
  if (e.target === photoLightbox) photoLightbox.classList.add('hidden');
});

// Replay Animation Button (ดูแอนิเมชันรวบรวม & ระเบิดอีกครั้ง)
const replayAnimBtn = document.getElementById('replayAnimBtn');
if (replayAnimBtn) {
  replayAnimBtn.addEventListener('click', () => {
    if (whiteFlashOverlay) {
      whiteFlashOverlay.className = 'white-flash-overlay';
    }
    if (roomGroup) {
      roomGroup.visible = false;
    }
    if (globeGroup) {
      globeGroup.visible = true;
      globeGroup.rotation.y = 0;
    }
    playAssembleSequence();
  });
}

// Replay All Button
const replayBtn = document.getElementById('replayBtn');
replayBtn.addEventListener('click', () => {
  is3DActive = false;
  isExploded = false;
  isGlobeAssembled = false;
  clearAllSequenceTimeouts();

  // รีเซ็ตการเลื่อนหน้าจอสู่ด้านบนสุด
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (threeSection) threeSection.scrollTop = 0;

  // รีเซ็ตสถานะไมค์
  if (micToggleBtn) {
    micToggleBtn.style.display = 'none';
  }
  if (isMicActive && micStream) {
    micStream.getTracks().forEach(t => t.stop());
    isMicActive = false;
    if (micToggleBtn) micToggleBtn.classList.remove('active');
    if (micStatusText) micStatusText.textContent = "เปิดไมค์เป่า";
  }

  if (whiteFlashOverlay) {
    whiteFlashOverlay.className = 'white-flash-overlay';
  }
  if (roomGroup) {
    roomGroup.visible = false;
  }
  if (globeGroup) {
    globeGroup.visible = true;
    globeGroup.rotation.y = 0;
  }
  if (globeCoreMesh) {
    globeCoreMesh.scale.set(1, 1, 1);
    globeCoreMesh.visible = true;
  }

  threeSection.classList.add('hidden');
  fadeSceneStage.classList.add('hidden');
  fadeSceneStage.classList.remove('visible');
  cakeSection.classList.add('hidden');

  if (centerRoomMessage) {
    centerRoomMessage.classList.add('hidden');
    centerRoomMessage.classList.remove('visible');
  }

  if (globeTapHintWrapper) {
    globeTapHintWrapper.classList.add('hidden');
  }

  if (globeGroup) {
    globeGroup.rotation.y = 0;
  }

  // Reset states
  if (countdownTimer) clearInterval(countdownTimer);
  candleCount = 0;
  isSetupComplete = false;
  isBlownOut = false;

  candlesSlotLayer.innerHTML = '';
  cakeHalo.classList.add('dimmed');
  candlePromptText.textContent = "กำลังเดินมาปักเทียนให้ที่รัก... ♡";
  candlePromptText.style.color = "#ff3377";
  candlePromptSub.textContent = "(เจ้าของวันเกิดรอเป่าเทียนได้เลยนะคะ ✨)";
  candleCountBadge.textContent = "🎂 เค้กวันเกิดของ NONGJINGJING";
  clickHintFooter.textContent = "🕯️ ตัวละครกำลังเดินมาปักเทียนทีละเล่ม... 🕯️";

  // เริ่มนับ 5 วิแล้วเต้กออกมาใหม่!
  countdownSection.classList.remove('hidden');
  countdownSection.classList.add('active');
  start5SecondCountdown();
});

// ========================================================
// 8. OPTIONAL MICROPHONE BLOW DETECTION
// ========================================================
const micToggleBtn = document.getElementById('micToggleBtn');
const micStatusText = document.getElementById('micStatusText');
let isMicActive = false;
let micAudioContext = null;
let micStream = null;
let micAnalyser = null;

micToggleBtn.addEventListener('click', toggleMicrophone);

async function toggleMicrophone() {
  if (isMicActive) {
    if (micStream) micStream.getTracks().forEach(t => t.stop());
    isMicActive = false;
    micToggleBtn.classList.remove('active');
    micStatusText.textContent = "เปิดไมค์เป่า";
  } else {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micAudioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = micAudioContext.createMediaStreamSource(micStream);
      micAnalyser = micAudioContext.createAnalyser();
      micAnalyser.fftSize = 256;
      source.connect(micAnalyser);

      isMicActive = true;
      micToggleBtn.classList.add('active');
      micStatusText.textContent = "ไมค์พร้อมเป่า 🎙️";
      detectBlowAudio();
    } catch (err) {
      alert("ไม่สามารถเข้าถึงไมโครโฟนได้ คุณสามารถแตะที่เปลวไฟเพื่อเป่าเค้กแทนได้เลยค่ะ!");
    }
  }
}

function detectBlowAudio() {
  if (!isMicActive) return;
  const buffer = new Uint8Array(micAnalyser.frequencyBinCount);
  micAnalyser.getByteFrequencyData(buffer);

  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i];
  }
  const average = sum / buffer.length;

  if (average > 48 && isSetupComplete && !isBlownOut) {
    blowOutCandles();
  } else {
    requestAnimationFrame(detectBlowAudio);
  }
}

// ========================================================
// 9. PASTEL HEART QR CODE MODAL
// ========================================================
const qrToggleBtn = document.getElementById('qrToggleBtn');
const qrModal = document.getElementById('qrModal');
const closeQrModalBtn = document.getElementById('closeQrModalBtn');
const qrCanvas = document.getElementById('qrCanvas');
const shareUrlInput = document.getElementById('shareUrlInput');
const copyUrlBtn = document.getElementById('copyUrlBtn');
const qrCopiedHint = document.getElementById('qrCopiedHint');

function drawPastelHeartQRCode() {
  if (!qrCanvas) return;
  const ctx = qrCanvas.getContext('2d');
  const w = qrCanvas.width;
  const h = qrCanvas.height;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  const gridSize = 25;
  const cellSize = (w - 20) / gridSize;

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const isCorner = 
        (r < 7 && c < 7) || 
        (r < 7 && c >= gridSize - 7) || 
        (r >= gridSize - 7 && c < 7);

      if (isCorner) {
        const inOuter = (r === 0 || r === 6 || c === 0 || c === 6 || 
                         r === 0 || r === 6 || c === gridSize - 7 || c === gridSize - 1 ||
                         r === gridSize - 7 || r === gridSize - 1 || c === 0 || c === 6);
        const inInner = (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
                        (r >= 2 && r <= 4 && c >= gridSize - 5 && c <= gridSize - 3) ||
                        (r >= gridSize - 5 && r >= gridSize - 3 && c >= 2 && c <= 4);

        ctx.fillStyle = '#ff5c8a';
        if (inOuter || inInner) {
          ctx.fillRect(10 + c * cellSize, 10 + r * cellSize, cellSize, cellSize);
        }
      } else {
        const dx = (c - gridSize / 2) / (gridSize / 2);
        const dy = (r - gridSize / 2) / (gridSize / 2);
        const inHeart = Math.pow(dx * dx + dy * dy - 0.7, 3) - dx * dx * Math.pow(dy, 3) < 0.1;

        if (inHeart && Math.random() > 0.35) {
          ctx.fillStyle = Math.random() > 0.5 ? '#fed3e6' : '#ff5c8a';
          ctx.fillRect(10 + c * cellSize, 10 + r * cellSize, cellSize - 0.5, cellSize - 0.5);
        } else if (Math.random() > 0.62) {
          ctx.fillStyle = '#fca5cc';
          ctx.fillRect(10 + c * cellSize, 10 + r * cellSize, cellSize - 0.5, cellSize - 0.5);
        }
      }
    }
  }

  const cx = w / 2;
  const cy = h / 2;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, 26, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#fed3e6';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.font = '22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💙💖', cx, cy + 1);
  ctx.restore();
}

if (qrToggleBtn) {
  qrToggleBtn.addEventListener('click', () => {
    shareUrlInput.value = window.location.href;
    drawPastelHeartQRCode();
    qrModal.classList.remove('hidden');
  });
}

if (closeQrModalBtn) {
  closeQrModalBtn.addEventListener('click', () => qrModal.classList.add('hidden'));
}

if (qrModal) {
  qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal) qrModal.classList.add('hidden');
  });
}

if (copyUrlBtn) {
  copyUrlBtn.addEventListener('click', () => {
    shareUrlInput.select();
    navigator.clipboard.writeText(shareUrlInput.value).then(() => {
      qrCopiedHint.classList.remove('hidden');
      setTimeout(() => qrCopiedHint.classList.add('hidden'), 2500);
    });
  });
}

// ========================================================
// 10. CONFETTI ANIMATIONS
// ========================================================
function celebrateConfettiWave() {
  if (typeof confetti !== 'function') return;
  confetti({
    particleCount: 50,
    spread: 70,
    origin: { y: 0.6 },
    colors: PASTEL_PALETTE
  });
}

function celebrateFullFirework() {
  if (typeof confetti !== 'function') return;
  const duration = 3.5 * 1000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: PASTEL_PALETTE
    });
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: PASTEL_PALETTE
    });

    if (Date.now() < end) requestAnimationFrame(frame);
  }());
}

// ========================================================
// 11. CUSTOM 4 PHOTOS MODAL CONTROLLER
// ========================================================
const customPhotosBtn = document.getElementById('customPhotosBtn');
const photosModal = document.getElementById('photosModal');
const closePhotosModalBtn = document.getElementById('closePhotosModalBtn');
const savePhotosBtn = document.getElementById('savePhotosBtn');
const resetPhotosBtn = document.getElementById('resetPhotosBtn');
const photosSavedHint = document.getElementById('photosSavedHint');

let stagedPhotos = [...GALLERY_PHOTOS];

function updateSlotPreviews() {
  for (let i = 0; i < 4; i++) {
    const preview = document.getElementById(`slotPreview${i}`);
    if (preview && stagedPhotos[i]) {
      preview.style.backgroundImage = `url("${stagedPhotos[i]}")`;
    }
  }
}

for (let i = 0; i < 4; i++) {
  const input = document.getElementById(`slotInput${i}`);
  if (input) {
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          stagedPhotos[i] = ev.target.result;
          updateSlotPreviews();
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

if (customPhotosBtn) {
  customPhotosBtn.addEventListener('click', () => {
    stagedPhotos = [...GALLERY_PHOTOS];
    updateSlotPreviews();
    photosModal.classList.remove('hidden');
  });
}

if (closePhotosModalBtn) {
  closePhotosModalBtn.addEventListener('click', () => photosModal.classList.add('hidden'));
}

if (photosModal) {
  photosModal.addEventListener('click', (e) => {
    if (e.target === photosModal) photosModal.classList.add('hidden');
  });
}

if (savePhotosBtn) {
  savePhotosBtn.addEventListener('click', () => {
    GALLERY_PHOTOS = [...stagedPhotos];
    try {
      localStorage.setItem('nongjingjing_photos', JSON.stringify(GALLERY_PHOTOS));
    } catch (e) {}

    if (photosSavedHint) {
      photosSavedHint.classList.remove('hidden');
      setTimeout(() => photosSavedHint.classList.add('hidden'), 2000);
    }

    updatePolaroidPhotos(GALLERY_PHOTOS);

    if (is3DActive) {
      createPhotoTilesAndAnimate();
    }

    setTimeout(() => {
      photosModal.classList.add('hidden');
    }, 700);
  });
}

if (resetPhotosBtn) {
  resetPhotosBtn.addEventListener('click', () => {
    localStorage.removeItem('nongjingjing_photos');
    GALLERY_PHOTOS = [...DEFAULT_PHOTOS];
    stagedPhotos = [...DEFAULT_PHOTOS];
    updateSlotPreviews();
    updatePolaroidPhotos(GALLERY_PHOTOS);

    if (photosSavedHint) {
      photosSavedHint.textContent = "✓ รีเซ็ตเป็นรูปภาพเริ่มต้นแล้ว";
      photosSavedHint.classList.remove('hidden');
      setTimeout(() => {
        photosSavedHint.textContent = "✓ บันทึกรูปภาพเรียบร้อยแล้ว!";
        photosSavedHint.classList.add('hidden');
      }, 2000);
    }

    if (is3DActive) {
      createPhotoTilesAndAnimate();
    }

    setTimeout(() => {
      photosModal.classList.add('hidden');
    }, 700);
  });
}

// ========================================================
// 10. SURPRISE CARDS SECTION INTERACTION & FLOATING HEARTS
// ========================================================
function updatePolaroidPhotos(photos) {
  if (!photos || !photos.length) return;
  const p0 = document.getElementById('polaroidImg0'); if (p0 && photos[0]) p0.src = photos[0];
  const p1 = document.getElementById('polaroidImg1'); if (p1 && photos[1]) p1.src = photos[1];
  const p2 = document.getElementById('polaroidImg2'); if (p2 && photos[2]) p2.src = photos[2];
  const p3 = document.getElementById('polaroidImg3'); if (p3 && photos[3]) p3.src = photos[3];
}

function updateMusicCardState(playing) {
  const musicCardPlayIcon = document.getElementById('musicCardPlayIcon');
  const musicCardPlayText = document.getElementById('musicCardPlayText');
  const vinylDisc = document.getElementById('vinylDisc');
  const soundBars = document.querySelectorAll('.sound-bar');

  if (musicCardPlayIcon) musicCardPlayIcon.textContent = playing ? '⏸' : '▶';
  if (musicCardPlayText) musicCardPlayText.textContent = playing ? 'พักเพลงวันเกิด' : 'เล่นเพลงวันเกิด';
  if (vinylDisc) {
    if (playing) vinylDisc.classList.add('is-spinning');
    else vinylDisc.classList.remove('is-spinning');
  }
  soundBars.forEach(b => {
    if (playing) b.classList.add('active');
    else b.classList.remove('active');
  });
}

function spawnFloatingHeart(startX, startY) {
  const heartIcons = ['💖', '💕', '💗', '🌸', '✨', '🎀', '💓', '🧁'];
  const el = document.createElement('div');
  el.className = 'flying-floating-heart';
  el.textContent = heartIcons[Math.floor(Math.random() * heartIcons.length)];
  el.style.left = `${startX || (window.innerWidth / 2)}px`;
  el.style.top = `${startY || (window.innerHeight / 2)}px`;

  const dx = (Math.random() - 0.5) * 160;
  const rot = (Math.random() - 0.5) * 60;
  el.style.setProperty('--dx', `${dx}px`);
  el.style.setProperty('--rot', `${rot}deg`);

  document.body.appendChild(el);
  setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 1600);
}

function spawnFloatingHeartsBatch(count = 10) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const x = window.innerWidth * (0.2 + Math.random() * 0.6);
      const y = window.innerHeight * (0.4 + Math.random() * 0.3);
      spawnFloatingHeart(x, y);
    }, i * 80);
  }
}

function initSurpriseCardsSection() {
  updatePolaroidPhotos(GALLERY_PHOTOS);
  updateMusicCardState(isBgmPlaying);

  // Scroll down to cards button
  const scrollDownBtn = document.getElementById('scrollDownBtn');
  const surpriseCardsSec = document.getElementById('surpriseCardsSection');
  const threeHero = document.getElementById('threeViewportHero');

  if (scrollDownBtn && surpriseCardsSec) {
    scrollDownBtn.addEventListener('click', (e) => {
      e.preventDefault();
      surpriseCardsSec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Back to 3D room button
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn && threeHero) {
    backToTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      threeHero.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Card 1: Interactive Love Letter Envelope (เปิด/ปิดซองจดหมาย)
  const envelopeCard = document.getElementById('envelopeCard');
  const envelopeOuter = document.getElementById('envelopeOuter');
  const waxSealBtn = document.getElementById('waxSealBtn');
  const letterRecloseBtn = document.getElementById('letterRecloseBtn');

  function openEnvelope() {
    if (!envelopeCard || envelopeCard.classList.contains('is-open')) return;
    ensureAudio();
    playPlantSound(6);
    celebrateConfettiWave();
    spawnFloatingHeartsBatch(16);

    envelopeCard.classList.remove('is-closed');
    envelopeCard.classList.add('is-open');

    setTimeout(() => {
      envelopeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 180);
  }

  function closeEnvelope() {
    if (!envelopeCard) return;
    ensureAudio();
    playPlantSound(3);
    envelopeCard.classList.remove('is-open');
    envelopeCard.classList.add('is-closed');
  }

  if (envelopeOuter) {
    envelopeOuter.addEventListener('click', openEnvelope);
  }
  if (waxSealBtn) {
    waxSealBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEnvelope();
    });
  }
  if (letterRecloseBtn) {
    letterRecloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeEnvelope();
    });
  }

  // Card 1: Letter stamp button
  const letterStampBtn = document.getElementById('letterStampBtn');
  if (letterStampBtn) {
    letterStampBtn.addEventListener('click', () => {
      ensureAudio();
      playPlantSound(5);
      celebrateConfettiWave();
      spawnFloatingHeartsBatch(12);
      letterStampBtn.innerHTML = '<span>💖</span> ส่งความรักเรียบร้อยแล้วน้า ♡ <span>✨</span>';
      setTimeout(() => {
        letterStampBtn.innerHTML = '<span>💌</span> แตะเพื่อส่งความรัก (Send Love) <span>💖</span>';
      }, 3000);
    });
  }

  // Card 2: Music player card play/pause
  const musicCardPlayBtn = document.getElementById('musicCardPlayBtn');
  if (musicCardPlayBtn) {
    musicCardPlayBtn.addEventListener('click', () => {
      ensureAudio();
      if (isBgmPlaying) stopBGM();
      else startBGM();
    });
  }

  // Card 3: Polaroids click to zoom
  const polaroids = document.querySelectorAll('.polaroid-item');
  polaroids.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('.polaroid-img');
      if (img) openPhotoLightbox(img.src);
    });
  });

  // Footer Replay buttons
  const replayAnimBtnCards = document.getElementById('replayAnimBtnCards');
  if (replayAnimBtnCards) {
    replayAnimBtnCards.addEventListener('click', () => {
      if (threeHero) threeHero.scrollIntoView({ behavior: 'smooth' });
      const mainBtn = document.getElementById('replayAnimBtn');
      if (mainBtn) mainBtn.click();
    });
  }

  const replayBtnCards = document.getElementById('replayBtnCards');
  if (replayBtnCards) {
    replayBtnCards.addEventListener('click', () => {
      const mainBtn = document.getElementById('replayBtn');
      if (mainBtn) mainBtn.click();
    });
  }
}

// ========================================================
// RUNNING BUDDIES ENGINE (อิโมจิคู่หูวิ่งเล่นน่ารักๆ)
// ========================================================
let buddiesAnimId = null;
let isBuddiesRunning = false;

function initRunningBuddies() {
  const playground = document.getElementById('buddiesPlayground');
  const track = document.getElementById('buddiesTrack');
  const b1 = document.getElementById('runnerBuddy1');
  const b2 = document.getElementById('runnerBuddy2');
  const body1 = document.getElementById('buddyBody1');
  const body2 = document.getElementById('buddyBody2');
  const heartPop = document.getElementById('buddyHeartPop');
  const speech1 = document.getElementById('buddySpeech1');
  const speech2 = document.getElementById('buddySpeech2');
  const threeSec = document.getElementById('threeSection');
  const surpriseSec = document.getElementById('surpriseCardsSection');

  if (!playground || !track || !b1 || !b2 || !body1 || !body2) return;

  // Track & bounds
  let trackWidth = track.clientWidth || 340;
  const buddyWidth = 48;
  const minX = 8;
  let maxX = Math.max(minX + 80, trackWidth - buddyWidth - 8);

  function updateBounds() {
    trackWidth = track.clientWidth || window.innerWidth || 360;
    maxX = Math.max(minX + 80, trackWidth - buddyWidth - 8);
  }
  window.addEventListener('resize', updateBounds);
  updateBounds();

  // Positions & physics
  let x1 = 40;
  let x2 = 10;
  let dir = 1; // 1 = moving right, -1 = moving left
  let state = 'RUNNING'; // RUNNING | PAUSED_MEET | PLAYFUL_HOP
  let currentLeader = 1; // 1 = Strawberry leads, 2 = Cherry leads
  let speed1 = 2.4;
  let speed2 = 2.8; // chaser runs slightly faster to catch up
  let lastHopTime = Date.now();
  let isTapped1 = false;
  let isTapped2 = false;

  const cuteQuotes = [
    { b1: "จับเค้าให้ได้สิ! 🍓", b2: "รอเค้าด้วยยย! 🍒" },
    { b1: "วิ่งตามไม่ทันแย้ว~ 💨", b2: "ฮึบๆๆๆ 🏃" },
    { b1: "เหนื่อยยังอ้วน? 💖", b2: "ยังไหว จุ๊บๆ! 🥰" },
    { b1: "รักอ้วนนะะะ! 🐷", b2: "รักเค้าเหมือนกัน! 💕" },
    { b1: "จ๊ะเอ๋! 🍓", b2: "งั่มๆๆๆ 🍒" },
    { b1: "มีความสุขมั้ยอ้วน? 🌸", b2: "สุขที่สุดเลยยย ✨" }
  ];

  function showSpeech(elem, text, duration = 1800) {
    if (!elem) return;
    elem.textContent = text;
    elem.classList.add('show');
    setTimeout(() => {
      elem.classList.remove('show');
    }, duration);
  }

  function popEmote(x, icon = '💖') {
    if (!heartPop) return;
    heartPop.textContent = icon;
    heartPop.style.left = `${Math.max(10, Math.min(maxX, x + 15))}px`;
    heartPop.classList.remove('pop');
    void heartPop.offsetWidth;
    heartPop.classList.add('pop');
    setTimeout(() => {
      heartPop.classList.remove('pop');
    }, 1200);
  }

  // Interactive Tap / Click on Buddy 1 (Strawberry)
  function handleBuddy1Tap(e) {
    if (e && e.type === 'touchstart') e.preventDefault();
    if (isTapped1) return;
    isTapped1 = true;
    b1.classList.add('is-jumping');
    setTimeout(() => {
      b1.classList.remove('is-jumping');
      isTapped1 = false;
    }, 600);

    const msgs = [
      "แงง แตะเค้าทำไม 🙈",
      "รักอ้วนที่สุดในโลก! 💖",
      "ฮึบ! วิ่งต่อแย้ว 🍓💨",
      "สตรอว์เบอร์รี่หวานเจี๊ยบ 🍓",
      "อ้วนน่ารักจังงง 🥰"
    ];
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    showSpeech(speech1, msg, 2200);
    popEmote(x1, '🍓✨');
    speed1 = 4.2;
    setTimeout(() => { speed1 = 2.4; }, 1600);
  }

  b1.addEventListener('click', handleBuddy1Tap);
  b1.addEventListener('touchstart', handleBuddy1Tap, { passive: false });

  // Interactive Tap / Click on Buddy 2 (Cherry)
  function handleBuddy2Tap(e) {
    if (e && e.type === 'touchstart') e.preventDefault();
    if (isTapped2) return;
    isTapped2 = true;
    b2.classList.add('is-jumping');
    setTimeout(() => {
      b2.classList.remove('is-jumping');
      isTapped2 = false;
    }, 600);

    const msgs = [
      "จุ๊บๆๆๆ แก้มอ้วน 🍒",
      "เค้าเหนื่อยแย้วนะ 🥺",
      "น่ารักขนาดนี้รักเค้ามั้ย 🥰",
      "เชอร์รี่ฉ่ำๆ 🍒💖",
      "ขอบคุณที่เกิดมานะ ♡"
    ];
    const msg = msgs[Math.floor(Math.random() * msgs.length)];
    showSpeech(speech2, msg, 2200);
    popEmote(x2, '🍒💖');
    speed2 = 4.5;
    setTimeout(() => { speed2 = 2.8; }, 1600);
  }

  b2.addEventListener('click', handleBuddy2Tap);
  b2.addEventListener('touchstart', handleBuddy2Tap, { passive: false });

  b1.classList.add('is-running');
  b2.classList.add('is-running');

  function animate() {
    if (!isBuddiesRunning) return;

    updateBounds();

    if (state === 'RUNNING') {
      // Movement calculation
      if (currentLeader === 1) {
        // Buddy 1 leads, Buddy 2 chases
        x1 += speed1 * dir;
        if (dir === 1) {
          if (x2 < x1 - 36) x2 += speed2;
          else x2 += speed1 * 0.95;
        } else {
          if (x2 > x1 + 36) x2 -= speed2;
          else x2 -= speed1 * 0.95;
        }
      } else {
        // Buddy 2 leads, Buddy 1 chases
        x2 += speed2 * dir;
        if (dir === 1) {
          if (x1 < x2 - 36) x1 += speed1 * 1.15;
          else x1 += speed2 * 0.95;
        } else {
          if (x1 > x2 + 36) x1 -= speed1 * 1.15;
          else x1 -= speed2 * 0.95;
        }
      }

      // Check wall bounce
      const leadX = (currentLeader === 1) ? x1 : x2;
      if (dir === 1 && leadX >= maxX) {
        dir = -1;
        if (Math.random() > 0.4) currentLeader = currentLeader === 1 ? 2 : 1;
      } else if (dir === -1 && leadX <= minX) {
        dir = 1;
        if (Math.random() > 0.4) currentLeader = currentLeader === 1 ? 2 : 1;
      }

      // Keep inside bounds
      x1 = Math.max(minX, Math.min(maxX, x1));
      x2 = Math.max(minX, Math.min(maxX, x2));

      // Meeting / Tag event when close enough
      const dist = Math.abs(x1 - x2);
      if (dist < 32 && Math.random() < 0.018) {
        state = 'PAUSED_MEET';
        b1.classList.remove('is-running');
        b2.classList.remove('is-running');
        b1.classList.add('is-dancing');
        b2.classList.add('is-dancing');

        const midX = (x1 + x2) / 2;
        popEmote(midX, Math.random() > 0.5 ? '💖' : '🥰');

        const quote = cuteQuotes[Math.floor(Math.random() * cuteQuotes.length)];
        showSpeech(speech1, quote.b1, 1500);
        setTimeout(() => showSpeech(speech2, quote.b2, 1500), 450);

        setTimeout(() => {
          b1.classList.remove('is-dancing');
          b2.classList.remove('is-dancing');
          b1.classList.add('is-running');
          b2.classList.add('is-running');
          // Swap roles and reverse direction
          dir = -dir;
          currentLeader = currentLeader === 1 ? 2 : 1;
          state = 'RUNNING';
        }, 1700);
      }

      // Occasional playful hop
      const now = Date.now();
      if (now - lastHopTime > 4500 && Math.random() < 0.02) {
        lastHopTime = now;
        const jumper = Math.random() > 0.5 ? b1 : b2;
        jumper.classList.add('is-jumping');
        setTimeout(() => jumper.classList.remove('is-jumping'), 600);
      }
    }

    // Facing direction: apply scaleX to buddyBody1 and buddyBody2 so text stays unflipped!
    const scale = dir === 1 ? 1 : -1;
    body1.style.transform = `scaleX(${scale})`;
    body2.style.transform = `scaleX(${scale})`;

    // Position on track
    b1.style.transform = `translate3d(${x1}px, 0, 0)`;
    b2.style.transform = `translate3d(${x2}px, 0, 0)`;

    buddiesAnimId = requestAnimationFrame(animate);
  }

  window.startBuddiesRunning = function() {
    if (isBuddiesRunning) return;
    isBuddiesRunning = true;
    b1.classList.add('is-running');
    b2.classList.add('is-running');
    buddiesAnimId = requestAnimationFrame(animate);
  };

  window.stopBuddiesRunning = function() {
    isBuddiesRunning = false;
    if (buddiesAnimId) {
      cancelAnimationFrame(buddiesAnimId);
      buddiesAnimId = null;
    }
  };

  // Scroll visibility checking
  function checkVisibility() {
    if (!threeSec || !playground) return;
    if (!threeSec.classList.contains('hidden') && threeSec.scrollTop > 80) {
      playground.classList.add('active');
      window.startBuddiesRunning();
    } else if (threeSec.scrollTop <= 40) {
      playground.classList.remove('active');
    }
  }

  if (threeSec) {
    threeSec.addEventListener('scroll', checkVisibility, { passive: true });
  }

  // IntersectionObserver on surprise cards section
  if (surpriseSec && window.IntersectionObserver) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          playground.classList.add('active');
          window.startBuddiesRunning();
        }
      });
    }, { threshold: 0.01 });
    observer.observe(surpriseSec);
  }

  // Immediate check if opened directly to cards or letter
  const urlParams = new URLSearchParams(window.location.search);
  const targetStage = urlParams.get('stage');
  if (targetStage === 'cards' || targetStage === 'letter' || targetStage === 'polaroid' || targetStage === 'photos') {
    playground.classList.add('active');
    window.startBuddiesRunning();
  }
}

// ========================================================
// 8.5 BOTTOM MINI BUTTON INTERACTION
// ========================================================
function initBottomMiniBtn() {
  const bottomMiniBtn = document.getElementById('bottomMiniBtn');
  if (!bottomMiniBtn) return;

  bottomMiniBtn.addEventListener('click', (e) => {
    e.preventDefault();
    ensureAudio();
    playGrandFanfare();
    celebrateConfettiWave();

    // หัวใจลอยขึ้นจากปุ่ม
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const heart = document.createElement('div');
        heart.textContent = ['💖', '💕', '🌸', '✨', '🍓', '🍒'][Math.floor(Math.random() * 6)];
        heart.style.position = 'fixed';
        const rect = bottomMiniBtn.getBoundingClientRect();
        heart.style.left = `${rect.left + rect.width / 2 + (Math.random() * 80 - 40)}px`;
        heart.style.top = `${rect.top + (Math.random() * 20 - 10)}px`;
        heart.style.fontSize = `${Math.random() * 18 + 18}px`;
        heart.style.pointerEvents = 'none';
        heart.style.zIndex = '9999';
        heart.style.transition = 'all 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        heart.style.opacity = '1';
        heart.style.transform = `scale(0.6) translateY(0) rotate(0deg)`;
        document.body.appendChild(heart);

        requestAnimationFrame(() => {
          heart.style.opacity = '0';
          heart.style.transform = `scale(1.4) translateY(-140px) rotate(${Math.random() * 60 - 30}deg)`;
        });

        setTimeout(() => {
          if (heart.parentNode) heart.parentNode.removeChild(heart);
        }, 1500);
      }, i * 60);
    }

    // มีเอฟเฟกต์กระตุกปุ่มน่ารักๆ
    bottomMiniBtn.style.transform = 'scale(0.92)';
    setTimeout(() => {
      bottomMiniBtn.style.transform = '';
    }, 180);

    // เปิด ASCII Hologram Modal (จาก standalone.html)
    setTimeout(() => {
      if (typeof window.openHologramModal === 'function') {
        window.openHologramModal();
      }
    }, 450);
  });

  window.openHologramModal = function() {
    const holoModal = document.getElementById('hologramModal');
    const holoFrame = document.getElementById('hologramFrame');
    if (holoModal && holoFrame) {
      if (!holoFrame.src || holoFrame.src === 'about:blank' || !holoFrame.src.includes('standalone.html')) {
        holoFrame.src = 'standalone.html';
      }
      holoModal.classList.remove('hidden');
      holoModal.classList.add('active');
      holoModal.style.display = 'flex';

      // ให้ iframe ปรับขนาด canvas ให้เต็มกรอบสวยงาม
      setTimeout(() => {
        try {
          if (holoFrame.contentWindow) {
            holoFrame.contentWindow.dispatchEvent(new Event('resize'));
          }
        } catch (e) {}
      }, 150);
    }
  };

  const closeHoloBtn = document.getElementById('closeHologramBtn');
  const holoModal = document.getElementById('hologramModal');
  if (closeHoloBtn && holoModal) {
    closeHoloBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      holoModal.classList.remove('active');
      holoModal.classList.add('hidden');
      holoModal.style.display = 'none';
    });
    holoModal.addEventListener('click', (e) => {
      if (e.target === holoModal) {
        holoModal.classList.remove('active');
        holoModal.classList.add('hidden');
        holoModal.style.display = 'none';
      }
    });
  }

  // ฟังปุ่ม ], ล (BracketRight) เพื่อเริ่ม Hologram ใหม่ได้ตลอดเวลา
  window.addEventListener('keydown', (e) => {
    if (e.key === ']' || e.key === 'ล' || e.code === 'BracketRight') {
      const holoFrame = document.getElementById('hologramFrame');
      if (holoFrame && holoFrame.contentWindow) {
        try {
          if (typeof holoFrame.contentWindow.restartHologram === 'function') {
            holoFrame.contentWindow.restartHologram();
          } else {
            holoFrame.contentWindow.postMessage('restartHologram', '*');
          }
        } catch (err) {
          holoFrame.contentWindow.postMessage('restartHologram', '*');
        }
      }
    }
  });
}

// ========================================================
// INITIALIZATION
// ========================================================
function startApp() {
  initStars();
  initPasscodeStage();
  initSurpriseCardsSection();
  initRunningBuddies();
  initBottomMiniBtn();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('hologram') === '1' || window.location.hash === '#hologram') {
    if (typeof window.openHologramModal === 'function') {
      window.openHologramModal();
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
