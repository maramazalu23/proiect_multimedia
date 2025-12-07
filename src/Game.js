import { Ship } from "./Ship.js";
import { Asteroid } from "./Asteroid.js";
import { Bullet } from "./Bullet.js";
import { Particle } from "./Particle.js";

const HIGHSCORE_KEY = "asteroids_highscores_v1";

// ========== Highscore utils ==========

function loadHighscores() {
  try {
    const raw = localStorage.getItem(HIGHSCORE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    return [];
  }
}

function saveHighscores(scores) {
  localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(scores));
}

function isNewHighscore(score) {
  const scores = loadHighscores();
  if (scores.length < 5) return true;
  return score > scores[scores.length - 1].score;
}

function addHighscore(name, score) {
  const scores = loadHighscores();

  // căutăm dacă există deja cineva cu același nume
  const existingIndex = scores.findIndex((entry) => entry.name === name);

  if (existingIndex !== -1) {
    // jucătorul există deja: păstrăm scorul mai mare dintre vechi și nou
    if (score > scores[existingIndex].score) {
      scores[existingIndex].score = score;
    }
  } else {
    // jucător nou: îl adăugăm
    scores.push({ name, score });
  }

  // sortăm descrescător după scor și păstrăm doar top 5
  scores.sort((a, b) => b.score - a.score);
  const top5 = scores.slice(0, 5);

  saveHighscores(top5);
  return top5;
}

// ========== Clasa Game ==========

export class Game {
  #canvas;
  #context;

  #lastFrameTime = 0;
  #accumulator = 0;
  #fixedTimeStep = 1000 / 60;

  #ship;
  #asteroids = [];
  #bullets = [];
  #particles = [];

  #running = true;
  #isGameOver = false;

  score = 0;
  lives = 3;
  level = 1;
  nextLifeScore = 1000; // viață bonus la 1000, 2000, 3000, ...

  #maxBullets = 3;

