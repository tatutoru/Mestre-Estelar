// ===============================
// menu.js - versão final, completa e funcional (com pequenos ajustes)
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
    .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
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

      // Se não está no index, começa colapsado
      if (!isIndex) nav.classList.add("ms-menu--collapsed");

      // === ADDED: esconder lateral direita em todas as páginas exceto index ===
      // Tenta encontrar possíveis seletores usados para "lado direito" no menu.html
      (function handleRightSidebar() {
        const rightCandidates = [
          ".ms-menu__right",
          ".ms-menu-side",
          "#menu-right",
          ".ms-menu__sidebar",
          ".ms-menu-right"
        ];
        rightCandidates.forEach(sel => {
          const el = nav.querySelector(sel);
          if (!el) return;
          if (!isIndex) {
            // remove visualmente e também do fluxo de acessibilidade
            el.style.display = "none";
            el.setAttribute("aria-hidden","true");
          } else {
            el.style.display = "";
            el.removeAttribute("aria-hidden");
          }
        });
      })();
      // === end ADDED ===

      // === ADDED: transformar LIs estáticos em <a> automaticamente (quando faltar <a>) ===
      // Se o menu.html tiver <li>Texto</li> sem <a>, criamos um link com slug padrão.
      (function autolinkListItems(){
        if (!list) return;
        list.querySelectorAll("li").forEach(li => {
          // pula se já há um link dentro
          if (li.querySelector("a")) return;
          const txt = li.textContent.trim();
          if (!txt) return;
          // mapeamento simples: "Início" -> index.html, outros -> slug.html
          let href = txt.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'') // remove acentos
                      .replace(/[^a-z0-9\s-]/g,'') // remove chars invalidos
                      .trim().replace(/\s+/g, '-')
                      + '.html';
          if (/^(in[íi]cio|inicio|home)$/i.test(txt)) href = 'index.html';
          const a = document.createElement('a');
          // utiliza caminho relativo correto em relação ao script/menu.html
          try { a.href = new URL(href, scriptUrl).pathname; } catch(e) { a.href = basePath + href; }
          a.textContent = txt;
          // copia atributos ARIA básicos do li (se houver)
          if (li.id) a.id = li.id + "-link";
          li.innerHTML = "";
          li.appendChild(a);
        });
      })();
      // === end ADDED ===

      // ---------------------------
      // Backdrop
      // ---------------------------
      function removeBackdrop(){ const bd = document.querySelector(".ms-menu-backdrop"); if (bd) bd.remove(); }
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
      // Mover lista para body ao abrir
      // ---------------------------
      let _listOriginalParent = null;
      let _listOriginalNext = null;
      function openMenu(){
        nav.classList.add("ms-menu--open");
        if (toggle) toggle.setAttribute("aria-expanded","true");
        // Mover lista para o body (ELIMINA stacking context)
        if (list && list.parentNode !== document.body) {
          _listOriginalParent = list.parentNode;
          _listOriginalNext = list.nextSibling;
          document.body.appendChild(list);
        }
        // Forçar estilo do painel list.style.position = "fixed";
        list.style.position = "fixed";
        list.style.top = "0";
        list.style.height = "100vh";
        list.style.width = "300px";
        list.style.zIndex = "11150";
        list.style.pointerEvents = "auto";
        list.style.margin = "0";
        list.style.transform = "none";
        // Define lado baseado no toggle
        const rect = toggle.getBoundingClientRect();
        const center = window.innerWidth / 2;
        const openLeft = rect.left < center;
        if (openLeft) { list.style.left = "0"; list.style.right = ""; }
        else { list.style.right = "0"; list.style.left = ""; }
        createBackdrop();
        // Foco no primeiro item
        const first = list.querySelector("a, button");
        if (first) first.focus();
      }
      function closeMenu(){
        nav.classList.remove("ms-menu--open");
        if (toggle) toggle.setAttribute("aria-expanded","false");
        // Limpa estilos
        list.style.position = "";
        list.style.top = "";
        list.style.left = "";
        list.style.right = "";
        list.style.width = "";
        list.style.height = "";
        list.style.zIndex = "";
        list.style.pointerEvents = "";
        list.style.margin = "";
        list.style.transform = "";
        // Restaurar lista ao lugar original
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
        toggle.addEventListener("click", () => {
          const isOpen = nav.classList.contains("ms-menu--open");
          if (!isOpen) openMenu(); else closeMenu();
        });
      }

      // Fechar com ESC
      document.addEventListener("keydown", e => {
        if (e.key === "Escape" && nav.classList.contains("ms-menu--open")) closeMenu();
      });

      // Fechar ao clicar em um item
      if (list) {
        list.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
          if (nav.classList.contains("ms-menu--open")) closeMenu();
        }));
      }

    })
    .catch(err => console.error("Erro ao carregar menu:", err));
})();
