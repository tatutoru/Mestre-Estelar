// menu.js - versão ajustada: backdrop no body + menu overlay fixado para evitar bloqueio de cliques
(function(){
  const script = document.currentScript || (function(){
    const s = document.getElementsByTagName('script');
    return s[s.length - 1];
  })();

  const scriptUrl = new URL(script.src, location.href);
  const basePath = scriptUrl.pathname.replace(/\/[^\/]*$/, '/');
  const menuUrl = new URL('menu.html', scriptUrl).href;

  fetch(menuUrl)
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    })
    .then(html => {
      let container = document.getElementById('menu-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'menu-container';
        document.body.insertBefore(container, document.body.firstChild);
      }
      container.innerHTML = html;

      // normaliza links
      const anchors = container.querySelectorAll('a[href]');
      anchors.forEach(a => {
        const href = a.getAttribute('href').trim();
        if (/^(\/|https?:|#|mailto:|tel:)/i.test(href)) return;
        try {
          const resolved = new URL(href, menuUrl).pathname;
          a.setAttribute('href', resolved);
        } catch (e) {
          a.setAttribute('href', basePath + href);
        }
      });

      // comportamento do menu
      const nav = container.querySelector('.ms-menu');
      if (!nav) return;

      const toggle = nav.querySelector('.ms-menu__toggle');
      const list = nav.querySelector('.ms-menu__list');
      const brand = nav.querySelector('.ms-menu__brand');

      const pagePath = location.pathname.replace(/\/index\.html$/, '/');
      const menuIndexPath = new URL('index.html', scriptUrl).pathname.replace(/\/index\.html$/, '/');
      const isIndex = (pagePath === menuIndexPath || pagePath === '/' || pagePath === menuIndexPath.replace(/\/$/, ''));

      if (!isIndex) nav.classList.add('ms-menu--collapsed');

      // ocultar "Início" quando estamos no index
      if (isIndex && list) {
        const anchorsAll = nav.querySelectorAll('a[href]');
        anchorsAll.forEach(a => {
          try {
            const url = new URL(a.getAttribute('href'), location.href);
            const p = url.pathname.replace(/\/index\.html$/, '/');
            if (p === menuIndexPath || p === '/') {
              const li = a.closest('li');
              if (li) li.style.display = 'none';
            }
          } catch(e){}
        });
      }

      // garantir marca com link para home
      if (brand) {
        try {
          const homeHref = new URL('index.html', scriptUrl).pathname;
          const existing = brand.querySelector('a');
          if (existing) existing.setAttribute('href', homeHref);
          else {
            const txt = brand.textContent.trim() || 'Mestre Estelar';
            brand.innerHTML = '';
            const a = document.createElement('a');
            a.href = homeHref;
            a.textContent = txt;
            brand.appendChild(a);
          }
        } catch(e){}
      }

      // backdrop helpers - agora inserimos no body (melhor para stacking)
      function removeBackdrop(){
        const bd = document.querySelector('.ms-menu-backdrop');
        if(bd) bd.remove();
      }
      function createBackdrop(){
        removeBackdrop();
        const bd = document.createElement('div');
        bd.className = 'ms-menu-backdrop';
        // inserir no body (evita stacking issues)
        document.body.appendChild(bd);

        // estilos inline mínimos para consistência entre browsers
        bd.style.position = 'fixed';
        bd.style.inset = '0';
        bd.style.background = 'rgba(0,0,0,0.18)';
        bd.style.zIndex = '11140';
        bd.style.pointerEvents = 'auto';

        bd.addEventListener('click', closeMenu);
        return bd;
      }

      // open/close: além de classes, garantimos position/z-index do list (proteção contra stacking)
      function openMenu(){
        nav.classList.add('ms-menu--open');
        if (toggle) toggle.setAttribute('aria-expanded','true');

        // garantir que o menu overlay esteja acima do backdrop e fixado
        if (list) {
          list.style.position = 'fixed';
          list.style.top = '0';
          list.style.right = '0';
          list.style.width = '300px';
          list.style.height = '100vh';
          list.style.zIndex = '11150';
          list.style.pointerEvents = 'auto';
          list.style.transform = 'none';
        }

        createBackdrop();

        if (list) {
          const first = list.querySelector('a, button');
          if (first) first.focus();
        }
      }

      function closeMenu(){
        nav.classList.remove('ms-menu--open');
        if (toggle) toggle.setAttribute('aria-expanded','false');

        // limpa estilos inline aplicados ao abrir
        if (list) {
          list.style.position = '';
          list.style.top = '';
          list.style.right = '';
          list.style.width = '';
          list.style.height = '';
          list.style.zIndex = '';
          list.style.pointerEvents = '';
          list.style.transform = '';
        }

        removeBackdrop();

        if (toggle) toggle.focus();
      }

      if (toggle) {
        toggle.addEventListener('click', function(e){
          const isOpen = nav.classList.toggle('ms-menu--open');
          toggle.setAttribute('aria-expanded', String(isOpen));
          if (isOpen) openMenu(); else closeMenu();
        });
      }

      document.addEventListener('keydown', function(e){
        if (e.key === 'Escape' && nav.classList.contains('ms-menu--open')) closeMenu();
      });

      if (list) {
        list.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
          if (nav.classList.contains('ms-menu--open')) closeMenu();
        }));
      }

      // limpeza paliativa de text-nodes curtos (evita caracteres soltos)
      document.querySelectorAll('*').forEach(el=>{
        [...el.childNodes].forEach(n=>{
          if(n.nodeType===3){
            const t = n.textContent.trim();
            if(/^[a-zA-Z]$/.test(t)){
              n.parentNode.removeChild(n);
            }
          }
        });
      });

    })
    .catch(err => {
      console.error('Erro ao carregar menu:', err);
    });
})();
