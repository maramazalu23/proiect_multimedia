# Asteroids — HTML5 Canvas Game

A browser-based implementation of the classic **Asteroids** game, developed using **HTML5 Canvas, CSS, and vanilla JavaScript**.

The project implements real-time game logic, object-oriented JavaScript modules, keyboard and touch controls, collision detection, scoring, level progression, particle effects, and persistent local high scores.

No external JavaScript libraries or frameworks are used.

---

## Description

The player controls a spaceship and must destroy the asteroids moving across the screen while avoiding collisions with them.

The ship can rotate, accelerate using thrust, move with inertia, and fire projectiles. Asteroids move independently with randomly generated velocities and reappear on the opposite side of the screen when they leave its boundaries.

The game starts with three lives and progresses through multiple levels. The player's score, remaining lives, and current level are displayed in a HUD throughout the game.

When all lives are lost, the final score is displayed and, if eligible, it can be saved in a local Top 5 high-score ranking.

---

## Technologies used

* HTML5
* CSS3
* JavaScript
* JavaScript ES Modules
* HTML5 Canvas API
* Web Storage API (`localStorage`)
* `requestAnimationFrame` for rendering and the game loop

---

## Project structure

```text
proiect_multimedia-main/
│
├── 5_1091_MAZALU_Mara.html
├── 5_1091_MAZALU_Mara.css
├── 5_1091_MAZALU_Mara.js
│
└── src/
    ├── Game.js
    ├── Ship.js
    ├── Asteroid.js
    ├── Bullet.js
    └── Particle.js
```

### Main files

| File                      | Description                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| `5_1091_MAZALU_Mara.html` | Main HTML page containing the game canvas, HUD, start screen, and Game Over screen                   |
| `5_1091_MAZALU_Mara.css`  | Styling for the full-screen game interface, HUD, overlays, buttons, and visual warnings              |
| `5_1091_MAZALU_Mara.js`   | Application entry point that initializes the game                                                    |
| `src/Game.js`             | Main game controller: game loop, input handling, collisions, scoring, levels, lives, and high scores |
| `src/Ship.js`             | Spaceship representation, drawing, rotation, movement, inertia, and thrust effect                    |
| `src/Asteroid.js`         | Asteroid representation, random movement, irregular shape generation, and rendering                  |
| `src/Bullet.js`           | Projectile representation and movement                                                               |
| `src/Particle.js`         | Particle system used for collision and explosion effects                                             |

---

## Game controls

### Keyboard

| Key | Action                |
| --- | --------------------- |
| `←` | Rotate the ship left  |
| `→` | Rotate the ship right |
| `↑` | Forward thrust        |
| `↓` | Reverse thrust        |
| `X` | Fire a projectile     |

The ship moves using acceleration and inertia rather than moving directly by fixed positional steps.

---

## Touch controls

The game also implements touch input for touchscreen devices.

The canvas is divided into control areas:

* upper area — forward thrust;
* lower area — reverse thrust;
* left area — rotate left;
* right area — rotate right;
* central area — fire a projectile.

Touch controls are released when the touch interaction ends.

---

## Game mechanics

### Ship movement

The ship starts in the center of the screen and initially points upward.

Movement is based on velocity vectors:

* thrust increases the horizontal and vertical velocity according to the current rotation angle;
* inertia keeps the ship moving after thrust is released;
* friction gradually reduces its velocity;
* reverse thrust applies acceleration in the opposite direction;
* rotation is available across the full 360-degree range.

The ship is kept within the visible canvas boundaries.

A visual engine flame is rendered while forward thrust is active.

---

### Asteroids

At the beginning of the game, **5 asteroids** are generated.

Each asteroid:

* appears at a random position along one of the edges of the screen;
* receives a random horizontal and vertical velocity;
* has between **1 and 4 lives**;
* has an irregular polygonal shape generated from random points;
* has a radius and color based on its initial number of lives;
* displays its remaining number of lives in its center.

Asteroids wrap around the screen. When an asteroid moves beyond one edge of the canvas, it reappears on the opposite side.

Collisions between asteroids are also detected. When two asteroids collide, their velocity vectors are exchanged.

---

### Projectiles

The ship fires projectiles in the direction in which it is currently pointing.

