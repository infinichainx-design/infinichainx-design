// app.js
document.addEventListener("DOMContentLoaded", () => {
  const balances = {
    IFX: 10000,
    WORLD: 5000,
    USD: 20000,
  };

  const els = {
    IFX: document.querySelector(".balance[data-token='IFX'] .amount"),
    WORLD: document.querySelector(".balance[data-token='WORLD'] .amount"),
    USD: document.querySelector(".balance[data-token='USD'] .amount"),
    reset: document.querySelector("#resetWallet"),
  };

  function renderBalances() {
    for (const key in balances) {
      if (els[key]) els[key].textContent = balances[key].toLocaleString();
    }
  }

  function simulateChange() {
    const keys = Object.keys(balances);
    const token = keys[Math.floor(Math.random() * keys.length)];
    const delta = Math.floor((Math.random() - 0.5) * 200);
    balances[token] = Math.max(0, balances[token] + delta);
    renderBalances();
  }

  els.reset?.addEventListener("click", () => {
    balances.IFX = 10000;
    balances.WORLD = 5000;
    balances.USD = 20000;
    renderBalances();
  });

  renderBalances();
  setInterval(simulateChange, 2500); // cada 2.5s simula un cambio
});

