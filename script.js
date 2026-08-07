/* ============================================================
   Happy Birthday, Anavadya — main script
   All screen logic, particles, and interactions live here.
   Nothing in this file needs editing — see config.js instead.
   ============================================================ */
(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const screens = {
    loading: $("#screen-loading"),
    lock: $("#screen-lock"),
    countdown: $("#screen-countdown"),
    box: $("#screen-box"),
    hero: $("#screen-hero"),
  };
  const flow = $("#flow");

  function showScreen(key) {
    Object.values(screens).forEach(s => s.classList.remove("is-active"));
    screens[key].classList.add("is-active");
  }

  /* ============================================================
     AMBIENT PETAL PARTICLES (canvas, lightweight, no deps)
  ============================================================ */
  const petalCanvas = $("#petal-canvas");
  const pctx = petalCanvas.getContext("2d");
  let petals = [];
  let petalRAF;

  function resizeCanvas() {
    petalCanvas.width = window.innerWidth * devicePixelRatio;
    petalCanvas.height = window.innerHeight * devicePixelRatio;
    petalCanvas.style.width = window.innerWidth + "px";
    petalCanvas.style.height = window.innerHeight + "px";
    pctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function makePetal() {
    return {
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * window.innerHeight * 0.4,
      r: 4 + Math.random() * 5,
      speedY: 0.3 + Math.random() * 0.6,
      speedX: (Math.random() - 0.5) * 0.6,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.01 + Math.random() * 0.015,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      color: Math.random() > 0.5 ? "rgba(245,205,214,0.75)" : "rgba(201,150,123,0.55)",
    };
  }

  const PETAL_COUNT = window.innerWidth < 600 ? 14 : 24;
  for (let i = 0; i < PETAL_COUNT; i++) petals.push(makePetal());

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function drawPetals() {
    pctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    petals.forEach(p => {
      p.sway += p.swaySpeed;
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.sway) * 0.4;
      p.rotation += p.rotSpeed;
      if (p.y > window.innerHeight + 20) {
        Object.assign(p, makePetal(), { y: -20 });
      }
      pctx.save();
      pctx.translate(p.x, p.y);
      pctx.rotate(p.rotation);
      pctx.fillStyle = p.color;
      pctx.beginPath();
      pctx.ellipse(0, 0, p.r, p.r * 0.6, 0, 0, Math.PI * 2);
      pctx.fill();
      pctx.restore();
    });
    petalRAF = requestAnimationFrame(drawPetals);
  }
  if (!prefersReducedMotion) drawPetals();

  /* ============================================================
     CONFETTI (for the gift box opening moment)
  ============================================================ */
  const confettiCanvas = $("#confetti-canvas");
  const cctx = confettiCanvas.getContext("2d");
  function resizeConfetti() {
    confettiCanvas.width = window.innerWidth * devicePixelRatio;
    confettiCanvas.height = window.innerHeight * devicePixelRatio;
    confettiCanvas.style.width = window.innerWidth + "px";
    confettiCanvas.style.height = window.innerHeight + "px";
    cctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  window.addEventListener("resize", resizeConfetti);
  resizeConfetti();

  function burstConfetti() {
    const colors = ["#C9967B", "#F5CDD6", "#E7E1F7", "#FFFDF8"];
    const pieces = Array.from({ length: 70 }, () => ({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 10,
      vy: -Math.random() * 9 - 3,
      size: 4 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
    }));
    let frame = 0;
    function tick() {
      frame++;
      cctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      let alive = false;
      pieces.forEach(p => {
        p.vy += 0.22;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life++;
        if (p.y < window.innerHeight + 40) alive = true;
        cctx.save();
        cctx.globalAlpha = Math.max(0, 1 - p.life / 130);
        cctx.translate(p.x, p.y);
        cctx.rotate(p.rot);
        cctx.fillStyle = p.color;
        cctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        cctx.restore();
      });
      if (alive && frame < 140) requestAnimationFrame(tick);
      else cctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
    if (!prefersReducedMotion) tick();
  }

  /* ============================================================
     LOADING SCREEN
  ============================================================ */
  const loaderFill = $("#loader-fill");
  gsap.to(loaderFill, { width: "100%", duration: 3.6, ease: "power1.inOut" });
  setTimeout(() => {
    gsap.to(screens.loading, {
      opacity: 0, duration: 0.8, ease: "power2.inOut",
      onComplete: () => { screens.loading.classList.remove("is-active"); showScreen("lock"); }
    });
  }, 3800);

  /* ============================================================
     SCREEN 1 — PASSWORD LOCK
  ============================================================ */
  const lockForm = $("#lock-form");
  const birthdayInput = $("#birthday-input");
  const lockMessage = $("#lock-message");
  const lockIcon = $("#lock-icon");
  const lockCard = $("#screen-lock .glass-card");

  lockForm.addEventListener("submit", e => {
    e.preventDefault();
    const value = birthdayInput.value; // "YYYY-MM-DD"
    if (value === CONFIG.BIRTHDAY_PASSWORD) {
      lockIcon.classList.add("is-open");
      lockMessage.classList.remove("is-visible");
      gsap.to(lockCard, {
        scale: 1.03, opacity: 0, y: -20, duration: 0.7, ease: "power2.inOut",
        onComplete: () => { showScreen("countdown"); startCountdown(); }
      });
    } else {
      lockMessage.classList.add("is-visible");
      lockCard.classList.remove("shake");
      void lockCard.offsetWidth;
      lockCard.classList.add("shake");
    }
  });

  /* ============================================================
     SCREEN 2 — COUNTDOWN
  ============================================================ */
  const countdownNumber = $("#countdown-number");
  const countdownFlash = $(".countdown-flash");

  function startCountdown() {
    const sequence = [3, 2, 1];
    let i = 0;
    countdownNumber.textContent = sequence[0];
    gsap.fromTo(countdownNumber, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" });

    const step = () => {
      i++;
      if (i < sequence.length) {
        gsap.to(countdownNumber, {
          scale: 0.4, opacity: 0, duration: 0.35, ease: "power1.in",
          onComplete: () => {
            countdownNumber.textContent = sequence[i];
            gsap.fromTo(countdownNumber, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" });
          }
        });
        setTimeout(step, 1000);
      } else {
        setTimeout(() => {
          gsap.to(countdownFlash, {
            opacity: 1, duration: 0.5, ease: "power2.in",
            onComplete: () => {
              showScreen("box");
              gsap.to(countdownFlash, { opacity: 0, duration: 0.9, ease: "power2.out" });
            }
          });
        }, 900);
      }
    };
    setTimeout(step, 1000);
  }

  /* ============================================================
     SCREEN 3 — GIFT BOX
  ============================================================ */
  const boxScreen = $("#screen-box");
  const giftLid = $("#gift-lid");
  const lightBurst = $(".gift-light-burst");
  const audioPlayer = $("#audio-player");
  let boxOpened = false;

  boxScreen.addEventListener("click", () => {
    if (boxOpened) return;
    boxOpened = true;

    gsap.to(giftLid, { y: -60, rotation: -25, opacity: 0, duration: 0.9, ease: "power3.in" });
    gsap.to(lightBurst, {
      opacity: 1, duration: 0.5, ease: "power2.out",
      onComplete: () => gsap.to(lightBurst, { opacity: 0, duration: 1.1, delay: 0.2 })
    });
    burstConfetti();

    // Try to begin music quietly on this user gesture (satisfies autoplay policies)
    primeAudio();

    setTimeout(() => {
      showScreen("hero");
      gsap.fromTo("#screen-hero > *", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power2.out" });
    }, 1000);
  });

  /* ============================================================
     SCREEN 4 — HERO → reveal the scrolling flow on scroll cue / scroll
  ============================================================ */
  let flowRevealed = false;
  function revealFlow() {
    if (flowRevealed) return;
    flowRevealed = true;
    screens.hero.classList.remove("is-active");
    screens.hero.style.position = "static";
    screens.hero.style.minHeight = "100vh";
    screens.hero.style.pointerEvents = "auto";
    screens.hero.style.opacity = "1";
    screens.hero.style.visibility = "visible";
    screens.hero.classList.add("is-scroll");
    flow.classList.add("is-active");
    initGallery();
    initTimelineObserver();
    initLetter();
    initMusicPlayer();
    initGiftButton();
  }
  $(".scroll-cue").addEventListener("click", () => {
    revealFlow();
    setTimeout(() => flow.scrollIntoView({ behavior: "smooth" }), 60);
  });
  window.addEventListener("wheel", () => { if (screens.hero.classList.contains("is-active")) revealFlow(); }, { passive: true, once: true });
  window.addEventListener("touchmove", () => { if (screens.hero.classList.contains("is-active")) revealFlow(); }, { passive: true, once: true });

  /* ============================================================
     SCREEN 5 — GALLERY (auto-detects photos named photo1.jpg, photo2.jpg…)
  ============================================================ */
  const galleryGrid = $("#gallery-grid");
  const lightbox = $("#lightbox");
  const lightboxImg = $("#lightbox-img");
  let galleryPhotos = [];
  let slideshowTimer = null;
  let galleryInitDone = false;

  function probeImage(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  async function initGallery() {
    if (galleryInitDone) return;
    galleryInitDone = true;
    const exts = ["jpg", "jpeg", "png", "webp"];
    const checks = [];
    for (let i = 1; i <= CONFIG.PHOTO_MAX_CHECK; i++) {
      exts.forEach(ext => checks.push(probeImage(`${CONFIG.PHOTO_FOLDER}${CONFIG.PHOTO_BASENAME}${i}.${ext}`)));
    }
    const results = await Promise.all(checks);
    galleryPhotos = results.filter(Boolean);

    galleryGrid.innerHTML = "";
    if (galleryPhotos.length === 0) {
      galleryGrid.innerHTML = `<div class="gallery-empty">Add photos to <code>assets/images/</code> named photo1.jpg, photo2.jpg… and they'll appear here automatically.</div>`;
      return;
    }
    galleryPhotos.forEach((src, idx) => {
      const card = document.createElement("div");
      card.className = "gallery-card";
      card.innerHTML = `<img src="${src}" alt="A favourite memory" loading="lazy" />`;
      card.addEventListener("click", () => openLightbox(idx));
      galleryGrid.appendChild(card);
    });
  }

  function openLightbox(idx) {
    lightboxImg.src = galleryPhotos[idx];
    lightbox.classList.add("is-active");
  }
  $("#lightbox-close").addEventListener("click", () => lightbox.classList.remove("is-active"));
  lightbox.addEventListener("click", e => { if (e.target === lightbox) lightbox.classList.remove("is-active"); });

  const slideshowToggle = $("#slideshow-toggle");
  slideshowToggle.addEventListener("click", () => {
    if (slideshowTimer) {
      clearInterval(slideshowTimer);
      slideshowTimer = null;
      slideshowToggle.textContent = "▶ Play Slideshow";
      lightbox.classList.remove("is-active");
      return;
    }
    if (!galleryPhotos.length) return;
    let idx = 0;
    openLightbox(idx);
    slideshowToggle.textContent = "❚❚ Stop Slideshow";
    slideshowTimer = setInterval(() => {
      idx = (idx + 1) % galleryPhotos.length;
      openLightbox(idx);
    }, CONFIG.SLIDESHOW_INTERVAL);
  });

  /* ============================================================
     SCREEN 6 — TIMELINE reveal-on-scroll
  ============================================================ */
  function initTimelineObserver() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("is-in"); });
    }, { threshold: 0.25 });
    $$(".reveal").forEach(el => io.observe(el));
  }

  /* ============================================================
     SCREEN 7 — LETTER typewriter
  ============================================================ */
  const letterText = $("#letter-text");
  let letterTyped = false;
  function initLetter() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !letterTyped) {
          letterTyped = true;
          typeLetter(CONFIG.LETTER_TEXT);
        }
      });
    }, { threshold: 0.3 });
    io.observe($("#section-letter"));
  }
  function typeLetter(text) {
    let i = 0;
    letterText.textContent = "";
    const cursor = document.createElement("span");
    cursor.className = "letter-cursor";
    cursor.textContent = "\u00A0";
    const speed = prefersReducedMotion ? 0 : 22;
    function tick() {
      if (i < text.length) {
        letterText.textContent = text.slice(0, i + 1);
        letterText.appendChild(cursor);
        i++;
        setTimeout(tick, speed);
      } else {
        cursor.remove();
      }
    }
    if (speed === 0) { letterText.textContent = text; } else { tick(); }
  }

  /* ============================================================
     SCREEN 8 — MUSIC PLAYER
  ============================================================ */
  let currentTrackIdx = 0;
  const musicPlayBtn = $("#music-play");
  const musicPlayIcon = $("#music-play-icon");
  const musicMuteBtn = $("#music-mute");
  const musicNextBtn = $("#music-next");
  const musicVolume = $("#music-volume");
  const musicArt = $("#music-art");
  const musicStatus = $("#music-status");
  let isPlaying = false;
  let isMuted = false;
  let musicStarted = false;

  function loadTrack(idx, resetPlayback = true) {
    const track = CONFIG.MUSIC_TRACKS[idx];
    if (!track) return;
    const sameTrack = !!audioPlayer.src && audioPlayer.src.includes(track.file);

    if (resetPlayback || !sameTrack) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }

    if (!sameTrack || !audioPlayer.src) {
      audioPlayer.src = track.file;
    }

    audioPlayer.volume = parseFloat(musicVolume.value);
    audioPlayer.muted = isMuted;
    musicStatus.textContent = track.title;
  }

  function primeAudio() {
    if (!CONFIG.MUSIC_TRACKS.length || musicStarted) return;
    musicStarted = true;
    if (!audioPlayer.src) loadTrack(currentTrackIdx, true);
    audioPlayer.volume = parseFloat(musicVolume.value);
    audioPlayer.muted = isMuted;
    audioPlayer.currentTime = 0;
    audioPlayer.load();
    audioPlayer.play().then(() => {
      isPlaying = true;
      updatePlayUI();
    }).catch(() => {
      // Autoplay blocked — will start on the explicit play button instead
    });
  }

  function updatePlayUI() {
    musicArt.classList.toggle("is-playing", isPlaying);
    musicPlayIcon.innerHTML = isPlaying
      ? '<rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/>'
      : '<path d="M8 5v14l11-7z"/>';
  }

  function initMusicPlayer() {
    if (!CONFIG.MUSIC_TRACKS.length) { musicStatus.textContent = "Add a track in config.js"; return; }
    loadTrack(currentTrackIdx, false);
    audioPlayer.volume = parseFloat(musicVolume.value);
    audioPlayer.muted = isMuted;
    if (!isPlaying) {
      updatePlayUI();
    }
  }

  musicPlayBtn.addEventListener("click", () => {
    if (!audioPlayer.src) loadTrack(currentTrackIdx, true);
    if (isPlaying) {
      audioPlayer.pause();
      isPlaying = false;
    } else {
      musicStarted = true;
      audioPlayer.play().catch(() => {});
      isPlaying = true;
    }
    updatePlayUI();
  });

  musicMuteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    audioPlayer.muted = isMuted;
    musicMuteBtn.style.opacity = isMuted ? 0.5 : 1;
  });

  musicNextBtn.addEventListener("click", () => {
    if (CONFIG.MUSIC_TRACKS.length < 2) return;
    currentTrackIdx = (currentTrackIdx + 1) % CONFIG.MUSIC_TRACKS.length;
    const wasPlaying = isPlaying;
    loadTrack(currentTrackIdx, true);
    if (wasPlaying) {
      musicStarted = true;
      audioPlayer.play().catch(() => {});
    }
  });

  musicVolume.addEventListener("input", () => { audioPlayer.volume = parseFloat(musicVolume.value); });

  /* ============================================================
     SCREEN 9 — GIFT BUTTON
  ============================================================ */
  function initGiftButton() {
    $("#gift-download-btn").href = CONFIG.GIFT_URL;
  }

  function updateElapsedCountdown() {
    const startDate = new Date("2025-11-28T00:00:00");
    const now = new Date();
    const diff = now - startDate;

    const totalSeconds = Math.max(0, Math.floor(diff / 1000));
    const months = Math.floor(totalSeconds / (30 * 24 * 60 * 60));
    const remainingAfterMonths = totalSeconds % (30 * 24 * 60 * 60);
    const weeks = Math.floor(remainingAfterMonths / (7 * 24 * 60 * 60));
    const remainingAfterWeeks = remainingAfterMonths % (7 * 24 * 60 * 60);
    const days = Math.floor(remainingAfterWeeks / (24 * 60 * 60));
    const remainingAfterDays = remainingAfterWeeks % (24 * 60 * 60);
    const hours = Math.floor(remainingAfterDays / (60 * 60));
    const remainingAfterHours = remainingAfterDays % (60 * 60);
    const minutes = Math.floor(remainingAfterHours / 60);
    const seconds = remainingAfterHours % 60;

    const units = {
      months,
      weeks,
      days,
      hours,
      minutes,
      seconds,
    };

    document.querySelectorAll("[data-unit]").forEach(el => {
      const key = el.getAttribute("data-unit");
      el.textContent = units[key] ?? 0;
    });
  }

  updateElapsedCountdown();
  setInterval(updateElapsedCountdown, 1000);
})();
