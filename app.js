// app.js — Professional simulation for InfinichainX (IFX).
// - Tokens: IFX, WLD
// - Features: simulated connect wallet, oracle random-walk, AMM with slippage+fee, lending deposit, tx history, reputation
// - Persistence: localStorage ('ifx_demo_state')

(function () {
  const STORAGE_KEY = 'ifx_demo_state_v2';

  // default state
  const defaultState = {
    wallet: { address: null, balances: { IFX: 10000, WLD: 5000, USD: 20000 } },
    pool: { IFX: 500000, WLD: 225000 },
    prices: { IFX_USD: 0.45, WLD_USD: 2.25 },
    priceHistory: [],
    fees: { swap: 0.003 },
    reputation: { score: 120 },
    txs: [],
    oracle: { running: true, vol: 0.6 }
  };

  // load/save state
  function loadState(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(defaultState));
      const s = JSON.parse(raw);
      // ensure backwards compatibility keys exist
      return Object.assign(JSON.parse(JSON.stringify(defaultState)), s);
    } catch(e){
      console.warn('Failed to load state, using default', e);
      return JSON.parse(JSON.stringify(defaultState));
    }
  }
  function saveState(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
  }

  const state = loadState();

  // helpers
  const $ = id => document.getElementById(id);
  const fmt = (n, d=2) => Number(n).toLocaleString(undefined, {minimumFractionDigits:d, maximumFractionDigits:d});
  const nowISO = () => new Date().toISOString();
  function txHash() { return '0x' + Array.from({length:10}).map(()=>Math.floor(Math.random()*16).toString(16)).join(''); }

  // render
  function renderWallet(){
    const addrEl = $('wallet-address');
    if (addrEl) addrEl.textContent = state.wallet.address || 'Not connected';
    const bIFX = $('bal-ifx'); if(bIFX) bIFX.textContent = fmt(state.wallet.balances.IFX,2);
    const bWLD = $('bal-wld'); if(bWLD) bWLD.textContent = fmt(state.wallet.balances.WLD,2);
    const bUSD = $('bal-usd'); if(bUSD) bUSD.textContent = '$' + fmt(state.wallet.balances.USD,2);
  }

  function renderOracle(){
    const p = state.prices.IFX_USD;
    if($('oracle-price')) $('oracle-price').textContent = `IFX · USD: $${fmt(p,4)}`;
    if($('oracle-vol')) $('oracle-vol').textContent = (state.oracle.vol*100).toFixed(1) + '%';
    const hist = state.priceHistory.slice(-12).map(v=>v.toFixed(4));
    if($('price-spark')) $('price-spark').textContent = 'History: ' + (hist.length? hist.join(' · ') : '—');
    if($('oracle-delta')){
      const prev = state.priceHistory[state.priceHistory.length-2] || state.prices.IFX_USD;
      const delta = prev ? ((state.prices.IFX_USD - prev) / prev) * 100 : 0;
      $('oracle-delta').textContent = (delta>=0? '+':'') + delta.toFixed(2) + '%';
    }
  }

  function renderReputation(){
    if(!$('rep-score')) return;
    $('rep-score').textContent = Math.round(state.reputation.score);
    const pct = Math.min(100, (state.reputation.score / 200) * 100);
    if($('rep-fill')) $('rep-fill').style.width = pct + '%';
  }

  function pushTx(msg, type='info'){
    const t = { id: txHash(), ts: nowISO(), msg, type };
    state.txs.unshift(t);
    saveState();
    renderTxs();
    return t;
  }

  function renderTxs(){
    const el = $('tx-log');
    if(!el) return;
    el.innerHTML = state.txs.slice(0,200).map(t => `<div style="padding:6px 0;border-bottom:1px dashed rgba(255,255,255,0.03)"><strong>${t.id}</strong> <span style="color:var(--muted)">[${t.ts.split('T')[1].split('.')[0]}]</span><div style="margin-top:6px">${t.msg}</div></div>`).join('');
  }

  // ORACLE: random walk generator
  function startOracle(){
    // seed history if empty
    if(state.priceHistory.length < 20){
      for(let i=0;i<40;i++) state.priceHistory.push(state.prices.IFX_USD);
    }
    setInterval(() => {
      if(!state.oracle.running) return;
      const vol = state.oracle.vol;
      const shock = (Math.random()*2 -1) * vol * 0.01;
      const drift = (Math.random()*0.002 - 0.001);
      let last = Math.max(0.001, state.prices.IFX_USD * (1 + shock + drift));
      state.prices.IFX_USD = last;
      state.priceHistory.push(last);
      if(state.priceHistory.length > 400) state.priceHistory.shift();
      renderOracle();
      saveState();
    }, 1400);
  }

  // AMM estimate and execute (constant product)
  function estimateSwap(from, to, amount){
    amount = Number(amount);
    if(!amount || amount <=0 || from === to) return null;
    const reserveIn = from === 'IFX' ? state.pool.IFX : state.pool.WLD;
    const reserveOut = to === 'IFX' ? state.pool.IFX : state.pool.WLD;
    const fee = state.fees.swap;
    const amountInWithFee = amount * (1 - fee);
    const k = state.pool.IFX * state.pool.WLD;
    const newReserveIn = reserveIn + amountInWithFee;
    const newReserveOut = k / newReserveIn;
    const amountOut = reserveOut - newReserveOut;
    const priceRatio = (state.prices.IFX_USD / state.prices.WLD_USD);
    const executedPrice = amount / amountOut;
    const priceImpact = Math.max(0, (executedPrice - priceRatio) / priceRatio) * 100;
    return { amountOut, feeAmount: amount * fee, executedPrice, priceImpact };
  }

  function executeSwap(){
    const from = $('from-token').value;
    const to = $('to-token').value;
    const amount = Number($('from-amount').value || 0);
    if(from===to || amount<=0){ appendLog('swap-log','Invalid input'); return; }
    if(state.wallet.balances[from] < amount){ appendLog('swap-log','Insufficient balance'); return; }
    const est = estimateSwap(from, to, amount);
    if(!est){ appendLog('swap-log','Could not estimate swap'); return; }

    const pending = pushTx(`Swap requested: -${amount.toFixed(4)} ${from} → estimated +${est.amountOut.toFixed(6)} ${to}`);
    appendLog('swap-log', `TX pending ${pending.id} — Estimated +${est.amountOut.toFixed(6)} ${to}`);

    // simulate network confirmation delay
    setTimeout(() => {
      // apply balances
      state.wallet.balances[from] -= amount;
      state.wallet.balances[to] += est.amountOut;
      // update pool (fee removed from amount, amountInWithFee goes to pool)
      if(from==='IFX' && to==='WLD'){
        state.pool.IFX += amount * (1 - state.fees.swap);
        state.pool.WLD -= est.amountOut;
      } else {
        state.pool.WLD += amount * (1 - state.fees.swap);
        state.pool.IFX -= est.amountOut;
      }

      renderWallet();
      appendLog('swap-log', `Swap confirmed: -${amount.toFixed(4)} ${from} → +${est.amountOut.toFixed(6)} ${to} | Impact ${est.priceImpact.toFixed(3)}%`);
      pushTx(`Swap confirmed ${pending.id} — -${amount.toFixed(4)} ${from} → +${est.amountOut.toFixed(6)} ${to}`);
      incrementReputationFor('swap');
      saveState();
    }, 1000 + Math.random()*1400);
  }

  // Lending simulate & execute
  function simulateLending(){
    const collateral = Number($('lend-collateral').value || 0);
    const ltv = Number($('lend-ltv').value || 0) / 100;
    const price = state.prices.IFX_USD;
    const collateralUSD = collateral * price;
    const maxBorrow = collateralUSD * ltv;
    const baseAPY = 5.0;
    const borrowAPY = baseAPY + (ltv * 20);
    if($('collateral-usd')) $('collateral-usd').textContent = '$' + fmt(collateralUSD,2);
    if($('max-borrow')) $('max-borrow').textContent = '$' + fmt(maxBorrow,2);
    if($('borrow-apy')) $('borrow-apy').textContent = fmt(borrowAPY,2) + '%';
  }

  function executeLend(){
    const collateral = Number($('lend-collateral').value || 0);
    if(state.wallet.balances.IFX < collateral){ appendLog('lend-log','Insufficient IFX balance'); return; }
    const tx = pushTx(`Deposit requested: ${collateral.toFixed(2)} IFX collateral`);
    appendLog('lend-log', `TX pending ${tx.id} — Depositing ${collateral.toFixed(2)} IFX`);

    setTimeout(() => {
      state.wallet.balances.IFX -= collateral;
      state.pool.IFX += collateral;
      const bonusUSD = collateral * state.prices.IFX_USD * 0.002;
      state.wallet.balances.USD += bonusUSD;
      renderWallet();
      appendLog('lend-log', `Deposit confirmed: ${collateral.toFixed(2)} IFX. Bonus USD ${bonusUSD.toFixed(2)}`);
      pushTx(`Deposit confirmed ${tx.id} — ${collateral.toFixed(2)} IFX`);
      incrementReputationFor('lend');
      saveState();
    }, 900 + Math.random()*1200);
  }

  // Reputation
  function incrementReputationFor(action){
    let delta = 0;
    if(action==='swap') delta = 1.2;
    if(action==='lend') delta = 5;
    if(action==='gov') delta = 10;
    state.reputation.score = Math.min(200, state.reputation.score + delta);
    renderReputation();
    appendLog('rep-log', `Action '${action}' recorded. +${delta} RP`);
    saveState();
  }

  // UI log append
  function appendLog(elId, msg){
    const el = $(elId);
    if(!el) return;
    el.textContent = `${new Date().toLocaleTimeString()} — ${msg}\n` + el.textContent;
  }

  // connect wallet simulated
  function connectSimulatedWallet(){
    if(state.wallet.address){
      // disconnect
      state.wallet.address = null;
      document.getElementById('connect-wallet').textContent = 'Connect (sim)';
      pushTx('Wallet disconnected (sim)');
    } else {
      // simple ephemeral address
      const addr = '0xSIM' + Math.random().toString(16).slice(2,10).toUpperCase();
      state.wallet.address = addr;
      document.getElementById('connect-wallet').textContent = 'Disconnect';
      pushTx(`Wallet connected: ${addr}`);
    }
    renderWallet();
    saveState();
  }

  // Swap estimate UI
  function updateSwapEstimate(){
    if(!$('from-token')) return;
    const from = $('from-token').value;
    const to = $('to-token').value;
    const amount = Number($('from-amount').value || 0);
    if(from === to || amount <= 0){
      ['to-amount','est-price','price-impact','fee'].forEach(id => { if($(id)) $(id).textContent = '—'; });
      return;
    }
    const est = estimateSwap(from, to, amount);
    if(!est) return;
    if($('to-amount')) $('to-amount').textContent = Number(est.amountOut).toFixed(6);
    if($('est-price')) $('est-price').textContent = Number(est.executedPrice).toFixed(6) + ` ${to}/${from}`;
    if($('price-impact')) $('price-impact').textContent = Number(est.priceImpact).toFixed(3) + '%';
    if($('fee')) $('fee').textContent = Number(est.feeAmount).toFixed(6) + ' ' + from;
  }

  // event wiring
  function wire(){
    renderWallet(); renderOracle(); renderReputation(); renderTxs(); simulateLending();

    const connBtn = $('connect-wallet');
    if(connBtn) connBtn.addEventListener('click', connectSimulatedWallet);

    if($('from-token')) $('from-token').addEventListener('change', updateSwapEstimate);
    if($('to-token')) $('to-token').addEventListener('change', updateSwapEstimate);
    if($('from-amount')) $('from-amount').addEventListener('input', updateSwapEstimate);
    if($('simulate-swap')) $('simulate-swap').addEventListener('click', () => { updateSwapEstimate(); appendLog('swap-log','Estimate updated'); });
    if($('execute-swap')) $('execute-swap').addEventListener('click', executeSwap);

    if($('lend-ltv')) $('lend-ltv').addEventListener('input', (e)=>{ $('lend-ltv-val').textContent = e.target.value + '%'; simulateLending(); });
    if($('simulate-lending')) $('simulate-lending').addEventListener('click', ()=>{ simulateLending(); appendLog('lend-log','Lending estimate updated'); });
    if($('execute-lend')) $('execute-lend').addEventListener('click', executeLend);

    document.querySelectorAll('.rep-actions .btn').forEach(btn=>{
      btn.addEventListener('click', (e)=> {
        const act = e.target.getAttribute('data-action');
        incrementReputationFor(act);
      });
    });

    if($('pause-oracle')) $('pause-oracle').addEventListener('click', ()=>{ state.oracle.running = !state.oracle.running; $('pause-oracle').textContent = state.oracle.running ? 'Pause' : 'Resume'; appendLog('price-spark', `Oracle ${state.oracle.running? 'resumed':'paused'}`); saveState(); });
    if($('reset-oracle')) $('reset-oracle').addEventListener('click', ()=>{ state.prices.IFX_USD = 0.45; state.priceHistory = [state.prices.IFX_USD]; appendLog('price-spark','Oracle reset'); renderOracle(); saveState(); });

    if($('reset-wallet')) $('reset-wallet').addEventListener('click', ()=> {
      state.wallet = { address:null, balances:{ IFX:10000, WLD:5000, USD:20000 } };
      state.pool = { IFX:500000, WLD:225000 };
      state.reputation.score = 120;
      renderWallet(); renderReputation(); renderOracle();
      appendLog('swap-log','Wallet reset');
      appendLog('lend-log','Wallet reset');
      appendLog('rep-log','Wallet reset');
      saveState();
    });
  }

  // initialize on DOM ready
  document.addEventListener('DOMContentLoaded', ()=>{
    wire();
    startOracle();
  });

})();