Projectiles:

* travel at a constant speed;
* are removed after leaving the visible screen;
* damage asteroids when a collision is detected.

A maximum of **3 active projectiles** can exist at the same time.

---

## Collision detection

The game handles several types of collisions:

### Projectile – Asteroid

When a projectile hits an asteroid:

* the projectile is removed;
* the asteroid loses one life;
* a particle effect is generated at the collision position;
* when the asteroid has no remaining lives, it is removed;
* the player receives **100 points** for destroying it.

### Ship – Asteroid

When the ship collides with an asteroid:

* a larger explosion effect is generated using particles;
* the player loses one life;
* if lives remain, the ship is repositioned in the center of the screen and its velocity is reset;
* if no lives remain, the game ends.

---

## Scoring and lives

The player starts with:

* **0 points**
* **3 lives**
* **Level 1**

Each destroyed asteroid awards:

```text
100 points
```

The game also provides bonus lives.

A new life is awarded whenever the score reaches another 1,000-point threshold:

```text
1000
2000
3000
...
```

The maximum number of lives is **5**.

When only one life remains, the HUD displays a visual warning animation.

---

## Level progression

When all asteroids from the current level have been destroyed:

1. the level number increases;
2. a new group of asteroids is generated.

The number of asteroids generated for a new level is calculated as:

```text
5 + current level
```

This gradually increases the number of asteroids as the player progresses through the game.

---

## Particle effects

The project implements a simple particle system for visual effects.

Particles are used for:

* asteroid impacts;
* ship explosions.

Each particle receives:

* a random size;
* a random movement direction;
* a random speed;
* a color;
* a gradually decreasing opacity.

Particles are automatically removed when their lifetime expires.

---

## Game loop

The game uses `requestAnimationFrame` for browser-based rendering.

Game logic is updated using a fixed timestep corresponding to approximately:

```text
60 updates per second
```

An accumulator is used to process fixed game updates independently from rendering timing.

Large frame delays are limited before being added to the accumulator in order to prevent excessive updates after the browser or tab has been temporarily inactive.

---

## HUD

The game displays a real-time HUD containing:

* current score;
* remaining lives;
* current level.

Example:

```text
Score: 500
Lives: ❤❤❤
Level: 2
```

The actual interface labels are displayed in Romanian.

---

## High-score system

High scores are stored directly in the browser using:

```javascript
localStorage
```

The game maintains a **Top 5** ranking.

When the game ends:

* the final score is displayed;
* if the score qualifies for the Top 5, the player can enter a name;
* the ranking is sorted in descending order;
* only the five highest scores are retained.

If the same player name already exists in the ranking, only the higher score is kept.

If no player name is entered, the score is stored under the default name:

```text
Anonim
```

Because the ranking is stored in `localStorage`, it persists between game sessions in the same browser.

---

## Start and Game Over screens

Before the game begins, a start overlay displays:

* the game title;
* the main controls;
* a button for starting the game.

After the player loses all lives, the Game Over screen displays:

* the final score;
* the high-score input when applicable;
* the current Top 5 ranking;
* a button for restarting the game.

---

## Running the project

The project does not require installing external dependencies.

Because JavaScript ES Modules are used, the project can be served through a simple local HTTP server.

### Using Python

From the project directory:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/5_1091_MAZALU_Mara.html
```

in a modern web browser.

The project can also be run using another local web server, such as the Live Server extension in Visual Studio Code.

---

## Browser requirements

A modern browser with support for the following technologies is required:

* HTML5 Canvas
* JavaScript ES Modules
* `requestAnimationFrame`
* `localStorage`

JavaScript must be enabled for the game to run.

---

## Main implemented concepts

The project includes:

* object-oriented JavaScript using ES6 classes;
* modular JavaScript architecture using `import` / `export`;
* real-time rendering with HTML5 Canvas;
* animation using `requestAnimationFrame`;
* fixed-timestep game logic;
* keyboard event handling;
* touch event handling;
* vector-based movement;
* acceleration, inertia, and friction;
* collision detection;
* projectile management;
* dynamic level progression;
* score and life management;
* particle effects;
* DOM manipulation for the HUD and overlays;
* persistent high-score storage using `localStorage`.

---