  // taste apăsate
  keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    z: false,
    c: false,
  };

  // HUD + overlay
  #hudScore;
  #hudLives;
  #hudLevel;

  #overlay;
  #finalScoreText;
  #highscoreInputSection;
  #playerNameInput;
  #highscoreList;
  #restartBtn;
  #saveScoreBtn;

  #startOverlay;
  #startBtn;
  #isStarted = false;

  constructor() {
    this.#canvas = document.getElementById("gameCanvas");
    this.#context = this.#canvas.getContext("2d");

    this.#setupDOM();
    this.#setupEvents();

    this.resize();

    // NU mai pornim jocul direct, doar loop-ul de randare
    this.#lastFrameTime = performance.now();
    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  // ---------- setup DOM + events ----------

    #setupDOM() {
      // HUD
      this.#hudScore = document.getElementById("hud-score");
      this.#hudLives = document.getElementById("hud-lives");
      this.#hudLevel = document.getElementById("hud-level");

      // Game Over overlay
      this.#overlay = document.getElementById("game-over-overlay");
      this.#finalScoreText = document.getElementById("final-score-text");
      this.#highscoreInputSection = document.getElementById(
        "highscore-input-section"
      );
      this.#playerNameInput = document.getElementById("player-name-input");
      this.#highscoreList = document.getElementById("highscore-list");
      this.#restartBtn = document.getElementById("restart-btn");
      this.#saveScoreBtn = document.getElementById("save-score-btn");

      // Start overlay
      this.#startOverlay = document.getElementById("start-overlay");
      this.#startBtn = document.getElementById("start-btn");

      this.updateHUD();
      this.updateHighscoreList();
  }

  #setupEvents() {
    window.addEventListener("resize", () => this.resize());

    document.addEventListener("keydown", (e) => this.handleKey(e, true));
    document.addEventListener("keyup", (e) => this.handleKey(e, false));

    // touch
    this.#canvas.addEventListener(
      "touchstart",
      (e) => this.handleTouchStart(e),
      { passive: false }
    );
    this.#canvas.addEventListener(
      "touchend",
      (e) => this.handleTouchEnd(e),
      { passive: false }
    );

    if (this.#restartBtn) {
      this.#restartBtn.addEventListener("click", () => this.restartGame());
    }
    if (this.#saveScoreBtn) {
      this.#saveScoreBtn.addEventListener("click", () => this.onSaveScore());
    }
    if (this.#startBtn) {
      this.#startBtn.addEventListener("click", () => this.startGame());
    }

  }

  resize() {
    this.#canvas.width = window.innerWidth;
    this.#canvas.height = window.innerHeight;
  }

  // ---------- inițializare / restart ----------

  initGame() {
    this.#ship = new Ship(this.#canvas.width / 2, this.#canvas.height / 2);
    this.#asteroids = [];
    this.#bullets = [];
    this.#particles = [];

    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.nextLifeScore = 1000;
    this.#running = true;
    this.#isGameOver = false;

    this.spawnAsteroids(5);
    this.updateHUD();
  }

  startGame() {
    // ascundem overlay-ul de start
    if (this.#startOverlay) {
      this.#startOverlay.classList.add("hidden");
    }

    // marcăm că jocul a început
    this.#isStarted = true;

    // inițializăm starea jocului
    this.initGame();

    // resetăm timpul pentru loop
    this.#lastFrameTime = performance.now();
  }

  spawnAsteroids(count) {
    for (let i = 0; i < count; i++) {
      let x, y;
      if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? 0 : this.#canvas.width;
        y = Math.random() * this.#canvas.height;
      } else {
        x = Math.random() * this.#canvas.width;
        y = Math.random() < 0.5 ? 0 : this.#canvas.height;
      }
      this.#asteroids.push(new Asteroid(x, y));
    }
  }

  // ---------- input ----------

  handleKey(e, isKeyDown) {
    const key = e.key;

    if (this.keys.hasOwnProperty(key)) {
      this.keys[key] = isKeyDown;
    }

    // foc cu X
    if (isKeyDown && (key === "x" || key === "X") && !e.repeat) {
      this.fireBullet();
    }
  }

  handleTouchStart(e) {
    e.preventDefault();
    if (!e.touches.length) return;

    const touch = e.touches[0];
    const rect = this.#canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const w = this.#canvas.width;
    const h = this.#canvas.height;

    this.keys.ArrowUp = false;
    this.keys.ArrowDown = false;
    this.keys.ArrowLeft = false;
    this.keys.ArrowRight = false;

    if (y < h / 3) this.keys.ArrowUp = true;
    if (y > (2 * h) / 3) this.keys.ArrowDown = true;
    if (x < w / 3) this.keys.ArrowLeft = true;
    if (x > (2 * w) / 3) this.keys.ArrowRight = true;

    // zona centrală = foc
    if (
      x >= w / 3 &&
      x <= (2 * w) / 3 &&
      y >= h / 3 &&
      y <= (2 * h) / 3
    ) {
      this.fireBullet();
    }
  }

  handleTouchEnd(e) {
    e.preventDefault();
    this.keys.ArrowUp = false;
    this.keys.ArrowDown = false;
    this.keys.ArrowLeft = false;
    this.keys.ArrowRight = false;
  }

  fireBullet() {
    const activeBullets = this.#bullets.filter((b) => b.active).length;
    if (activeBullets >= this.#maxBullets) return;

    const bullet = new Bullet(this.#ship.x, this.#ship.y, this.#ship.angle);
    this.#bullets.push(bullet);
  }

  // ---------- HUD + highscore ----------

  updateHUD() {
    if (this.#hudScore) {
      this.#hudScore.textContent = `Scor: ${this.score}`;
    }

    if (this.#hudLives) {
        let hearts = "";
        for (let i = 0; i < this.lives; i++) {
            hearts += "❤";
        }
        this.#hudLives.textContent = `Vieți: ${hearts}`;

        // dacă e ultima viață, adăugăm clasa de avertizare
        if (this.lives === 1) {
            this.#hudLives.classList.add("warning");
        } else {
            this.#hudLives.classList.remove("warning");
        }
    }

    if (this.#hudLevel) {
      this.#hudLevel.textContent = `Nivel: ${this.level}`;
    }
  }

  updateHighscoreList() {
    if (!this.#highscoreList) return;
    const scores = loadHighscores();
    this.#highscoreList.innerHTML = "";
    scores.forEach((entry) => {
      const li = document.createElement("li");
      li.textContent = `${entry.name} – ${entry.score}`;
      this.#highscoreList.appendChild(li);
    });
  }

  // ---------- logică joc ----------

  updateGameState(dt) {
    const thrust = 300; // accelerația când ții apăsat SUS / JOS

    // implicit: nu accelerează
    this.#ship.isThrusting = false;

    // 1) rotație (ca înainte)
    if (this.keys.ArrowLeft) {
      this.#ship.rotateLeft(dt);
    }
    if (this.keys.ArrowRight) {
      this.#ship.rotateRight(dt);
    }

    // 2) thrust + inerție
    if (this.keys.ArrowUp) {
      this.#ship.vx += Math.cos(this.#ship.angle) * thrust * dt;
      this.#ship.vy += Math.sin(this.#ship.angle) * thrust * dt;

      this.#ship.isThrusting = true; // 🔥 arată flacăra
    }

    // opțional: thrust invers cu săgeata jos
    if (this.keys.ArrowDown) {
      this.#ship.vx -= Math.cos(this.#ship.angle) * thrust * dt * 0.5;
      this.#ship.vy -= Math.sin(this.#ship.angle) * thrust * dt * 0.5;
    }

    // 3) aplicăm inerția + fricțiunea (nava se deplasează din vx / vy)
    this.#ship.update(dt, this.#canvas.width, this.#canvas.height);

    // rachete
    this.#bullets.forEach((b) => {
      b.x += b.dx * dt;
      b.y += b.dy * dt;
      if (
        b.x < 0 ||
        b.x > this.#canvas.width ||
        b.y < 0 ||
        b.y > this.#canvas.height
      ) {
        b.active = false;
      }
    });
    this.#bullets = this.#bullets.filter((b) => b.active);

    // asteroizi + wrap
    this.#asteroids.forEach((a) => {
      a.x += a.dx * dt;
      a.y += a.dy * dt;
      if (a.x < -a.radius) a.x = this.#canvas.width + a.radius;
      if (a.x > this.#canvas.width + a.radius) a.x = -a.radius;
      if (a.y < -a.radius) a.y = this.#canvas.height + a.radius;
      if (a.y > this.#canvas.height + a.radius) a.y = -a.radius;
    });

    // coliziune între asteroizi – schimb vitezele între ei
    for (let i = 0; i < this.#asteroids.length; i++) {
      for (let j = i + 1; j < this.#asteroids.length; j++) {
        const a1 = this.#asteroids[i];
        const a2 = this.#asteroids[j];
        const dx = a2.x - a1.x;
        const dy = a2.y - a1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < a1.radius + a2.radius) {
          const tmpDx = a1.dx;
          const tmpDy = a1.dy;
          a1.dx = a2.dx;
          a1.dy = a2.dy;
          a2.dx = tmpDx;
          a2.dy = tmpDy;
        }
      }
    }

    // particule
    this.#particles.forEach((p) => p.update(dt));
    this.#particles = this.#particles.filter((p) => p.life > 0);

    // coliziuni
    this.checkCollisions();

    this.updateHUD();
  }

  createShipExplosion(x, y) {
    const particleCount = 35; // modifică 35 → 50 pentru super-explozie

    for (let i = 0; i < particleCount; i++) {
    // culoarea poate fi albă sau roșu-gălbuie ca o explozie
    const colors = ["#ffffff", "#ffdd55", "#ffaa33", "#ff4444"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    this.#particles.push(new Particle(x, y, color));
    }
  }

  checkCollisions() {
    // rachetă – asteroid
    for (let i = this.#bullets.length - 1; i >= 0; i--) {
      const b = this.#bullets[i];
      let bulletHit = false;

      for (let j = this.#asteroids.length - 1; j >= 0; j--) {
        const a = this.#asteroids[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < a.radius + b.radius) {
          bulletHit = true;

          a.lives = (a.lives ?? 1) - 1;
          this.#particles.push(new Particle(a.x, a.y, a.color));

          if (a.lives <= 0) {
            this.#asteroids.splice(j, 1);
            this.addScore(100);
          }
          break;
        }
      }

      if (bulletHit) {
        this.#bullets.splice(i, 1);
      }
    }

    // navă – asteroid
    for (const a of this.#asteroids) {
      const dx = this.#ship.x - a.x;
      const dy = this.#ship.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < a.radius + this.#ship.size / 2) {
        this.createShipExplosion(this.#ship.x, this.#ship.y);
        this.loseLife();
        break;
      }
    }

    // dacă nu mai sunt asteroizi -> level nou
    if (this.#asteroids.length === 0) {
      this.level++;
      this.spawnAsteroids(5 + this.level);
    }
  }

  addScore(points) {
    this.score += points;
    if (this.score >= this.nextLifeScore) {
      this.gainLife();
      this.nextLifeScore += 1000;
    }
  }

  loseLife() {
    this.lives--;
    if (this.lives <= 0) {
      this.endGame();
    } else {
      this.resetShipPosition();
      this.updateHUD();
    }
  }

  gainLife() {
    if (this.lives < 5) {
    this.lives++;
    }
    this.updateHUD();
  }

  resetShipPosition() {
    this.#ship.x = this.#canvas.width / 2;
    this.#ship.y = this.#canvas.height / 2;

    // resetăm și viteza când reapare nava
    this.#ship.vx = 0;
    this.#ship.vy = 0;
  }

  // ---------- Game Over + highscore ----------

  endGame() {
    if (this.#isGameOver) return;
    this.#running = false;
    this.#isGameOver = true;
    this.showGameOverOverlay();
  }

  showGameOverOverlay() {
    if (!this.#overlay) return;

    this.#finalScoreText.textContent = `Scor final: ${this.score}`;

    if (isNewHighscore(this.score)) {
      this.#highscoreInputSection.style.display = "block";
    } else {
      this.#highscoreInputSection.style.display = "none";
    }

    this.updateHighscoreList();
    this.#overlay.classList.remove("hidden");
  }

  onSaveScore() {
    const name = (this.#playerNameInput.value || "Anonim").trim();
    addHighscore(name, this.score);
    this.#highscoreInputSection.style.display = "none";
    this.updateHighscoreList();
  }

  restartGame() {
    if (this.#overlay) {
      this.#overlay.classList.add("hidden");
    }
    this.initGame();
    this.#lastFrameTime = performance.now();
    requestAnimationFrame((ts) => this.gameLoop(ts));
  }

  // ---------- desen ----------

  draw() {
    const ctx = this.#context;
    const w = this.#canvas.width;
    const h = this.#canvas.height;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, w, h);

    this.#ship.draw(ctx);
    this.#bullets.forEach((b) => b.draw(ctx));
    this.#asteroids.forEach((a) => a.draw(ctx));
    this.#particles.forEach((p) => p.draw(ctx));
  }

  gameLoop(currentTime) {
    if (!this.#running) return;

    let dt = currentTime - this.#lastFrameTime;
    this.#lastFrameTime = currentTime;

    if (dt > 250) dt = 250;
    this.#accumulator += dt;

    if (this.#isStarted) {
      // jocul a început: rulăm logica normală
      while (this.#accumulator >= this.#fixedTimeStep) {
        this.updateGameState(this.#fixedTimeStep / 1000);
        this.#accumulator -= this.#fixedTimeStep;
      }

      this.draw();
    } else {
      // încă nu am dat Start: doar curățăm ecranul
      const ctx = this.#context;
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, this.#canvas.width, this.#canvas.height);
    }

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}
