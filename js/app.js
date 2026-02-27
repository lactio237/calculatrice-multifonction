// Simple calculator with history stored in localStorage
(function(){
  const output = document.getElementById('output');
  const historyList = document.getElementById('historyList');
  const historyPreview = document.getElementById('historyPreview');
  const clearHistoryBtn = document.getElementById('clearHistory');

  let current = '0';
  let previous = null;
  let operator = null;
  let shouldReset = false;
  const HISTORY_KEY = 'calc_history_v1';

  function updateDisplay(){
    output.textContent = current;
    historyPreview.textContent = previous && operator ? `${previous} ${operator}` : '';
  }

  function appendDigit(d){
    if(shouldReset){ current = '0'; shouldReset=false; }
    if(current === '0' && d !== '.') current = d;
    else if(d === '.' && current.includes('.')) return;
    else current += d;
    updateDisplay();
  }

  function chooseOp(op){
    if(operator && !shouldReset){ compute(); }
    operator = op;
    previous = current;
    shouldReset = true;
    updateDisplay();
  }

  function compute(){
    if(!operator || previous === null) return;
    const a = parseFloat(previous.replace('×','*').replace('÷','/').replace('−','-'));
    const b = parseFloat(current);
    let res = NaN;
    try{
      switch(operator){
        case '+': res = a + b; break;
        case '−': res = a - b; break;
        case '×': res = a * b; break;
        case '÷': res = b === 0 ? NaN : a / b; break;
      }
    }catch(e){ res = NaN }
    if(isNaN(res)){
      current = 'Erreur';
    } else {
      const expr = `${previous} ${operator} ${current} = ${res}`;
      current = String(res);
      addHistory(expr);
    }
    operator = null; previous = null; shouldReset = true; updateDisplay();
  }

  function clearAll(){ current='0'; previous=null; operator=null; shouldReset=false; updateDisplay(); }
  function backspace(){ if(shouldReset){ current='0'; shouldReset=false; return updateDisplay(); } current = current.slice(0,-1) || '0'; updateDisplay(); }
  function toggleSign(){ if(current === '0') return; current = current.startsWith('-') ? current.slice(1) : '-' + current; updateDisplay(); }
  function percent(){ const v = parseFloat(current); if(isNaN(v)) return; current = String(v/100); updateDisplay(); }

  function loadHistory(){ try{ return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') }catch{ return [] } }
  function saveHistory(arr){ localStorage.setItem(HISTORY_KEY, JSON.stringify(arr)); }
  function addHistory(item){ const h = loadHistory(); h.unshift({text:item, at:Date.now()}); if(h.length>50) h.pop(); saveHistory(h); renderHistory(); }
  function renderHistory(){ const h = loadHistory(); historyList.innerHTML=''; if(h.length===0){ historyList.innerHTML='<li>Aucun élément</li>'; return; }
    h.forEach((it,idx)=>{
      const li = document.createElement('li');
      const expr = document.createElement('span'); expr.className='expr'; expr.textContent = it.text;
      const replay = document.createElement('button'); replay.textContent='↺'; replay.title='Rejouer'; replay.addEventListener('click',()=>{
        // try parse result after = and set as current
        const eq = it.text.split('='); if(eq.length>1){ current = eq[1].trim(); updateDisplay(); }
      });
      li.appendChild(expr); li.appendChild(replay); historyList.appendChild(li);
    });
  }

  function clearHistory(){ localStorage.removeItem(HISTORY_KEY); renderHistory(); }

  document.querySelectorAll('.keys button').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const action = btn.dataset.action;
      const val = btn.textContent.trim();
      if(!action){ // digit
        appendDigit(val);
        return;
      }
      switch(action){
        case 'dot': appendDigit('.'); break;
        case 'clear': clearAll(); break;
        case 'back': backspace(); break;
        case 'sign': toggleSign(); break;
        case 'percent': percent(); break;
        case 'op': chooseOp(val); break;
        case 'equals': compute(); break;
      }
    });
  });

  clearHistoryBtn.addEventListener('click',clearHistory);

  // keyboard support
  window.addEventListener('keydown',(e)=>{
    if(e.key>= '0' && e.key <= '9'){ appendDigit(e.key); return }
    if(e.key === '.') { appendDigit('.'); return }
    if(e.key === 'Enter' || e.key === '='){ compute(); return }
    if(e.key === 'Backspace'){ backspace(); return }
    if(e.key === 'Escape'){ clearAll(); return }
    if(['+','-','/','*'].includes(e.key)){
      const map = {'+':'+','-':'−','*':'×','/':'÷'}; chooseOp(map[e.key]); return;
    }
  });

  // init
  updateDisplay(); renderHistory();
})();
