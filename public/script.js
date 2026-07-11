const wrapper = document.querySelector('.wrapper');
const registerLink = document.querySelector('.register-link');
const loginLink = document.querySelector('.login-link');
const acMount = document.getElementById('ac-mount');

let tumble = () => {};
let chars = null;

// ── Cute animated mascots ───────────────────────────────────────────────
if (window.createAnimatedCharacters && acMount && window.gsap) {
    chars = createAnimatedCharacters(acMount);

    // Where the group sits horizontally (offset from panel centre) for each side.
    // Login  → blue panel is on the right, Sign up → blue panel is on the left.
    const POS = { login: 255, signup: -255 };
    const BASE_SCALE = 0.33;

    gsap.set(acMount, {
        xPercent: -50, yPercent: -50,
        transformOrigin: '50% 50%',
        scale: BASE_SCALE,
        x: POS.login, y: 46, rotation: 0,
    });

    // The whole cluster slides across via the parent (#ac-mount); each character
    // then bounces like a blob of slime — stretching in the air, squashing with a
    // fluid jiggle on every landing, and spitting out a little splash of particles.
    const cont = acMount.querySelector('.ac-container');
    const parts = [cont.children[0], cont.children[1], cont.children[2], cont.children[3]]; // purple, black, orange, yellow
    const partColors = ['#6C3FF5', '#8891a0', '#FF9B6B', '#E8D754'];

    // four distinct "personalities": weight, bounciness, whether it flips on its
    // head, and its OWN keyframed path across the gap (each `path` point is a
    // fraction-of-total-time `f` and an x offset; every path returns to 0 so they
    // all rejoin the exact same resting cluster).
    const SLIME = [
        // purple — heavy & slow; short low hops, small drift forward
        { delay: 0.00, squash: 0.54, particles: 8, flip: 0,    path: [ { f: 0.5, x: 55 } ],                    bounces: [ { peak: 74, up: 0.34, down: 0.30 }, { peak: 34, up: 0.24, down: 0.22 }, { peak: 14, up: 0.17, down: 0.16 } ] },
        // black — light; swings FAR ahead, flips on its head, curves back
        { delay: 0.05, squash: 0.72, particles: 5, flip: 360,  path: [ { f: 0.4, x: 180 } ],                   bounces: [ { peak: 118, up: 0.34, down: 0.30 }, { peak: 55, up: 0.22, down: 0.20 }, { peak: 28, up: 0.16, down: 0.15 }, { peak: 12, up: 0.12, down: 0.11 } ] },
        // orange — jelly; swings WIDE the opposite way, flips the other direction
        { delay: 0.11, squash: 0.48, particles: 9, flip: -360, path: [ { f: 0.55, x: -200 } ],                 bounces: [ { peak: 92, up: 0.32, down: 0.28 }, { peak: 39, up: 0.22, down: 0.20 }, { peak: 18, up: 0.15, down: 0.14 } ] },
        // yellow — floaty; weaves an S, back then forward
        { delay: 0.03, squash: 0.62, particles: 6, flip: 0,    path: [ { f: 0.3, x: -85 }, { f: 0.66, x: 115 } ], bounces: [ { peak: 84, up: 0.33, down: 0.31 }, { peak: 32, up: 0.22, down: 0.20 } ] },
    ];

    const burst = (x, y, color, count) => {
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'ac-particle';
            const size = 3 + Math.random() * 4;
            Object.assign(p.style, { left: x + 'px', top: y + 'px', width: size + 'px', height: size + 'px', background: color });
            document.body.appendChild(p);
            const a = Math.random() * Math.PI * 2;
            const d = 14 + Math.random() * 34;
            gsap.to(p, {
                x: Math.cos(a) * d,
                y: Math.sin(a) * d * 0.55 + 14,       // splash out, then settle downward
                opacity: 0, scale: 0.2,
                duration: 0.45 + Math.random() * 0.3,
                ease: 'power2.out',
                onComplete: () => p.remove(),
            });
        }
    };
    const emitAt = (el, color, count) => {
        const r = el.getBoundingClientRect();
        burst(r.left + r.width / 2, r.bottom - 4, color, count);
    };

    const buildSlime = (el, spec, color) => {
        const sqY = spec.squash;
        const sqX = 1 + (1 - spec.squash) * 1.25;   // conserve volume-ish on impact (wider)
        const tl = gsap.timeline({ delay: spec.delay });
        let t = 0;
        let wobSign = 1;

        // squash + a long, wobbly elastic recovery + a tiny rotational jiggle + splash
        const impact = (landT, wobble = true) => {
            tl.to(el, { scaleX: sqX, scaleY: sqY, duration: 0.06, ease: 'power2.out', overwrite: 'auto' }, landT)
              .to(el, { scaleX: 1, scaleY: 1, duration: 0.75, ease: 'elastic.out(1.15, 0.24)', overwrite: 'auto' }, landT + 0.06);
            if (wobble) {
                const w = 6 * wobSign; wobSign = -wobSign;
                tl.to(el, { rotation: w, duration: 0.06, ease: 'power2.out', overwrite: 'auto' }, landT)
                  .to(el, { rotation: 0, duration: 0.7, ease: 'elastic.out(1, 0.28)', overwrite: 'auto' }, landT + 0.06);
            }
            tl.call(emitAt, [el, color, spec.particles], landT);
        };

        // one ordinary feet-planted bounce: stretch up, fall, squash-jiggle
        const bounce = (b) => {
            const launchT = t, apexT = t + b.up, landT = t + b.up + b.down;
            tl.to(el, { y: -b.peak, duration: b.up, ease: 'power2.out' }, launchT)
              .to(el, { y: 0, duration: b.down, ease: 'power2.in' }, apexT)
              .to(el, { scaleX: 0.80, scaleY: 1.28, duration: b.up * 0.6, ease: 'sine.out', overwrite: 'auto' }, launchT); // juicier stretch
            impact(landT);
            t = landT;
        };

        let startIdx = 0;
        if (spec.flip) {
            // Rotate around the body CENTRE so it somersaults instead of orbiting
            // its feet: at 180° the head dips to the ground (a headstand bounce),
            // at 360° it lands back on its feet.
            const dir = spec.flip > 0 ? 1 : -1;
            tl.set(el, { transformOrigin: '50% 50%' }, 0);

            // phase 1 — jump up, flip head-down, bounce on the head
            const b0 = spec.bounces[0];
            const land0 = b0.up + b0.down;
            tl.to(el, { y: -b0.peak, duration: b0.up, ease: 'power2.out' }, 0)
              .to(el, { y: 0, duration: b0.down, ease: 'power2.in' }, b0.up)
              .to(el, { rotation: dir * 180, duration: land0, ease: 'none' }, 0)
              .to(el, { scaleX: 0.88, scaleY: 1.16, duration: b0.up * 0.6, ease: 'sine.out', overwrite: 'auto' }, 0);
            impact(land0, false);   // splash off the head
            t = land0;

            // phase 2 — push off the head, finish the flip, land on the feet
            const b1 = spec.bounces[1];
            const land1 = land0 + b1.up + b1.down;
            tl.to(el, { y: -b1.peak, duration: b1.up, ease: 'power2.out' }, land0)
              .to(el, { y: 0, duration: b1.down, ease: 'power2.in' }, land0 + b1.up)
              .to(el, { rotation: dir * 360, duration: b1.up + b1.down, ease: 'none' }, land0)
              .to(el, { scaleX: 0.88, scaleY: 1.16, duration: b1.up * 0.6, ease: 'sine.out', overwrite: 'auto' }, land0);
            impact(land1, false);   // splash on the feet

            tl.set(el, { rotation: 0 }, land1);   // normalise 360 → 0 (no visual change)
            t = land1;
            startIdx = 2;
        }

        for (let i = startIdx; i < spec.bounces.length; i++) bounce(spec.bounces[i]);

        // its OWN keyframed path across the gap; every path returns to 0 → rejoin
        if (spec.path) {
            let prevT = 0;
            spec.path.forEach((k) => {
                const kt = t * k.f;
                tl.to(el, { x: k.x, duration: Math.max(0.05, kt - prevT), ease: 'sine.inOut', overwrite: 'auto' }, prevT);
                prevT = kt;
            });
            tl.to(el, { x: 0, duration: Math.max(0.05, t - prevT), ease: 'sine.inOut', overwrite: 'auto' }, prevT);
        }

        // guarantee the exact same resting frame as before every switch
        tl.to(el, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, duration: 0.2, overwrite: 'auto' }, t);
        if (spec.flip) tl.set(el, { transformOrigin: '50% 100%' }, t + 0.2);   // back to feet-planted at rest
        return tl;
    };

    const slimeTls = [null, null, null, null];
    let tumblingTimer;

    tumble = (to) => {
        // slide the cluster across
        gsap.killTweensOf(acMount, 'x');
        gsap.to(acMount, { x: POS[to], duration: 1.25, ease: 'power2.inOut' });

        chars.setTumbling(true);          // let the tumble own the horizontal movement
        let maxEnd = 0;

        // each character bounces & travels on its own
        parts.forEach((el, i) => {
            if (slimeTls[i]) slimeTls[i].kill();
            gsap.set(el, { x: 0, y: 0, rotation: 0, skewX: 0, scaleX: 1, scaleY: 1 });
            slimeTls[i] = buildSlime(el, SLIME[i], partColors[i]);
            maxEnd = Math.max(maxEnd, SLIME[i].delay + slimeTls[i].duration());
        });

        clearTimeout(tumblingTimer);
        tumblingTimer = setTimeout(() => chars.setTumbling(false), (maxEnd + 0.15) * 1000);
    };

    // Username focus → they glance at each other
    document.querySelectorAll('.js-username').forEach((inp) => {
        inp.addEventListener('focus', () => chars.setTyping(true));
        inp.addEventListener('blur', () => chars.setTyping(false));
    });

    // Password length → purple leans in to "hide" it
    document.querySelectorAll('.js-password').forEach((inp) => {
        const update = () => chars.setPasswordLength(inp.value.length);
        inp.addEventListener('input', update);
        inp.addEventListener('focus', update);
    });

    // Show / hide password toggle → they look away (and occasionally peek)
    document.querySelectorAll('.js-toggle-password').forEach((icon) => {
        icon.addEventListener('click', () => {
            const input = icon.closest('.input-box').querySelector('input');
            const reveal = input.type === 'password';
            input.type = reveal ? 'text' : 'password';
            icon.classList.toggle('bxs-lock-alt', !reveal);
            icon.classList.toggle('bxs-lock-open-alt', reveal);
            // keep length in sync so the "look away" reaction always fires
            chars.setPasswordLength(input.value.length);
            chars.setShowPassword(reveal);
        });
    });
}

