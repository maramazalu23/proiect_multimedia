export class Ship {
  x;
  y;
  angle;
  size;
  color;
  vx;
  vy;

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = -Math.PI / 2; // Orientată în sus inițial (90 grade)
    this.size = 20;
    this.color = "#FFFFFF"; // Alb, clasic pentru Asteroids

    // viteze inițiale pentru inerție
    this.vx = 0;
    this.vy = 0;

    // nou: marcăm dacă accelerează
    this.isThrusting = false;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Desenăm nava sub formă de triunghi
    ctx.beginPath();
    // Vârful navei
    ctx.moveTo(this.size, 0);
    // Colțul stânga-spate
    ctx.lineTo(-this.size / 2, this.size / 2);
    // Colțul dreapta-spate
    ctx.lineTo(-this.size / 2, -this.size / 2);
    ctx.closePath();

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // ==== FOC DE REACȚIE când accelerează ====
    if (this.isThrusting) {
      const baseX = -this.size / 2; // baza triunghiului, în spate
      const flameLength =
        this.size * (1 + Math.random() * 0.4); // ușor random, „flicker”

      ctx.beginPath();
      ctx.moveTo(baseX, 0);                     // centru spate
      ctx.lineTo(baseX - flameLength, 6);       // jos
      ctx.lineTo(baseX - flameLength, -6);      // sus
      ctx.closePath();

      ctx.fillStyle = "#FFA500"; // portocaliu
      ctx.fill();

      // un mic „nucleu” roșu în mijloc, opțional
      ctx.beginPath();
      ctx.moveTo(baseX, 0);
      ctx.lineTo(baseX - flameLength * 0.6, 4);
      ctx.lineTo(baseX - flameLength * 0.6, -4);
      ctx.closePath();
      ctx.fillStyle = "#FF4500"; // roșu-oranj
      ctx.fill();
    }

    ctx.restore();
  }

  // === rotație 360° ===
  rotateLeft(dt) {
    const ROT_SPEED = 2.2; // radiani / secundă
    this.angle -= ROT_SPEED * dt;
    this.normalizeAngle();
  }

  rotateRight(dt) {
    const ROT_SPEED = 2.2;
    this.angle += ROT_SPEED * dt;
    this.normalizeAngle();
  }

  normalizeAngle() {
    const twoPi = Math.PI * 2;
    this.angle = (this.angle % twoPi + twoPi) % twoPi;
  }

  // update cu inerție + fricțiune
  update(dt, canvasWidth, canvasHeight) {
    // deplasare din viteză
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // fricțiune (inertia scade încet)
    const friction = 0.99;
    this.vx *= friction;
    this.vy *= friction;

    // păstrăm nava în ecran (clamp simplu)
    if (this.x < 0) this.x = 0;
    if (this.x > canvasWidth) this.x = canvasWidth;
    if (this.y < 0) this.y = 0;
    if (this.y > canvasHeight) this.y = canvasHeight;
  }
}
