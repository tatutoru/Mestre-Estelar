// menu.js - versão corrigida: busca menu.html relativo a si, injeta, normaliza links e faz toggle/collapse
(function(){
  const script = document.currentScript || (function(){
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  const scriptUrl = new URL(script.src, location.href);
  const basePath = scriptUrl.pathname.replace(/\/[^\/]*$/, '/'); // terminar com '/'
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

      // normalizar links do menu para não apontarem para /equip/ etc
      const anchors = container.querySelectorAll('a[href]');
      anchors.forEach(a => {
        const href = a.getAttribute('href').trim();
        if (/^(\/|https?:|#|mailto:|tel:)/i.test(href)) return;
        try {
          const resolved = new URL(href, menuUrl).pathname; // retorna /Mestre-Estelar/...
          a.setAttribute('href', resolved);
        } catch (e) {
          a.setAttribute('href', basePath + href);
        }
      });

      // comportamento collapse em páginas internas
      const nav = container.querySelector('.ms-menu');
      if (!nav) return;

      const pagePath = location.pathname.replace(/\/index\.html$/, '/');
      const menuIndexPath = new URL('index.html', scriptUrl).pathname.replace(/\/index\.html$/, '/');
      const isIndex = (pagePath === menuIndexPath || pagePath === '/' || pagePath === menuIndexPath.replace(/\/$/, ''));

      if (!isIndex) nav.classList.add('ms-menu--collapsed');

      const toggle = nav.querySelector('.ms-menu__toggle');
      const list = nav.querySelector('.ms-menu__list');

      function createBackdrop(){
        let bd = document.querySelector('.ms-menu-backdrop');
        if (!bd) {
          bd = document.createElement('div');
          bd.className = 'ms-menu-backdrop';
          bd.style.position = 'fixed';
          bd.style.inset = '0';
          bd.style.background = 'rgba(0,0,0,0.18)';
          bd.style.zIndex = '1100';
          document.body.appendChild(bd);
          bd.addEventListener('click', closeMenu);
        }
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
        const bd = document.querySelector('.ms-menu-backdrop');
        if (bd) bd.remove();
        if (toggle) toggle.focus();
      }

      if (toggle) {
        toggle.addEventListener('click', function(){
          const isOpen = nav.classList.toggle('ms-menu--open');
          toggle.setAttribute('aria-expanded', String(isOpen));
          if (isOpen) openMenu(); else closeMenu();
        });
      }

      document.addEventListener('keydown', function(e){
        if (e.key === 'Escape' && nav.classList.contains('ms-menu--open')) {
          closeMenu();
        }
      });

      if (list) {
        list.querySelectorAll('a').forEach(a => {
          a.addEventListener('click', function(){
            if (nav.classList.contains('ms-menu--open')) closeMenu();
          });
        });
      }
    })
    .catch(err => {
      // mostra erro no console, mas evita break total
      console.error('Erro ao carregar menu:', err);
    });
})();
