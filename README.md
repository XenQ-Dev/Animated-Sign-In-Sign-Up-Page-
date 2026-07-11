<div align="center">

# ✨ LOGIN TEMPLATE

### An animated slider **login / signup** experience where four little slime characters watch, react, and celebrate with you.

<br>

<!-- ▶️ SHOWCASE VIDEO -->


https://github.com/user-attachments/assets/a387d222-97e3-4010-b87c-f894a9bdb454



<sub>▶️ If the player doesn't load, <a href="https://github.com/XenQ-Dev/Animated-Sign-In-Sign-Up-Page-/raw/main/assets/showcase.mp4"><b>watch the demo here</b></a>.</sub>

<br>

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

</div>

---

## 🎬 What makes it special

A neon, glass‑morphism auth card with a **sliding panel** — but the star of the show is the crew of four squishy characters living on the panel who genuinely *react* to what you do.

### 🫠 The characters
- **👀 Follow your cursor** — eyes, faces and bodies track the mouse, with idle blinking.
- **🙈 Guard your password** — when you type a hidden password they cover their eyes and lean in; toggle *show password* and they politely **look away** (and sneak the occasional peek).
- **😳 Flinch on a wrong password** — the whole crew pulls a **sad face** and gives a startled little shudder.
- **🥳 Celebrate a successful login** — big smiles, a slow happy gaze, and a burst of **confetti**.

### 🟣 The slime tumble
When you switch between **Login** and **Sign up**, the characters don't just slide — they **bounce like blobs of slime**:
- Each one takes a **completely different path** (arcing ahead, swinging wide, weaving an S) and rejoins the exact same resting cluster.
- Fluid **squash‑&‑stretch** with a wobbly elastic jiggle on every landing.
- A couple of them do a full **head‑over‑heels flip** — bouncing on their head and landing back on their feet.
- Every bounce throws off a little **splash of particles**.

### 🎨 The interface
- **Light / dark mode** with a **circular ripple reveal** that expands from the toggle button + a spinning sun/moon icon (View Transitions API). Dark mode is a deep‑ocean‑blue theme.
- Neon‑cyan glow, animated gradient panel, floating labels, and staggered field entrance animations.
- **Real authentication** behind it — signup, login, hashed passwords, and a JWT session.

---

## 🛠️ Tech stack

| Layer | Tech |
|-------|------|
| **Frontend** | Vanilla HTML / CSS / JavaScript, [GSAP](https://gsap.com/) for motion |
| **Backend** | [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) |
| **Database** | Built‑in `node:sqlite` (no external DB server) |
| **Auth** | `bcryptjs` password hashing · `jsonwebtoken` (httpOnly cookie session) |

---

## 🚀 Getting started

> **Requires Node.js 22.5+** (uses the built‑in `node:sqlite` module).

```bash
# 1. clone
git clone https://github.com/XenQ-Dev/Animated-Sign-In-Sign-Up-Page-.git
cd Animated-Sign-In-Sign-Up-Page-

# 2. install
npm install

# 3. run
npm start
```

Then open **http://localhost:5510**.

### 🔑 Default admin account
An admin user is seeded automatically on first boot:

```
email:    admin@test.com
password: admin123
```

---

## 📁 Project structure

```
Animated-Sign-In-Sign-Up-Page-/
├── server.js               # Express + SQLite auth API
├── public/
│   ├── index.html          # the login / signup card
│   ├── style.css           # theme, layout, animations
│   ├── script.js           # slider, theme ripple, slime tumble, auth wiring
│   ├── animatedCharacters.js  # the four reactive slime characters
│   └── dashboard.html      # post‑login landing page
└── assets/
    └── showcase.mp4        # demo video
```

### 🔌 API

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/signup` | Create an account `{ username, email, password }` |
| `POST` | `/api/login`  | Sign in `{ email, password }` |
| `POST` | `/api/logout` | Clear the session |
| `GET`  | `/api/me`     | Current user (from the JWT cookie) |

---

## 🙏 Acknowledgements

The reactive character animations were adapted into vanilla JS from the lovely open‑source
[animated‑characters‑login‑page](https://github.com/a97242689/animated-characters-login-page) concept,
then extended with the slime‑physics tumble, particles, expressions and confetti.

---

<div align="center">
<sub>Built with 💙 by <b>XenQ‑Dev</b></sub>
</div>
