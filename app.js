// app.js
document.addEventListener("DOMContentLoaded", () => {
  const balances = { IFX: 10000, WORLD: 5000, USD: 20000 };
  const els = {
    IFX: document.querySelector(".balance[data-token='IFX'] .amount"),
    WORLD: document.querySelector(".balance[data-token='WORLD'] .amount"),
    USD: document.querySelector(".balance[data-token='USD'] .amount"),
    reset: document.getElementById("resetWallet"),
    console: document.getElementById("console"),
  };

  const events = ["Swap", "Deposit", "Lending", "Yield", "Reputation +"];

  function renderBalances() {
    for (const key in balances) {
      els[key].textContent = balances[key].toLocaleString();
    }
  }

  function addEventLog(text) {
    const el = document.createElement("div");
    el.className = "panel-line";
    const time = new Date().toLocaleTimeString("es-ES", { hour12: false });
    el.textContent = `[${time}] ${text}`;
    els.console.appendChild(el);
    els.console.scrollTop = els.console.scrollHeight;
  }

  function simulateChange() {
    const keys = Object.keys(balances);
    const token = keys[Math.floor(Math.random() * keys.length)];
    const delta = Math.floor((Math.random() - 0.5) * 200);
    balances[token] = Math.max(0, balances[token] + delta);
    renderBalances();

    const ev = events[Math.floor(Math.random() * events.length)];
    const symbol = delta >= 0 ? "+" : "";
    addEventLog(`${ev}: ${symbol}${delta} ${token}`);
  }

  els.reset.addEventListener("click", () => {
    balances.IFX = 10000;
    balances.WORLD = 5000;
    balances.USD = 20000;
    els.console.innerHTML = "";
    addEventLog("Balances reseteados.");
    renderBalances();
  });

  renderBalances();
  addEventLog("Simulación iniciada...");
  setInterval(simulateChange, 3000);
});
