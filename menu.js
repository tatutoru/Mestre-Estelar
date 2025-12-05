// ===============================
// menu.js - ajuste: abrir painel abaixo e à esquerda do toggle, itens verticais
// ===============================

(function(){
  const script = document.currentScript || (function(){
    const s = document.getElementsByTagName("script");
    return s[s.length - 1];
  })();

  const scriptUrl = new URL(script.src, location.href);
  const basePath = scriptUrl.pathname.replace(/\/[^\/]*$/, "/");
  const menuUrl = new URL("menu.html", scriptUrl).href;

  fetch(menuUrl)
    .then(r => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    })
    .then(html => {
      let container = document.getElementById("menu-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "menu-container";
        document.body.insertBefore(container, document.body.firstChild);
      }
      container.innerHTML = html;

      // Normalização de links
      container.querySelectorAll("a[href]").forEach(a => {
        const href = a.getAttribute("href").trim();
        if (/^(\/|https?:|mailto:|tel:|#)/i.test(href)) return;
        try { a.href = new URL(href, menuUrl).pathname; }
        catch(e) { a.href = basePath + href; }
      });

      const nav = container.querySelector(".ms-menu");
      if (!nav) return;

      const toggle = nav.querySelector(".ms-menu__toggle");
      const list = nav.querySelector(".ms-menu__list");
      const brand = nav.querySelector(".ms-menu__brand");

      // Detectar se está no index
      const pagePath = location.pathname.replace(/\/index\.html$/, "/");
      const menuIndexPath = new URL("index.html", scriptUrl).pathname.replace(/\/index\.html$/, "/");
      const isIndex = (pagePath === menuIndexPath || pagePath === "/" || pagePath === menuIndexPath.replace(/\/$/, ""));

      // Ocultar item "Início" no index
      if (isIndex) {
        nav.querySelectorAll("a[href]").forEach(a => {
          try {
            let p = new URL(a.href, location.href).pathname.replace(/\/index\.html$/, "/");
            if (p === "/" || p === menuIndexPath) {
              const li = a.closest("li");
              if (li) li.style.display = "none";
            }
          } catch(e){}
        });
      }

      // Manter marca como link para home
      if (brand) {
        const homeHref = new URL("index.html", scriptUrl).pathname;
        const a = brand.querySelector("a") || document.createElement("a");
        a.href = homeHref;
        a.textContent = brand.textContent.trim() || "Mestre Estelar";
        brand.innerHTML = "";
        brand.appendChild(a);
      }

      if (!isIndex) nav.classList.add("ms-menu--collapsed");

      // Backdrop helpers
      function removeBackdrop(){
        const bd = document.querySelector(".ms-menu-backdrop");
        if (bd) bd.remove();
      }
      function createBackdrop(){
        removeBackdrop();
        const bd = document.createElement("div");
        bd.className = "ms-menu-backdrop";
        document.body.appendChild(bd);
        bd.style.position = "fixed";
        bd.style.inset = "0";
        bd.style.background = "rgba(0,0,0,0.18)";
        bd.style.zIndex = "11140";
        bd.style.pointerEvents = "auto";
        bd.addEventListener("click", closeMenu);
        return bd;
      }

      // Move list to body when open (avoid stacking contexts)
      let _listOriginalParent = null;
      let _listOriginalNext = null;

      // OPEN: abaixo do toggle e alinhado à esquerda do toggle (vertical)
      function openMenu(){
        nav.classList.add('ms-menu--open');
        if (toggle) toggle.setAttribute('aria-expanded','true');

        // move lista para body se necessário
        if (list && list.parentNode !== document.body) {
          _listOriginalParent = list.parentNode;
          _listOriginalNext = list.nextSibling;
          document.body.appendChild(list);
        }

        // força estilo do painel (vertical)
        list.style.position = 'fixed';
        list.style.height = 'auto';
        list.style.width = '220px';
        list.style.zIndex = '11150';
        list.style.pointerEvents = 'auto';
        list.style.margin = '0';
        list.style.transform = 'none';
        list.style.boxSizing = 'border-box';
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.style.alignItems = 'flex-start';
        list.style.gap = '6px';
        list.style.padding = '8px';

// ==========================
// POSICIONAMENTO FORÇADO À ESQUERDA
// ==========================
const rect = toggle.getBoundingClientRect();
const topPos = Math.round(rect.bottom + 8);

// força o menu a sempre abrir na esquerda da tela
let leftPos = 8; // 8px da borda
const menuWidth = 220;

// garante que caiba na tela
if (leftPos + menuWidth > window.innerWidth - 8) {
  leftPos = window.innerWidth - menuWidth - 8;
}

// aplica posição fixa
list.style.left = leftPos + 'px';
list.style.right = '';
        // calcula top após o browser ter medido o conteúdo
        setTimeout(() => {
          const computedHeight = list.getBoundingClientRect().height || 200;
          let finalTop = topPos;
          if (finalTop + computedHeight > window.innerHeight - 8) {
            finalTop = Math.max(8, window.innerHeight - computedHeight - 8);
          }
          list.style.top = finalTop + 'px';
        }, 0);

        createBackdrop();

        // foco
        const first = list.querySelector('a, button');
        if (first) first.focus();
      }

      // CLOSE: restaura
      function closeMenu(){
        nav.classList.remove('ms-menu--open');
        if (toggle) toggle.setAttribute('aria-expanded','false');

        if (list) {
          list.style.position = '';
          list.style.top = '';
          list.style.left = '';
          list.style.right = '';
          list.style.width = '';
          list.style.height = '';
          list.style.zIndex = '';
          list.style.pointerEvents = '';
          list.style.margin = '';
          list.style.transform = '';
          list.style.boxSizing = '';
          list.style.display = '';
          list.style.flexDirection = '';
          list.style.alignItems = '';
          list.style.gap = '';
          list.style.padding = '';
        }

        if (_listOriginalParent) {
          if (_listOriginalNext) _listOriginalParent.insertBefore(list, _listOriginalNext);
          else _listOriginalParent.appendChild(list);
        }
        _listOriginalParent = null;
        _listOriginalNext = null;

        removeBackdrop();
        if (toggle) toggle.focus();
      }

      // Toggle listener
      if (toggle) {
        toggle.addEventListener('click', () => {
          const isOpen = nav.classList.contains('ms-menu--open');
          if (!isOpen) openMenu();
          else closeMenu();
        });
      }

      // ESC fecha
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && nav.classList.contains('ms-menu--open')) closeMenu();
      });

      // fechar ao clicar em link
      if (list) {
        list.querySelectorAll('a').forEach(a =>
          a.addEventListener('click', () => {
            if (nav.classList.contains('ms-menu--open')) closeMenu();
          })
        );
      }

      // limpeza paliativa de text-nodes curtos
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
    .catch(err => console.error("Erro ao carregar menu:", err));
})();
