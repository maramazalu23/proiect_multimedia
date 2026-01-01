export class Bullet {
  x;
  y;
  dx;
  dy;
  radius = 3;
  active = true; // Dacă racheta este activă sau a ieșit din ecran/lovit ceva

  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    
    const speed = 500; // Viteza rachetei (pixeli pe secundă)
    
    // Calculăm vectorul de direcție bazat pe unghiul navei
    this.dx = Math.cos(angle) * speed;
    this.dy = Math.sin(angle) * speed;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFF00";
    ctx.fill();
    ctx.closePath();
  }
}