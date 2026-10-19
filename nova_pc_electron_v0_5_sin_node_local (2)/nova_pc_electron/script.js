(() => {
  const windows = [...document.querySelectorAll('.window')];
  const taskApps = [...document.querySelectorAll('.task-app')];
  const startMenu = document.getElementById('start-menu');
  const toast = document.getElementById('toast');
  let z = 5, toastTimer;
  const history = ['https://example.com']; let historyIndex = 0;
  const getWin = name => document.querySelector(`[data-window="${name}"]`);
  function notify(msg) { toast.textContent = msg; toast.classList.remove('hidden'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.add('hidden'), 3200); }
  function syncTasks() { taskApps.forEach(b => b.classList.toggle('open', !getWin(b.dataset.open).classList.contains('hidden'))); }
  function focus(win) { win.style.zIndex = ++z; windows.forEach(w => w.classList.toggle('active', w === win)); }
  function openWin(name) { const win = getWin(name); win.classList.remove('hidden'); focus(win); startMenu.classList.add('hidden'); syncTasks(); }
  function closeWin(name) { getWin(name).classList.add('hidden'); syncTasks(); }
  function minimize(name) { closeWin(name); }
  function maximize(name) {
    const win = getWin(name);
    if (win.dataset.max === 'yes') {
      ['left','top','width','height'].forEach(k => win.style[k] = win.dataset['old'+k] || '');
      win.style.borderRadius = '14px'; win.dataset.max = 'no';
    } else {
      const r = win.getBoundingClientRect();
      ['left','top','width','height'].forEach(k => win.dataset['old'+k] = ({left:r.left,top:r.top,width:r.width,height:r.height})[k] + (k === 'left' || k === 'top' ? 'px' : 'px'));
      win.style.left = '0'; win.style.top = '0'; win.style.width = '100%'; win.style.height = 'calc(100% - 58px)'; win.style.borderRadius = '0'; win.dataset.max = 'yes';
    }
    focus(win);
  }
  document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => openWin(b.dataset.open)));
  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeWin(b.dataset.close)));
  document.querySelectorAll('[data-minimize]').forEach(b => b.addEventListener('click', () => minimize(b.dataset.minimize)));
  document.querySelectorAll('[data-maximize]').forEach(b => b.addEventListener('click', () => maximize(b.dataset.maximize)));
  windows.forEach(win => win.addEventListener('pointerdown', () => focus(win)));
  document.getElementById('start').addEventListener('click', () => startMenu.classList.toggle('hidden'));
  document.getElementById('start-close').addEventListener('click', () => startMenu.classList.add('hidden'));
  document.getElementById('desktop').addEventListener('click', e => { if (!e.target.closest('#start-menu,#start,[data-open]')) startMenu.classList.add('hidden'); });

  // Arrastra las ventanas desde su barra de título.
  windows.forEach(win => {
    const handle = win.querySelector('[data-drag]'); let drag = null;
    handle.addEventListener('pointerdown', e => {
      if (e.target.closest('button') || win.dataset.max === 'yes') return;
      focus(win); const r = win.getBoundingClientRect(); drag = {x:e.clientX,y:e.clientY,left:r.left,top:r.top}; handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener('pointermove', e => { if (!drag) return; win.style.left = `${Math.max(0,Math.min(innerWidth-120,drag.left+e.clientX-drag.x))}px`; win.style.top = `${Math.max(0,Math.min(innerHeight-100,drag.top+e.clientY-drag.y))}px`; });
    const stop = () => drag = null; handle.addEventListener('pointerup',stop); handle.addEventListener('pointercancel',stop);
  });

  const address = document.getElementById('address'), frame = document.getElementById('browser-frame');
  function normalize(value) {
    let v = value.trim(); if (!v) return null;
    if (!/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(v)) {
      if (v.includes('.') && !v.includes(' ')) v = `https://${v}`;
      else { notify('La búsqueda web no se puede mostrar en todos los sitios dentro de un iframe. Escribe una dirección web o pulsa ↗ para abrir el buscador en otra pestaña.'); return null; }
    }
    try { const u = new URL(v); return ['http:','https:'].includes(u.protocol) ? u.href : null; } catch { return null; }
  }
  function load(value, push=true) {
    const url = normalize(value); if (!url) return notify('Escribe una dirección http o https válida.');
    address.value = url; frame.src = url;
    if (push) { history.splice(historyIndex+1); history.push(url); historyIndex = history.length-1; }
  }
  document.getElementById('address-form').addEventListener('submit', e => { e.preventDefault(); load(address.value); });
  document.getElementById('external').addEventListener('click', () => { const u=normalize(address.value); if(u) window.open(u,'_blank','noopener,noreferrer'); });
  document.getElementById('back').addEventListener('click', () => { if(historyIndex>0) load(history[--historyIndex],false); else notify('No hay una página anterior en esta sesión.'); });
  document.getElementById('forward').addEventListener('click', () => { if(historyIndex<history.length-1) load(history[++historyIndex],false); else notify('No hay una página siguiente en esta sesión.'); });
  document.getElementById('reload').addEventListener('click', () => load(address.value,false));
  const ytInput = document.getElementById('yt-query');
  const ytFrame = document.getElementById('yt-frame');
  const ytWelcome = document.getElementById('yt-welcome');
  const ytError = document.getElementById('yt-error');
  function getYoutubeId(value) {
    const raw = value.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;
    try {
      const u = new URL(raw.includes('://') ? raw : `https://${raw}`);
      const host = u.hostname.replace(/^www\./, '').replace(/^m\./, '');
      if (host === 'youtu.be') return u.pathname.split('/').filter(Boolean)[0] || null;
      if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
        if (u.pathname === '/watch') return u.searchParams.get('v');
        const parts = u.pathname.split('/').filter(Boolean);
        if (['embed', 'shorts', 'live'].includes(parts[0])) return parts[1] || null;
      }
    } catch (_) {}
    return null;
  }
  document.getElementById('yt-search').addEventListener('submit', e => {
    e.preventDefault();
    const value = ytInput.value.trim();
    const id = getYoutubeId(value);
    ytError.classList.add('hidden');
    if (!id) {
      ytError.textContent = 'Para reproducir dentro de Nova PC, pega un enlace de vídeo (por ejemplo, https://www.youtube.com/watch?v=VIDEO_ID) o su ID de 11 caracteres. La búsqueda por palabras no se puede incrustar de forma fiable con el reproductor oficial.';
      ytError.classList.remove('hidden');
      return;
    }
    ytFrame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=0&rel=0`;
    ytWelcome.classList.add('hidden');
    notify('Vídeo cargado en el reproductor de Nova PC.');
  });
  function clock(){document.getElementById('clock').textContent=new Intl.DateTimeFormat('es-CO',{hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());} clock(); setInterval(clock,30000);
  openWin('browser');
})();