// ── Light / dark theme toggle ───────────────────────────────────────────
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
    const icon = themeToggle.querySelector('i');
    themeToggle.addEventListener('click', () => {
        const root = document.documentElement;
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        const apply = () => {
            root.setAttribute('data-theme', next);
            icon.className = next === 'dark' ? 'bx bxs-sun' : 'bx bxs-moon';
        };

        // ripple originates from the centre of the toggle button
        const rect = themeToggle.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        // no View Transitions support → apply instantly + simple icon spin
        if (!document.startViewTransition) {
            themeToggle.classList.add('spin');
            setTimeout(() => themeToggle.classList.remove('spin'), 500);
            apply();
            return;
        }

        const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
        const vt = document.startViewTransition(apply);
        vt.ready.then(() => {
            document.documentElement.animate(
                { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
                { duration: 550, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
            );
        });
    });
}

registerLink.addEventListener('click', (e) => {
    e.preventDefault();
    wrapper.classList.add('active');
    tumble('signup');
});

loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    wrapper.classList.remove('active');
    tumble('login');
});

// ── Auth: wire the login & signup forms to the API ──────────────────────
function setMsg(form, text, ok) {
    const el = form.querySelector('.form-msg');
    if (!el) return;
    el.textContent = text || '';
    el.classList.toggle('success', !!ok);
}

