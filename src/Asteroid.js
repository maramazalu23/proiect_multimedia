export class Asteroid {
  x;
  y;
  dx;
  dy;
  lives;
  radius;
  color;

  shapePoints = [];

  constructor(x, y) {
    this.x = x;
    this.y = y;

    // Viteză aleatoare pe ambele axe
    this.dx = (Math.random() - 0.5) * 150;
    this.dy = (Math.random() - 0.5) * 150;

    // Vieți între 1 și 4
    this.lives = Math.floor(Math.random() * 4) + 1;

    // Setăm radius + color în funcție de vieți
    this.updateProperties();

    // Generăm forma neregulată O SINGURĂ DATĂ
    this.generateShape();
  }

  // Dimensiune și culoare în funcție de vieți
  updateProperties() {
    // Rază mai mare pentru mai multe vieți
    this.radius = 12 + this.lives * 6;

    // Culoare în funcție de vieți
    const colors = ["#44FF44", "#FFFF44", "#FFAA44", "#FF4444"];
    this.color = colors[this.lives - 1] || "#FFFFFF";
  }

  // Generăm punctele poligonului neregulat
  generateShape() {
    this.shapePoints = [];

    // între 10 și 14 „colțuri”
    const segments = 10 + Math.floor(Math.random() * 5);

    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      // factor între 0.6 și 1.0 pentru colțuri neregulate
      const mult = 0.6 + Math.random() * 0.4;
      this.shapePoints.push({ angle, mult });
    }
  }

  // Scădem vieți; returnăm true dacă asteroidul e distrus
  hit() {
    this.lives--;
    if (this.lives > 0) {
      this.updateProperties(); // devine mai mic / altă culoare
      return false;
    }
    return true;
  }

  // Desenăm forma neregulată + numărul de vieți în centru
  draw(ctx) {
    if (!this.shapePoints.length) {
      this.generateShape();
    }

    ctx.beginPath();

    for (let i = 0; i < this.shapePoints.length; i++) {
      const p = this.shapePoints[i];
      const r = this.radius * p.mult;
      const px = this.x + Math.cos(p.angle) * r;
      const py = this.y + Math.sin(p.angle) * r;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.closePath();

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Umplem interiorul cu o nuanță transparentă
    ctx.fillStyle = this.color + "33"; // adăugăm transparență hex
    ctx.fill();

    // Numărul de vieți în centru
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(this.lives, this.x, this.y);
  }
}
