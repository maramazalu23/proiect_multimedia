export class Particle {
  x;
  y;
  dx;
  dy;
  size;
  color;
  life;
  maxLife;

  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = Math.random() * 3 + 1; // Mărime aleatoare 1-4px
    
    // Viteză explozivă aleatoare
    const speed = Math.random() * 100 + 50;
    const angle = Math.random() * Math.PI * 2;
    this.dx = Math.cos(angle) * speed;
    this.dy = Math.sin(angle) * speed;

    this.life = 1.0; // Opacitate de la 1.0 la 0.0
    this.decay = Math.random() * 0.02 + 0.01; // Viteza de dispariție
  }

  update(dt) {
    this.x += this.dx * dt;
    this.y += this.dy * dt;
    this.life -= this.decay; // Scade viața/opacitatea
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.life; // Aplicăm opacitatea
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.restore();
  }
}