async function postJSON(url, data) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    return { ok: res.ok, body };
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = loginForm.querySelector('button');
        setMsg(loginForm, '');
        const email = loginForm.email.value.trim();
        const password = loginForm.password.value;
        if (!email || !password) return setMsg(loginForm, 'Please fill in all fields.');

        btn.disabled = true;
        const { ok, body } = await postJSON('/api/login', { email, password });
        if (ok) {
            setMsg(loginForm, 'Welcome back! Redirecting…', true);
            chars?.setLoginSuccess(true);                       // smile + confetti
            setTimeout(() => { window.location.href = '/dashboard.html'; }, 2000);
        } else {
            setMsg(loginForm, body.error || 'Login failed.');
            chars?.setLoginFailed(true);                        // sad faces
            setTimeout(() => chars?.setLoginFailed(false), 3000);
            btn.disabled = false;
        }
    });
}

const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = signupForm.querySelector('button');
        setMsg(signupForm, '');
        const username = signupForm.username.value.trim();
        const email = signupForm.email.value.trim();
        const password = signupForm.password.value;
        if (!username || !email || !password) return setMsg(signupForm, 'Please fill in all fields.');
        if (password.length < 6) return setMsg(signupForm, 'Password must be at least 6 characters.');

        btn.disabled = true;
        const { ok, body } = await postJSON('/api/signup', { username, email, password });
        if (ok) {
            setMsg(signupForm, 'Account created! Redirecting…', true);
            chars?.setLoginSuccess(true);                       // smile + confetti
            setTimeout(() => { window.location.href = '/dashboard.html'; }, 2000);
        } else {
            setMsg(signupForm, body.error || 'Sign up failed.');
            chars?.setLoginFailed(true);                        // sad faces
            setTimeout(() => chars?.setLoginFailed(false), 3000);
            btn.disabled = false;
        }
    });
}
