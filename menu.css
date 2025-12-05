// ===============================
// menu.js - versão com painel posicionado abaixo do toggle (vertical) 
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
        try {
          a.href = new URL(href, menuUrl).pathname;
        } catch(e) {
          a.href = basePath + href;
        }
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

      // Se não está no index, começa colapsado
      if (!isIndex) nav.classList.add("ms-menu--collapsed");

      // ---------------------------
      // Backdrop helpers
      // ---------------------------
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

      // ---------------------------
      // Move list to body when open (avoid stacking contexts)
      // ---------------------------
      let _listOriginalParent = null;
      let _listOriginalNext = null;

      // ---------------------------
      // openMenu / closeMenu
      // ---------------------------

      function openMenu(){
        nav.classList.add('ms-menu--open');
        if (toggle) toggle.setAttribute('aria-expanded','true');

        // Mover lista para o body (se necessário)
        if (list && list.parentNode !== document.body) {
          _listOriginalParent = list.parentNode;
          _listOriginalNext = list.nextSibling;
          document.body.appendChild(list);
        }

        // base de estilos do painel
        list.style.position = 'fixed';
        list.style.height = 'auto';
        list.style.width = '220px';
        list.style.zIndex = '11150';
        list.style.pointerEvents = 'auto';
        list.style.margin = '0';
        list.style.transform = 'none';
        list.style.boxSizing = 'border-box';

        // calcula onde abrir (abaixo do toggle)
        const rect = toggle.getBoundingClientRect();
        const center = window.innerWidth / 2;
        const openLeft = rect.left < center;

        const topPos = Math.round(rect.bottom + 8); // 8px gap
        // posicionamento horizontal: tenta manter dentro da viewport
        if (openLeft) {
          let leftPos = Math.max(8, rect.left);
          if (leftPos + 220 > window.innerWidth - 8) leftPos = Math.max(8, window.innerWidth - 220 - 8);
          list.style.left = leftPos + 'px';
          list.style.right = '';
        } else {
          let rightGap = Math.max(8, window.innerWidth - rect.right);
          if (rightGap + 220 > window.innerWidth - 8) rightGap = 8;
          list.style.right = rightGap + 'px';
          list.style.left = '';
        }

        // aguarda browser calcular altura do conteúdo
        setTimeout(() => {
          const computedHeight = list.getBoundingClientRect().height || 200;
          let finalTop = topPos;
          if (finalTop + computedHeight > window.innerHeight - 8) {
            finalTop = Math.max(8, window.innerHeight - computedHeight - 8);
          }
          list.style.top = finalTop + 'px';
        }, 0);

        createBackdrop();

        // foco no primeiro item
        const first = list.querySelector('a, button');
        if (first) first.focus();
      }

      function closeMenu(){
        nav.classList.remove('ms-menu--open');
        if (toggle) toggle.setAttribute('aria-expanded','false');

        // limpa estilos inline
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
        }

        // restaurar lista para local original
        if (_listOriginalParent) {
          if (_listOriginalNext) _listOriginalParent.insertBefore(list, _listOriginalNext);
          else _listOriginalParent.appendChild(list);
        }

        _listOriginalParent = null;
        _listOriginalNext = null;

        removeBackdrop();
        if (toggle) toggle.focus();
      }

      // Toggle
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

      // Limpeza paliativa de text-nodes curtos (evita caracteres soltos)
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
