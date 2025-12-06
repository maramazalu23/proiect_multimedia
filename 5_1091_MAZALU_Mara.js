import { Game } from "./src/Game.js";

window.addEventListener("load", () => {
  window.game = new Game();
  console.log("Asteroids Game Initialized");
});
