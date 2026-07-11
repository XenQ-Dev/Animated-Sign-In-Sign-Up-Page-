/**
 * AnimatedCharacters — vanilla port of the Vue "animated-characters-login-page"
 * (github.com/a97242689/animated-characters-login-page).
 *
 * Four characters that:
 *   • follow the mouse (eyes / faces / body skew) + blink on their own
 *   • glance at each other while you type your username   -> setTyping(true)
 *   • cover eyes / lean while you type a hidden password   -> setPasswordLength(n)
 *   • look away (and peek) when the password is revealed    -> setShowPassword(true)
 *   • go SAD (frowns, drooping eyes) on a wrong login       -> setLoginFailed(true)
 *   • SMILE + throw confetti on a successful login          -> setLoginSuccess(true)
 *
 * Body transforms go through GSAP (so the host page's slide/tumble compose with
 * the mouse-follow skew); everything inside a character (eyes, pupils, mouths)
 * is plain inline style + CSS transitions.
 *
 * Requires GSAP 3 as global `gsap` (or pass options.gsap).
 */
function createAnimatedCharacters(mountEl, options = {}) {
    const gsap = options.gsap || window.gsap;
    if (!gsap) throw new Error('[AnimatedCharacters] GSAP not found.');

    const el = (styles = {}, cls = '') => {
        const n = document.createElement('div');
        Object.assign(n.style, styles);
        if (cls) n.className = cls;
        return n;
    };

    // ── eyeball (white circle + pupil) : purple & black ─────────────────────
    const makeEyeBall = ({ size, pupilSize, pupilColor }) => {
        const eye = el({ width: size + 'px', height: size + 'px', backgroundColor: 'white' }, 'ac-eyeball');
        eye.dataset.size = size;
        const pupil = el({ width: pupilSize + 'px', height: pupilSize + 'px', backgroundColor: pupilColor }, 'ac-eyeball-pupil');
        eye.appendChild(pupil);
        return eye;
    };
    // ── standalone pupil : orange & yellow ──────────────────────────────────
    const makePupil = ({ size, pupilColor }) => {
        const p = el({ width: size + 'px', height: size + 'px', backgroundColor: pupilColor }, 'ac-pupil');
        p.dataset.size = size;
        return p;
    };

    // ── build the scene ─────────────────────────────────────────────────────
    const container = el({ position: 'relative', width: '550px', height: '400px' }, 'ac-container');

    // Purple (back)
    const purple = el({ position: 'absolute', bottom: '0', left: '70px', width: '180px', height: '400px', backgroundColor: '#6C3FF5', zIndex: '1', transformOrigin: 'bottom center', willChange: 'transform' }, 'ac-char');
    const purpleEyes = el({ position: 'absolute', display: 'flex', gap: '32px', left: '75px', top: '25px', transition: 'left .5s cubic-bezier(0,0,.2,1), top .5s cubic-bezier(0,0,.2,1)' }, 'ac-eyes');
    const pEye1 = makeEyeBall({ size: 18, pupilSize: 7, pupilColor: '#2D2D2D' });
    const pEye2 = makeEyeBall({ size: 18, pupilSize: 7, pupilColor: '#2D2D2D' });
    purpleEyes.append(pEye1, pEye2);
    const purpleMouth = el({ left: '97px', top: '57px' }, 'ac-purple-mouth');
    purple.append(purpleEyes, purpleMouth);

    // Black (mid) — eyes only
    const black = el({ position: 'absolute', bottom: '0', left: '240px', width: '120px', height: '310px', backgroundColor: '#2D2D2D', zIndex: '2', transformOrigin: 'bottom center', willChange: 'transform' }, 'ac-char');
    const blackEyes = el({ position: 'absolute', display: 'flex', gap: '24px', left: '26px', top: '32px', transition: 'left .7s cubic-bezier(.4,0,.2,1), top .7s cubic-bezier(.4,0,.2,1)' }, 'ac-eyes');
    const bEye1 = makeEyeBall({ size: 16, pupilSize: 6, pupilColor: '#2D2D2D' });
    const bEye2 = makeEyeBall({ size: 16, pupilSize: 6, pupilColor: '#2D2D2D' });
    blackEyes.append(bEye1, bEye2);
    black.append(blackEyes);

    // Orange (front-left)
    const orange = el({ position: 'absolute', bottom: '0', left: '0', width: '240px', height: '150px', backgroundColor: '#FF9B6B', borderRadius: '120px 120px 0 0', zIndex: '3', transformOrigin: 'bottom center', willChange: 'transform' }, 'ac-char');
    const orangeEyes = el({ position: 'absolute', display: 'flex', gap: '32px', left: '112px', top: '60px', transition: 'left .2s cubic-bezier(0,0,.2,1), top .2s cubic-bezier(0,0,.2,1)' }, 'ac-eyes');
    const oP1 = makePupil({ size: 12, pupilColor: '#2D2D2D' });
    const oP2 = makePupil({ size: 12, pupilColor: '#2D2D2D' });
    orangeEyes.append(oP1, oP2);
    const orangeMouth = el({ left: '126px', top: '92px' }, 'ac-orange-mouth');
    orange.append(orangeEyes, orangeMouth);

    // Yellow (front-right) — SVG path mouth
    const yellow = el({ position: 'absolute', bottom: '0', left: '310px', width: '140px', height: '230px', backgroundColor: '#E8D754', borderRadius: '70px 70px 0 0', zIndex: '4', transformOrigin: 'bottom center', willChange: 'transform' }, 'ac-char');
    const yellowEyes = el({ position: 'absolute', display: 'flex', gap: '24px', left: '52px', top: '40px', transition: 'left .2s cubic-bezier(0,0,.2,1), top .2s cubic-bezier(0,0,.2,1)' }, 'ac-eyes');
    const yP1 = makePupil({ size: 12, pupilColor: '#2D2D2D' });
    const yP2 = makePupil({ size: 12, pupilColor: '#2D2D2D' });
    yellowEyes.append(yP1, yP2);
    const yellowMouth = el({ left: '40px', top: '88px' }, 'ac-yellow-mouth');
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', '80'); svg.setAttribute('height', '20'); svg.setAttribute('viewBox', '0 0 80 20');
    const yPath = document.createElementNS(svgNS, 'path');
    yPath.setAttribute('stroke', '#2D2D2D'); yPath.setAttribute('stroke-width', '3'); yPath.setAttribute('fill', 'none'); yPath.setAttribute('stroke-linecap', 'round');
    svg.appendChild(yPath);
    yellowMouth.appendChild(svg);
    yellow.append(yellowEyes, yellowMouth);

    container.append(purple, black, orange, yellow);
    mountEl.appendChild(container);

    // ── state ───────────────────────────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const state = { isTyping: false, showPassword: false, passwordLength: 0, loginFailed: false, loginSuccess: false, tumbling: false };
    const blink = { purple: false, black: false, orange: false, yellow: false };
    let looking = false, peeking = false, successLookY = -5;
    let rafId = 0, successRaf = 0;
    let lookingTimer, peekTimer, confettiTimer;
    const blinkTimers = {};

    // GSAP body animators (compose with the host's tumble)
    const q = {
        purpleSkew: gsap.quickTo(purple, 'skewX', { duration: 0.3, ease: 'power2.out' }),
        purpleX: gsap.quickTo(purple, 'x', { duration: 0.3, ease: 'power2.out' }),
        purpleHeight: gsap.quickTo(purple, 'height', { duration: 0.5, ease: 'power2.out' }),
        blackSkew: gsap.quickTo(black, 'skewX', { duration: 0.3, ease: 'power2.out' }),
        blackX: gsap.quickTo(black, 'x', { duration: 0.3, ease: 'power2.out' }),
        orangeSkew: gsap.quickTo(orange, 'skewX', { duration: 0.3, ease: 'power2.out' }),
        yellowSkew: gsap.quickTo(yellow, 'skewX', { duration: 0.3, ease: 'power2.out' }),
    };

    // ── geometry (ported from the Vue calculatePosition) ────────────────────
    const calcPos = (node, rangeX = 15, rangeY = 10, minX = null, maxX = null, minY = null, maxY = null) => {
        const r = node.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 3;
        const rMinX = minX !== null ? minX : -rangeX;
        const rMaxX = maxX !== null ? maxX : rangeX;
        const rMinY = minY !== null ? minY : -rangeY;
        const rMaxY = maxY !== null ? maxY : rangeY;
        const dx = mouse.x - cx, dy = mouse.y - cy;
        const sX = Math.max(Math.abs(rMinX), Math.abs(rMaxX));
        const sY = Math.max(Math.abs(rMinY), Math.abs(rMaxY));
        const faceX = Math.max(rMinX, Math.min(rMaxX, dx / (300 / sX)));
        const faceY = Math.max(rMinY, Math.min(rMaxY, dy / (300 / sY)));
        const bodySkew = Math.max(-6, Math.min(6, -dx / 120));
        return { faceX, faceY, bodySkew };
    };

    const setPos = (node, left, top) => { node.style.left = left + 'px'; node.style.top = top + 'px'; };

    // pupil = the movable dot; refEl = element whose centre is tracked
    const trackPupil = (pupil, refEl, maxDist, force, extraY = 0) => {
        if (force) { pupil.style.transform = `translate(${force.x}px, ${force.y}px)`; return; }
        const r = refEl.getBoundingClientRect();
        const dx = mouse.x - (r.left + r.width / 2);
        const dy = mouse.y - (r.top + r.height / 2);
        const dist = Math.min(Math.hypot(dx, dy), maxDist);
        const a = Math.atan2(dy, dx);
        pupil.style.transform = `translate(${Math.cos(a) * dist}px, ${(Math.sin(a) * dist) + extraY}px)`;
    };

    // eyeball height / sad shape + its pupil
    const applyEyeball = (eye, blinking, isSad, sadRotate, maxDist, force) => {
        const size = Number(eye.dataset.size);
        eye.style.height = (blinking ? 2 : isSad ? size * 0.5 : size) + 'px';
        eye.style.borderRadius = isSad ? `0 0 ${size}px ${size}px` : '50%';
        eye.style.transform = isSad ? `rotate(${sadRotate}deg)` : 'rotate(0deg)';
        const pupil = eye.firstChild;
        if (blinking) { pupil.style.opacity = '0'; return; }
        pupil.style.opacity = '1';
        trackPupil(pupil, eye, maxDist, force, isSad && !force ? -1 : 0);
    };

    const applyPupilStandalone = (pupil, blinking, maxDist, force) => {
        pupil.style.height = (blinking ? 2 : Number(pupil.dataset.size)) + 'px';
        trackPupil(pupil, pupil, maxDist, force);
    };

    const setMouth = (mouth, cls) => {
        mouth.classList.remove('typing', 'sad', 'happy');
        if (cls) mouth.classList.add(cls);
    };

    // ── per-frame loop ──────────────────────────────────────────────────────
    const tick = () => {
        const typing = state.isTyping;
        const hiding = state.passwordLength > 0 && !state.showPassword;
        const showing = state.passwordLength > 0 && state.showPassword;
        const failed = state.loginFailed;
        const success = state.loginSuccess;

        // PURPLE
        const pp = calcPos(purple, 30, 20);
        if (!state.tumbling) {
            if (showing) { q.purpleSkew(0); q.purpleX(0); }
            else if (typing || hiding) { q.purpleSkew(pp.bodySkew - 12); q.purpleX(40); }
            else { q.purpleSkew(pp.bodySkew); q.purpleX(0); }
        }
        q.purpleHeight(typing || hiding ? 440 : 400);
        if (showing) setPos(purpleEyes, 50, 20);
        else if (looking) setPos(purpleEyes, 85, 50);
        else setPos(purpleEyes, 75 + pp.faceX, 25 + pp.faceY);
        if (showing) setPos(purpleMouth, 72, 57);
        else if (looking) setPos(purpleMouth, 106, 82);
        else setPos(purpleMouth, 97 + pp.faceX, 57 + pp.faceY);
        setMouth(purpleMouth, success ? 'happy' : failed ? 'sad' : (typing || hiding) ? 'typing' : '');
        purpleMouth.style.setProperty('--counter-skew', (typing || hiding) ? `skewX(${-(pp.bodySkew - 12)}deg)` : 'skewX(0deg)');
        {
            const force = success ? { x: 0, y: successLookY }
                : showing ? (peeking ? { x: 4, y: 5 } : { x: -4, y: -4 })
                    : looking ? { x: 3, y: 4 } : null;
            applyEyeball(pEye1, blink.purple, false, 0, 5, force);
            applyEyeball(pEye2, blink.purple, false, 0, 5, force);
        }

        // BLACK
        const bp = calcPos(black);
        if (!state.tumbling) {
            if (showing) { q.blackSkew(0); q.blackX(0); }
            else if (looking) { q.blackSkew(bp.bodySkew * 1.5 + 10); q.blackX(20); }
            else if (typing || hiding) { q.blackSkew(bp.bodySkew * 1.5); q.blackX(0); }
            else { q.blackSkew(bp.bodySkew); q.blackX(0); }
        }
        if (showing) setPos(blackEyes, 10, 28);
        else if (looking) setPos(blackEyes, 32, 12);
        else setPos(blackEyes, 26 + bp.faceX, 32 + bp.faceY);
        {
            const force = success ? { x: 0, y: successLookY }
                : showing ? { x: -4, y: -4 } : looking ? { x: 0, y: -4 } : null;
            applyEyeball(bEye1, blink.black, failed, -20, 4, force);
            applyEyeball(bEye2, blink.black, failed, 20, 4, force);
        }

        // ORANGE
        const op = calcPos(orange, 0, 0, -46, 20, -18, 20);
        if (!state.tumbling) q.orangeSkew(showing ? 0 : op.bodySkew);
        if (showing) setPos(orangeEyes, 80, 55); else setPos(orangeEyes, 112 + op.faceX, 60 + op.faceY);
        if (showing) setPos(orangeMouth, 94, 87); else setPos(orangeMouth, 126 + op.faceX, 92 + op.faceY);
        setMouth(orangeMouth, success ? 'happy' : failed ? 'sad' : (typing || hiding) ? 'typing' : '');
        {
            const force = success ? { x: 0, y: successLookY } : showing ? { x: -5, y: -4 } : null;
            applyPupilStandalone(oP1, blink.orange, 5, force);
            applyPupilStandalone(oP2, blink.orange, 5, force);
        }

        // YELLOW
        const yp = calcPos(yellow);
        if (!state.tumbling) q.yellowSkew(showing ? 0 : yp.bodySkew);
        if (showing) setPos(yellowEyes, 20, 35); else setPos(yellowEyes, 52 + yp.faceX, 40 + yp.faceY);
        if (showing) setPos(yellowMouth, 10, 88); else setPos(yellowMouth, 40 + yp.faceX, 88 + yp.faceY);
        yPath.classList.remove('wavy', 'happy');
        if (success) yPath.classList.add('happy'); else if (failed) yPath.classList.add('wavy');
        {
            const force = success ? { x: 0, y: successLookY } : showing ? { x: -5, y: -4 } : null;
            applyPupilStandalone(yP1, blink.yellow, 5, force);
            applyPupilStandalone(yP2, blink.yellow, 5, force);
        }

        rafId = requestAnimationFrame(tick);
    };

    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', onMove, { passive: true });
    rafId = requestAnimationFrame(tick);

    // ── blinking ────────────────────────────────────────────────────────────
    const scheduleBlink = (key) => {
        blinkTimers[key] = setTimeout(() => {
            blink[key] = true;
            setTimeout(() => { blink[key] = false; scheduleBlink(key); }, 150);
        }, Math.random() * 4000 + 3000);
    };
    ['purple', 'black', 'orange', 'yellow'].forEach(scheduleBlink);

    // ── success look (slow gaze) + confetti ─────────────────────────────────
    const confettiColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#FF9B6B', '#6BCB77', '#4D96FF'];
    let confettiEl = null;
    const removeConfetti = () => { if (confettiEl) { confettiEl.remove(); confettiEl = null; } };
    const fireConfetti = () => {
        removeConfetti();
        confettiEl = el({}, 'ac-confetti');
        for (let i = 0; i < 160; i++) {
            const piece = el({
                left: Math.random() * 100 + '%',
                top: '-' + (10 + Math.random() * 30) + '%',
                backgroundColor: confettiColors[i % confettiColors.length],
                width: (4 + Math.random() * 6) + 'px',
                height: (8 + Math.random() * 12) + 'px',
                animationDelay: (Math.random() * 2) + 's',
                animationDuration: (4.5 + Math.random() * 2) + 's',
                transform: `rotate(${Math.random() * 360}deg)`,
            }, 'piece');
            confettiEl.appendChild(piece);
        }
        document.body.appendChild(confettiEl);
        confettiTimer = setTimeout(removeConfetti, 8000);
    };

    const animateSuccessLook = () => {
        const start = performance.now();
        const step = (now) => {
            const p = Math.min((now - start) / 5500, 1);
            const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
            successLookY = -5 + 9 * eased;
            if (p < 1) successRaf = requestAnimationFrame(step);
        };
        successRaf = requestAnimationFrame(step);
    };

    // ── discrete state reactions ────────────────────────────────────────────
    const onTyping = () => {
        clearTimeout(lookingTimer);
        if (state.isTyping) { looking = true; lookingTimer = setTimeout(() => { looking = false; }, 800); }
        else looking = false;
    };
    const schedulePeek = () => {
        clearTimeout(peekTimer);
        if (state.passwordLength > 0 && state.showPassword) {
            peekTimer = setTimeout(() => {
                peeking = true;
                setTimeout(() => { peeking = false; schedulePeek(); }, 800);
            }, Math.random() * 3000 + 2000);
        } else peeking = false;
    };

    // startled "flinch" — a quick recoil + a short decaying vibrate, done on
    // rotation/y/scale only (the tick owns skew/x) so nothing fights it.
    const flinch = () => {
        [purple, black, orange, yellow].forEach((el, i) => {
            gsap.killTweensOf(el, 'rotation,y,scaleX,scaleY');
            const dir = i % 2 ? 1 : -1;
            gsap.timeline()
                // small surprised recoil
                .to(el, { y: -3, scaleX: 0.97, scaleY: 1.04, duration: 0.08, ease: 'power2.out' }, 0)
                .to(el, { y: 0, duration: 0.35, ease: 'power2.out' }, 0.08)
                .to(el, { scaleX: 1, scaleY: 1, duration: 0.35, ease: 'elastic.out(1, 0.5)' }, 0.08)
                // slight decaying vibration
                .to(el, { keyframes: { rotation: [dir * 2.5, dir * -2, dir * 1.5, dir * -1, dir * 0.5, 0] }, duration: 0.42, ease: 'none' }, 0);
        });
    };

    // ── public API ──────────────────────────────────────────────────────────
    return {
        el: container,
        setTyping(v) { state.isTyping = !!v; onTyping(); },
        setShowPassword(v) { state.showPassword = !!v; schedulePeek(); },
        setPasswordLength(n) { state.passwordLength = Number(n) || 0; schedulePeek(); },
        setTumbling(v) { state.tumbling = !!v; },
        setLoginFailed(v) { state.loginFailed = !!v; if (v) flinch(); },
        setLoginSuccess(v) {
            state.loginSuccess = !!v;
            cancelAnimationFrame(successRaf);
            successLookY = -5;
            if (v) { animateSuccessLook(); fireConfetti(); } else removeConfetti();
        },
        destroy() {
            window.removeEventListener('mousemove', onMove);
            cancelAnimationFrame(rafId);
            cancelAnimationFrame(successRaf);
            Object.values(blinkTimers).forEach(clearTimeout);
            clearTimeout(lookingTimer); clearTimeout(peekTimer); clearTimeout(confettiTimer);
            removeConfetti();
            gsap.killTweensOf([purple, black, orange, yellow]);
            container.remove();
        },
    };
}

if (typeof module !== 'undefined' && module.exports) module.exports = { createAnimatedCharacters };
if (typeof window !== 'undefined') window.createAnimatedCharacters = createAnimatedCharacters;
