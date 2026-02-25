// 🍦 Cơn mưa Kem ngọt ngào
function createParticle() {
  const emojis = ["🍦", "🍨", "🍧", "🧁", "🍩", "🍪", "🍓"];
  const container = document.createElement("div");
  container.className = "particle-container";
  
  const inner = document.createElement("span");
  inner.className = "particle-inner";
  inner.innerText = emojis[Math.floor(Math.random() * emojis.length)];
  
  container.style.left = Math.random() * 100 + "vw";
  const duration = 6 + Math.random() * 10;
  container.style.animationDuration = duration + "s";
  
  inner.style.fontSize = 15 + Math.random() * 25 + "px";
  inner.style.opacity = 0.5 + Math.random() * 0.5;
  
  container.appendChild(inner);
  document.body.appendChild(container);
  
  setTimeout(() => container.remove(), duration * 1000);
}

setInterval(createParticle, 300);

// 🧲 Hút chuột
document.addEventListener("mousemove", e => {
  document.documentElement.style.setProperty("--x", e.clientX + "px");
  document.documentElement.style.setProperty("--y", e.clientY + "px");
});
