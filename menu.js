// ===============================
// menu.js - carrega menu.html, posiciona overlay à esquerda,
// animações suaves, backdrop e comportamento acessível.
// ===============================

(function(){
  // resolve onde este script está para buscar menu.html corretamente
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
      // inject container if missing
      let container = document.getElementById("menu-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "menu-container";
        document.body.insertBefore(container, document.body.firstChild);
      }
      container.innerHTML = html;

      // normalize links inside menu (make hrefs absolute to project root)
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

      // detect if current page is index (so we can hide "Início" there)
      const pagePath = location.pathname.replace(/\/index\.html$/, "/");
      const menuIndexPath = new URL("index.html", scriptUrl).pathname.replace(/\/index\.html$/, "/");
      const isIndex = (pagePath === menuIndexPath || pagePath === "/" || pagePath === menuIndexPath.replace(/\/$/, ""));

      // hide "Início" link only on the index page
      if (isIndex && list) {
        nav.querySelectorAll("a[href]").forEach(a => {
          try {
            const p = new URL(a.href, location.href).pathname.replace(/\/index\.html$/, "/");
            if (p === "/" || p === menuIndexPath) {
              const li = a.closest("li"); if (li) li.style.display = "none";
            }
          } catch(e){}
        });
      }

      // ensure brand exists and links to home
      if (brand) {
        const homeHref = new URL("index.html", scriptUrl).pathname;
        const a = brand.querySelector("a") || document.createElement("a");
        a.href = homeHref;
        a.textContent = brand.textContent.trim() || "Mestre Estelar";
        brand.innerHTML = "";
        brand.appendChild(a);
      }

      // initially collapse menu on internal pages
      if (!isIndex) nav.classList.add("ms-menu--collapsed");

      // backdrop helpers (put on body)
      function removeBackdrop(){
        const bd = document.querySelector(".ms-menu-backdrop");
        if (bd) bd.remove();
      }
      function createBackdrop(){
        removeBackdrop();
        const bd = document.createElement("div");
        bd.className = "ms-menu-backdrop";
        document.body.appendChild(bd);
        // inline style for robustness
        bd.style.position = 'fixed';
        bd.style.inset = '0';
        bd.style.background = 'rgba(0,0,0,0.05)';
        bd.style.zIndex = '11140';
        bd.style.pointerEvents = 'auto';
        bd.addEventListener('click', closeMenu);
        return bd;
      }

      // save original parent to restore when closing
      let _listOriginalParent = null;
      let _listOriginalNext = null;

      // OPEN: animated and careful with reflows
      function openMenu(){
        nav.classList.add('ms-menu--open');
        if (toggle) toggle.setAttribute('aria-expanded','true');

        // move list to body (avoid stacking context)
        if (list && list.parentNode !== document.body) {
          _listOriginalParent = list.parentNode;
          _listOriginalNext = list.nextSibling;
          document.body.appendChild(list);
        }

        // initial inline styles to prepare animation
        list.style.position = 'fixed';
        list.style.height = 'auto';
        list.style.width = '220px';
        list.style.zIndex = '11150';
        list.style.pointerEvents = 'none';
        list.style.margin = '0';
        list.style.transform = 'translateY(-8px) scale(.995)';
        list.style.opacity = '0';
        list.style.boxSizing = 'border-box';
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.style.alignItems = 'flex-start';
        list.style.gap = '6px';
        list.style.padding = '8px';

        // position below the toggle, left-aligned at 8px (force left)
        const rect = toggle.getBoundingClientRect();
        const topPos = Math.round(rect.bottom + 8);
        let leftPos = 8;
        if (leftPos + 220 > window.innerWidth - 8) leftPos = Math.max(8, window.innerWidth - 220 - 8);
        list.style.left = leftPos + 'px';
        list.style.right = '';

        // allow browser to compute then animate in
        requestAnimationFrame(() => {
          setTimeout(()=> {
            const computedHeight = list.getBoundingClientRect().height || 200;
            let finalTop = topPos;
            if (finalTop + computedHeight > window.innerHeight - 8) {
              finalTop = Math.max(8, window.innerHeight - computedHeight - 8);
            }
            list.style.top = finalTop + 'px';

            // enable pointer events and trigger visible state
            list.style.pointerEvents = 'auto';
            list.style.opacity = '1';
            list.style.transform = 'translateY(0) scale(1)';

            // small animating marker (optional)
            nav.classList.add('ms-menu--animating');
            setTimeout(()=> nav.classList.remove('ms-menu--animating'), 400);
          }, 0);
        });

        createBackdrop();

        // focus first item after a short delay
        setTimeout(()=> {
          const first = list.querySelector('a, button');
          if (first) first.focus();
        }, 220);
      }

      // CLOSE: animate out then restore DOM
      function closeMenu(){
        nav.classList.remove('ms-menu--open');
        if (toggle) toggle.setAttribute('aria-expanded','false');

        if (list) {
          list.style.pointerEvents = 'none';
          list.style.opacity = '0';
          list.style.transform = 'translateY(-8px) scale(.995)';
        }

        // cleanup after animation completes
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
        }, 320); // matches CSS durations
      }

      // toggle click
      if (toggle) {
        toggle.addEventListener('click', () => {
          const isOpen = nav.classList.contains('ms-menu--open');
          if (!isOpen) openMenu();
          else closeMenu();
        });
      }

      // esc to close
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && nav.classList.contains('ms-menu--open')) closeMenu();
      });

      // clicking a menu link closes the overlay
      if (list) {
        list.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
          if (nav.classList.contains('ms-menu--open')) closeMenu();
        }));
      }

      // remove stray single-character text nodes (palliative)
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
