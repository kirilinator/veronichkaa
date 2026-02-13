/* ═══════════════════════════════════════════════
   VALENTINE'S DAY — SCRIPT
   Interaktive Magie für die Allerbeste 💗
   ═══════════════════════════════════════════════ */

(function () {
    'use strict';

    // ── DOM Elements ──
    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');
    const loveOverlay = document.getElementById('loveOverlay');
    const heartsBg = document.getElementById('heartsBg');
    const confettiCanvas = document.getElementById('confettiCanvas');
    const ctx = confettiCanvas.getContext('2d');

    // ── State ──
    let noClickCount = 0;
    let confettiParticles = [];
    let confettiActive = false;

    // ── Resize canvas ──
    function resizeCanvas() {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // ═══════════════════════════════════════
    // FLOATING HEARTS BACKGROUND
    // ═══════════════════════════════════════
    const heartEmojis = ['💗', '💕', '💖', '💝', '❤️', '🩷', '🤍', '✨', '💫', '🌸'];

    function createFloatingHeart() {
        const heart = document.createElement('span');
        heart.className = 'floating-heart';
        heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];

        const size = 14 + Math.random() * 22;
        const left = Math.random() * 100;
        const duration = 8 + Math.random() * 10;
        const delay = Math.random() * 2;

        heart.style.cssText = `
            font-size: ${size}px;
            left: ${left}%;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
        `;

        heartsBg.appendChild(heart);

        // Remove after animation ends
        setTimeout(() => {
            if (heart.parentNode) heart.parentNode.removeChild(heart);
        }, (duration + delay) * 1000);
    }

    // Generate hearts periodically
    function startHearts() {
        // Initial batch
        for (let i = 0; i < 8; i++) {
            setTimeout(createFloatingHeart, i * 400);
        }
        // Ongoing
        setInterval(createFloatingHeart, 1800);
    }
    startHearts();

    // ═══════════════════════════════════════
    // "NEIN" BUTTON — DODGE 5x THEN CLICKABLE
    // ═══════════════════════════════════════
    const MAX_DODGES = 5;
    let buttonLocked = false;

    // Fixed sequence: up, down, right, left-up, down-right
    const dodgeMoves = [
        { x: 0, y: -80 },     // 1st: fly up
        { x: 0, y: 80 },      // 2nd: fly down
        { x: 120, y: 0 },     // 3rd: fly right
        { x: -130, y: -60 },  // 4th: fly left-up
        { x: 80, y: 70 },     // 5th: fly down-right
    ];

    const dodgeTexts = [
        'Точно? 🥺',
        'Серьёзно?! 😤',
        'Только не это! 😭',
        'Подумай ещё! 💔',
        'Ну ладно... 😢',
    ];

    // Track cumulative translation
    let totalX = 0;
    let totalY = 0;

    function dodgeButton() {
        if (buttonLocked) return;

        const rawMove = dodgeMoves[noClickCount];
        const move = getScaledMove(rawMove);
        const text = dodgeTexts[noClickCount];
        noClickCount++;

        // Update text
        const textEl = btnNo.querySelector('.btn-text');
        textEl.textContent = text;

        // Accumulate translation
        totalX += move.x;
        totalY += move.y;

        // Apply smooth CSS transform (no position change needed!)
        btnNo.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        btnNo.style.transform = `translate(${totalX}px, ${totalY}px)`;

        // Make Ja button slightly larger
        const scale = 1 + noClickCount * 0.08;
        btnYes.style.transform = `scale(${Math.min(scale, 1.3)})`;

        // After 3rd dodge → show teasing popup for 5 seconds
        if (noClickCount === 3) {
            const popup = document.getElementById('teasePopup');
            if (popup) {
                buttonLocked = true; // Pause dodges during popup
                popup.style.display = 'flex';

                setTimeout(() => {
                    popup.querySelector('.tease-card').style.animation = 'teaseExit 0.5s ease forwards';
                    setTimeout(() => {
                        popup.style.display = 'none';
                        popup.querySelector('.tease-card').style.animation = 'teaseEntry 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)';
                        // Reset countdown bar
                        const bar = document.getElementById('teaseCountdown');
                        if (bar) { bar.style.animation = 'none'; bar.offsetHeight; bar.style.animation = 'teaseCountdown 5s linear forwards'; }
                        buttonLocked = false; // Resume dodges
                    }, 500);
                }, 5000);
            }
        }

        // After all dodges → button stays, becomes clickable
        if (noClickCount >= MAX_DODGES) {
            buttonLocked = true;
            textEl.textContent = 'Нет 😢';
        }
    }

    // Scale dodge moves for small screens
    function getScaledMove(move) {
        const isSmall = window.innerWidth <= 480;
        const scale = isSmall ? 0.5 : 1;
        return { x: move.x * scale, y: move.y * scale };
    }

    // Hover triggers dodge (desktop + mobile)
    btnNo.addEventListener('mouseenter', () => {
        if (!buttonLocked) {
            dodgeButton();
        }
    });

    // Click/Tap: dodge OR navigate if locked
    btnNo.addEventListener('click', (e) => {
        e.preventDefault();
        if (!buttonLocked) {
            dodgeButton();
        } else {
            window.location.href = 'nein.html';
        }
    });

    // ═══════════════════════════════════════
    // "JA" BUTTON — NAVIGATE TO LOVE PAGE
    // ═══════════════════════════════════════
    btnYes.addEventListener('click', () => {
        window.location.href = 'ja.html';
    });

    // ═══════════════════════════════════════
    // CONFETTI SYSTEM
    // ═══════════════════════════════════════
    const confettiColors = [
        '#e91e63', '#f06292', '#f8bbd0', // Pink
        '#ab47bc', '#ce93d8', '#f3e5f5', // Violet
        '#d4a056', '#f5d998',             // Gold
        '#ff6f91', '#ff9671',             // Warm
        '#ffffff',                         // White
    ];

    class ConfettiPiece {
        constructor() {
            this.x = confettiCanvas.width * 0.5 + (Math.random() - 0.5) * confettiCanvas.width * 0.5;
            this.y = confettiCanvas.height * 0.6;
            this.w = 6 + Math.random() * 8;
            this.h = 4 + Math.random() * 5;
            this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            this.vx = (Math.random() - 0.5) * 16;
            this.vy = -8 - Math.random() * 16;
            this.gravity = 0.25 + Math.random() * 0.1;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 12;
            this.opacity = 1;
            this.decay = 0.003 + Math.random() * 0.005;
            this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += this.gravity;
            this.vx *= 0.99;
            this.rotation += this.rotationSpeed;
            this.opacity -= this.decay;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.globalAlpha = Math.max(0, this.opacity);
            ctx.fillStyle = this.color;

            if (this.shape === 'rect') {
                ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.w / 2, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    function fireConfetti() {
        const count = 80;
        for (let i = 0; i < count; i++) {
            confettiParticles.push(new ConfettiPiece());
        }
        if (!confettiActive) {
            confettiActive = true;
            animateConfetti();
        }
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

        for (let i = confettiParticles.length - 1; i >= 0; i--) {
            const p = confettiParticles[i];
            p.update();
            p.draw();
            if (p.opacity <= 0 || p.y > confettiCanvas.height + 50) {
                confettiParticles.splice(i, 1);
            }
        }

        if (confettiParticles.length > 0) {
            requestAnimationFrame(animateConfetti);
        } else {
            confettiActive = false;
            ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        }
    }
})();
