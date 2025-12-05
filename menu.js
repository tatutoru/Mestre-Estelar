// ===============================
// menu.js - versão final com animações suaves (open/close)
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

      // Move list to body when open (avoid stacking contexts)
      let _listOriginalParent = null;
      let _listOriginalNext = null;

      // ---------------------------
      // Animated openMenu / closeMenu
      // ---------------------------

      function openMenu(){
        // mark nav as opening/open (class controls animations via CSS)
        nav.classList.add('ms-menu--open');
        if (toggle) toggle.setAttribute('aria-expanded','true');

        // move list to body if needed (avoids being clipped by ancestors)
        if (list && list.parentNode !== document.body) {
          _listOriginalParent = list.parentNode;
          _listOriginalNext = list.nextSibling;
          document.body.appendChild(list);
        }

        // initial style state (pre-animation)
        list.style.position = 'fixed';
        list.style.height = 'auto';
        list.style.width = '220px';
        list.style.zIndex = '11150';
        list.style.pointerEvents = 'none'; // disable during initial setup
        list.style.margin = '0';
        list.style.transform = 'translateY(-8px) scale(.995)';
        list.style.opacity = '0';
        list.style.boxSizing = 'border-box';
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.style.alignItems = 'flex-start';
        list.style.gap = '6px';
        list.style.padding = '8px';

        // position below toggle, left-aligned to left edge of viewport (8px), ensure fits
        const rect = toggle.getBoundingClientRect();
        const topPos = Math.round(rect.bottom + 8);
        let leftPos = 8;
        if (leftPos + 220 > window.innerWidth - 8) leftPos = Math.max(8, window.innerWidth - 220 - 8);
















        list.style.left = leftPos + 'px';
        list.style.right = '';

        // request animation frame to allow the browser to apply the initial styles, then transition to visible
        requestAnimationFrame(() => {
          // compute height after render, then place top properly
          setTimeout(()=> {
            const computedHeight = list.getBoundingClientRect().height || 200;
            let finalTop = topPos;
            if (finalTop + computedHeight > window.innerHeight - 8) {
              finalTop = Math.max(8, window.innerHeight - computedHeight - 8);
            }
            list.style.top = finalTop + 'px';

            // enable pointer events and let CSS transitions handle opacity/transform
            list.style.pointerEvents = 'auto';
            list.style.opacity = '1';
            list.style.transform = 'translateY(0) scale(1)';
            // add a temporal animating marker if needed
            nav.classList.add('ms-menu--animating');
            setTimeout(()=> nav.classList.remove('ms-menu--animating'), 400);
          }, 0);
        });

        createBackdrop();

        // focus first item at end of animation (small delay)
        setTimeout(()=>{
          const first = list.querySelector('a, button');
          if (first) first.focus();
        }, 220);
      }


      function closeMenu(){
        // remove open class to trigger CSS exit transitions
        nav.classList.remove('ms-menu--open');
        if (toggle) toggle.setAttribute('aria-expanded','false');

        // block pointer events while closing
        list.style.pointerEvents = 'none';
        list.style.opacity = '0';
        list.style.transform = 'translateY(-8px) scale(.995)';

        // after animation time, cleanup inline styles and restore DOM
        setTimeout(()=> {
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
            list.style.opacity = '';
          }

          if (_listOriginalParent) {
            if (_listOriginalNext) _listOriginalParent.insertBefore(list, _listOriginalNext);
            else _listOriginalParent.appendChild(list);
          }
          _listOriginalParent = null;
          _listOriginalNext = null;

          removeBackdrop();
          if (toggle) toggle.focus();
        }, 320); // match or slightly exceed CSS transition durations
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
