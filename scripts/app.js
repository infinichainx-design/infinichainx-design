
// Simulación local para InfinichainX (IFX) — Swap, Lending, Reputation
// No se conecta a ninguna blockchain real. Todo es demo en memoria.

(() => {
  // Estado simulado
  const state = {
    wallet: {
      address: '0xSIMULATED...IFX',
      balances: { IFX: 10000, WORLD: 5000, USD: 20000 }
    },
    // Pool simulado (x: IFX, y: WORLD) — cantidades en tokens
    pool: { IFX: 500000, WORLD: 225000 }, // representa liquidez
    prices: { IFX_USD: 0.45, WORLD_USD: 2.25 }, // precios referenciales
    fees: { swap: 0.003 }, // 0.3%
    reputation: { score: 120 }
  };

  // Helpers
  const $ = id => document.getElementById(id);
  const fmt = (n, d=2) => Number(n).toLocaleString(undefined, {minimumFractionDigits:d, maximumFractionDigits:d});

  // Render wallet balances if elements exist
  function renderWallet(){
    if(!$('wallet-address')) return;
    $('wallet-address').textContent = state.wallet.address;
    $('bal-ifx').textContent = fmt(state.wallet.balances.IFX, 2);
    $('bal-world').textContent = fmt(state.wallet.balances.WORLD, 2);
    $('bal-usd').textContent = fmt(state.wallet.balances.USD, 2);
  }

  // AMM (constant product) swap estimate (x -> y)
  function estimateSwap(from, to, amount){
    const poolX = state.pool.IFX;
    const poolY = state.pool.WORLD;
    let reserveIn, reserveOut, priceInUSD, priceOutUSD;
    if(from === 'IFX' && to === 'WORLD'){
      reserveIn = poolX; reserveOut = poolY;
      priceInUSD = state.prices.IFX_USD; priceOutUSD = state.prices.WORLD_USD;
    } else if(from === 'WORLD' && to === 'IFX'){
      reserveIn = poolY; reserveOut = poolX;
      priceInUSD = state.prices.WORLD_USD; priceOutUSD = state.prices.IFX_USD;
    } else {
      return null;
    }

    const amountIn = Number(amount);
    if(!amountIn || amountIn <= 0) return null;

    const fee = state.fees.swap;
    const amountInWithFee = amountIn * (1 - fee);
    const k = reserveIn * reserveOut;
    const newReserveIn = reserveIn + amountInWithFee;
    const newReserveOut = k / newReserveIn;
    const amountOut = reserveOut - newReserveOut;

    const midPrice = (priceInUSD / priceOutUSD);
    const executedPrice = (amountIn / amountOut);
    const priceImpact = Math.max(0, (executedPrice - midPrice) / midPrice) * 100;

    return {
      amountOut,
      feeAmount: amountIn * fee,
      executedPrice,
      midPrice,
      priceImpact
    };
  }

  function updateSwapEstimate(){
    if(!$('from-token')) return;
    const from = $('from-token').value;
    const to = $('to-token').value;
    const amount = Number($('from-amount').value || 0);
    if(from === to){
      ['to-amount','est-price','price-impact','fee'].forEach(id => { if($(id)) $(id).textContent = '—'; });
      return;
    }
    const est = estimateSwap(from, to, amount);
    if(!est){
      ['to-amount','est-price','price-impact','fee'].forEach(id => { if($(id)) $(id).textContent = '—'; });
      return;
    }
    if($('to-amount')) $('to-amount').textContent = Number(est.amountOut).toFixed(6);
    if($('est-price')) $('est-price').textContent = Number(est.executedPrice).toFixed(6) + ` ${to}/${from}`;
    if($('price-impact')) $('price-impact').textContent = Number(est.priceImpact).toFixed(3) + '%';
    if($('fee')) $('fee').textContent = Number(est.feeAmount).toFixed(6) + ' ' + from;
  }

  function executeSwap(){
    if(!$('from-token')) return;
    const from = $('from-token').value;
    const to = $('to-token').value;
    const amount = Number($('from-amount').value || 0);
    if(from === to || amount <= 0){
      logSwap('Entrada inválida.');
      return;
    }
    const est = estimateSwap(from, to, amount);
    if(!est){
      logSwap('No se pudo estimar.');
      return;
    }

    if(state.wallet.balances[from] < amount){
      logSwap('Saldo insuficiente.');
      return;
    }

    state.wallet.balances[from] -= amount;
    state.wallet.balances[to] += est.amountOut;

    if(from === 'IFX' && to === 'WORLD'){
      state.pool.IFX += amount * (1 - state.fees.swap);
      state.pool.WORLD -= est.amountOut;
    } else {
      state.pool.WORLD += amount * (1 - state.fees.swap);
      state.pool.IFX -= est.amountOut;
    }

    renderWallet();
    updateSwapEstimate();
    logSwap(`Swap ejecutado: -${Number(amount).toFixed(4)} ${from} → +${Number(est.amountOut).toFixed(6)} ${to} | Impacto ${Number(est.priceImpact).toFixed(3)}%`);
    incrementReputationFor('swap');
  }

  function logSwap(msg){
    const el = $('swap-log');
    if(!el) return;
    el.textContent = `${new Date().toLocaleTimeString()} — ${msg}\n` + el.textContent;
  }

  // Lending
  function simulateLending(){
    if(!$('lend-collateral')) return;
    const collateral = Number($('lend-collateral').value || 0);
    const ltv = Number($('lend-ltv').value || 0) / 100;
    const price = state.prices.IFX_USD;

    const collateralUSD = collateral * price;
    const maxBorrow = collateralUSD * ltv;
    const baseAPY = 5.0;
    const borrowAPY = baseAPY + (ltv * 20);

    if($('collateral-usd')) $('collateral-usd').textContent = '$' + Number(collateralUSD).toFixed(2);
    if($('max-borrow')) $('max-borrow').textContent = '$' + Number(maxBorrow).toFixed(2);
    if($('borrow-apy')) $('borrow-apy').textContent = Number(borrowAPY).toFixed(2) + '%';
  }

  function executeLend(){
    if(!$('lend-collateral')) return;
    const collateral = Number($('lend-collateral').value || 0);
    if(state.wallet.balances.IFX < collateral){
      logLend('Saldo IFX insuficiente para depositar.');
      return;
    }
    state.wallet.balances.IFX -= collateral;
    state.pool.IFX += collateral;
    const bonusUSD = collateral * state.prices.IFX_USD * 0.002;
    state.wallet.balances.USD += bonusUSD;

    renderWallet();
    simulateLending();
    logLend(`Colateral depositado: ${Number(collateral).toFixed(2)} IFX. Bonus USD: ${Number(bonusUSD).toFixed(2)}`);
    incrementReputationFor('lend');
  }

  function logLend(msg){
    const el = $('lend-log');
    if(!el) return;
    el.textContent = `${new Date().toLocaleTimeString()} — ${msg}\n` + el.textContent;
  }

  // Reputation
  function renderReputation(){
    const elScore = $('rep-score');
    if(!elScore) return;
    elScore.textContent = Math.round(state.reputation.score);
    const pct = Math.min(100, (state.reputation.score / 200) * 100);
    const fill = $('rep-fill');
    if(fill) fill.style.width = pct + '%';
  }

  function incrementReputationFor(action){
    let delta = 0;
    if(action === 'swap') delta = 1.2;
    if(action === 'lend') delta = 5;
    if(action === 'gov') delta = 10;
    state.reputation.score = Math.min(200, state.reputation.score + delta);
    renderReputation();
    logRep(`Acción '${action}' registrada. +${delta} RP`);
  }

  function logRep(msg){
    const el = $('rep-log');
    if(!el) return;
    el.textContent = `${new Date().toLocaleTimeString()} — ${msg}\n` + el.textContent;
  }

  // Wire events (si existen los elementos)
  function wire(){
    renderWallet();
    renderReputation();
    updateSwapEstimate();
    simulateLending();

    const fromTok = $('from-token');
    if(fromTok) fromTok.addEventListener('change', updateSwapEstimate);
    const toTok = $('to-token');
    if(toTok) toTok.addEventListener('change', updateSwapEstimate);
    const fromAmt = $('from-amount');
    if(fromAmt) fromAmt.addEventListener('input', updateSwapEstimate);
    const simSwap = $('simulate-swap');
    if(simSwap) simSwap.addEventListener('click', () => { updateSwapEstimate(); logSwap('Estimación actualizada.'); });
    const execSwap = $('execute-swap');
    if(execSwap) execSwap.addEventListener('click', executeSwap);

    const ltv = $('lend-ltv');
    if(ltv) ltv.addEventListener('input', (e) => {
      const val = $('lend-ltv-val'); if(val) val.textContent = e.target.value + '%';
      simulateLending();
    });
    const simLend = $('simulate-lending');
    if(simLend) simLend.addEventListener('click', () => { simulateLending(); logLend('Simulación de lending actualizada.'); });
    const execLend = $('execute-lend');
    if(execLend) execLend.addEventListener('click', executeLend);

    document.querySelectorAll('.rep-actions .btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-action');
        incrementReputationFor(action);
      });
    });

    const reset = $('reset-wallet');
    if(reset) reset.addEventListener('click', () => {
      state.wallet = { address: '0xSIMULATED...IFX', balances: { IFX: 10000, WORLD: 5000, USD: 20000 } };
      state.pool = { IFX: 500000, WORLD: 225000 };
      state.reputation.score = 120;
      renderWallet(); renderReputation(); updateSwapEstimate(); simulateLending();
      logSwap('Wallet reseteada.');
      logLend('Wallet reseteada.');
      logRep('Wallet reseteada.');
    });
  }

  document.addEventListener('DOMContentLoaded', wire);
})();
