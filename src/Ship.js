export class Ship {
  x;
  y;
  angle;
  size;
  color;

  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = -Math.PI / 2; // Orientată în sus inițial (90 grade)
    this.size = 20;
    this.color = "#FFFFFF"; // Alb, clasic pentru Asteroids
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

    // Opțional: desenăm flacăra dacă nava accelerează (pentru extra impresie),
    // dar momentan o lăsăm simplă conform cerinței.
    
    ctx.restore();
  }

  // Metode pentru controlul rotației
  rotateLeft(dt) {
    // Viteza de rotație: 5 radiani pe secundă
    this.angle -= 5 * dt; 
  }

  rotateRight(dt) {
    this.angle += 5 * dt;
  }
}