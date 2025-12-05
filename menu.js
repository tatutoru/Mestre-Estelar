// menu.js - versão robusta completa
(function(){
  // identifica o <script> que carregou este arquivo
  const script = document.currentScript || (function(){
    const s = document.getElementsByTagName('script');
    return s[s.length - 1];
  })();

  // base URL onde este script está hospedado (ex: https://.../Mestre-Estelar/menu.js)
  const scriptUrl = new URL(script.src, location.href);
  // basePath termina com '/'
  const basePath = scriptUrl.pathname.replace(/\/[^\/]*$/, '/');

  // URL absoluta do menu.html relativo ao script
  const menuUrl = new URL('menu.html', scriptUrl).href;

  // busca e injeta
  fetch(menuUrl)
    .then(res => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    })
    .then(html => {
      // injeta no container (cria se necessário)
      let container = document.getElementById('menu-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'menu-container';
        document.body.insertBefore(container, document.body.firstChild);
      }
      container.innerHTML = html;

      // Normaliza links do menu (faz href absolutos a partir de menu.html)
      const anchors = container.querySelectorAll('a[href]');
      anchors.forEach(a => {
        const href = a.getAttribute('href').trim();
        // não mexe em absolutos, anchors, mailto, tel
        if (/^(\/|https?:|#|mailto:|tel:)/i.test(href)) return;
        try {
          const resolved = new URL(href, menuUrl).pathname; // ex: /Mestre-Estelar/index.html
          a.setAttribute('href', resolved);
        } catch (e) {
          // fallback simples relativo ao basePath
          a.setAttribute('href', basePath + href);
        }
      });

      // -- comportamento do menu (colapsar/abrir/etc) --
      const nav = container.querySelector('.ms-menu');
      if (!nav) return;

      const toggle = nav.querySelector('.ms-menu__toggle');
      const list = nav.querySelector('.ms-menu__list');
      const brand = nav.querySelector('.ms-menu__brand');

      // detecta se estamos na página index (normaliza com/sem index.html)
      const pagePath = location.pathname.replace(/\/index\.html$/, '/');
      const menuIndexPath = new URL('index.html', scriptUrl).pathname.replace(/\/index\.html$/, '/');
      const isIndex = (pagePath === menuIndexPath || pagePath === '/' || pagePath === menuIndexPath.replace(/\/$/, ''));

      // se for página interna, colapsa por padrão (classe)
      if (!isIndex) nav.classList.add('ms-menu--collapsed');

      // 1) ocultar o item "Início" na própria index
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

      // 2) garantir marca visível e linkada para home
      if (brand) {
        // se houver <a> dentro, atualiza seu href; se não, cria
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

      // backdrop helpers
      function removeBackdrop(){
        const bd = document.querySelector('.ms-menu-backdrop');
        if (bd) bd.remove();
      }
      function createBackdrop(){
        removeBackdrop();
        const bd = document.createElement('div');
        bd.className = 'ms-menu-backdrop';
        // inserimos antes do container (para evitar stacking issues)
        const root = document.getElementById('menu-container') || document.body;
        root.parentNode.insertBefore(bd, root);
        bd.addEventListener('click', closeMenu);
        return bd;
      }

      function openMenu(){
        nav.classList.add('ms-menu--open');
        if (toggle) toggle.setAttribute('aria-expanded', 'true');
        createBackdrop();
        if (list) {
          const first = list.querySelector('a');
          if (first) first.focus();
        }
      }

      function closeMenu(){
        nav.classList.remove('ms-menu--open');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
        removeBackdrop();
        if (toggle) toggle.focus();
      }

      // toggle click
      if (toggle) {
        toggle.addEventListener('click', function(e){
          const isOpen = nav.classList.toggle('ms-menu--open');
          toggle.setAttribute('aria-expanded', String(isOpen));
          if (isOpen) openMenu(); else closeMenu();
        });
      }

      // fechar com Esc
      document.addEventListener('keydown', function(e){
        if (e.key === 'Escape' && nav.classList.contains('ms-menu--open')) closeMenu();
      });

      // fechar ao clicar num link do menu (para mobile/overlay)
      if (list) {
        list.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
          if (nav.classList.contains('ms-menu--open')) closeMenu();
        }));
      }

      // Remove nós de texto curtos (paliativo: evitar caracteres soltos no DOM)
      // (essa limpeza ajuda caso algum script injete text-nodes isolados)
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
