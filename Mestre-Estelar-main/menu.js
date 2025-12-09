// menu.js - versão estável: carrega menu.html, normaliza links
// e controla collapse/expand do menu nas páginas internas.

(function () {
  // descobre a URL do próprio script
  const script = document.currentScript || (function () {
    const scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1];
  })();

  const scriptUrl = new URL(script.src, location.href);
  const basePath = scriptUrl.pathname.replace(/\/[^\/]*$/, "/"); // termina com /
  const menuUrl = new URL("menu.html", scriptUrl).href;

  fetch(menuUrl)
    .then((res) => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then((html) => {
      // garante que existe um container
      let container = document.getElementById("menu-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "menu-container";
        document.body.insertBefore(container, document.body.firstChild);
      }
      container.innerHTML = html;

      // normaliza links do menu (pra não virar /equip/algumaCoisa.html, etc.)
      const anchors = container.querySelectorAll("a[href]");
      anchors.forEach((a) => {
        const href = a.getAttribute("href").trim();
        // se já é absoluto ou especial, ignora
        if (/^(\/|https?:|#|mailto:|tel:)/i.test(href)) return;
        try {
          const resolved = new URL(href, menuUrl).pathname;
          a.setAttribute("href", resolved);
        } catch (e) {
          a.setAttribute("href", basePath + href);
        }
      });

      // pega elementos principais
      const nav = container.querySelector(".ms-menu");
      if (!nav) return;

      const toggle = nav.querySelector(".ms-menu__toggle");
      const list = nav.querySelector(".ms-menu__list");

      // colapsar em páginas internas (mostrar só hambúrguer + título)
      const pagePath = location.pathname.replace(/\/index\.html$/, "/");
      const menuIndexPath = new URL("index.html", scriptUrl)
        .pathname.replace(/\/index\.html$/, "/");
      const isIndex =
        pagePath === menuIndexPath ||
        pagePath === "/" ||
        pagePath === menuIndexPath.replace(/\/$/, "");

      if (!isIndex) {
        nav.classList.add("ms-menu--collapsed");
      }

      // ==== Backdrop simples ====
      function createBackdrop() {
        let bd = document.querySelector(".ms-menu-backdrop");
        if (!bd) {
          bd = document.createElement("div");
          bd.className = "ms-menu-backdrop";
          bd.style.position = "fixed";
          bd.style.inset = "0";
          bd.style.background = "rgba(0,0,0,0.05)";
          bd.style.zIndex = "900";
          bd.style.pointerEvents = "auto";
          document.body.appendChild(bd);
          bd.addEventListener("click", closeMenu);
        }
        return bd;
      }

      function removeBackdrop() {
        const bd = document.querySelector(".ms-menu-backdrop");
        if (bd) bd.remove();
      }

      // ==== Abrir / Fechar ====
      function openMenu() {
        nav.classList.add("ms-menu--open");
        if (toggle) toggle.setAttribute("aria-expanded", "true");
        createBackdrop();

        // foco no primeiro link
        if (list) {
          const first = list.querySelector("a, button");
          if (first) first.focus();
        }
      }

      function closeMenu() {
        nav.classList.remove("ms-menu--open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
        removeBackdrop();
        if (toggle) toggle.focus();
      }

      // clique no hambúrguer
      if (toggle) {
        toggle.addEventListener("click", () => {
          const isOpen = nav.classList.contains("ms-menu--open");
          if (isOpen) {
            closeMenu();
          } else {
            openMenu();
          }
        });
      }

      // ESC fecha
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && nav.classList.contains("ms-menu--open")) {
          closeMenu();
        }
      });

      // clicar em qualquer link fecha o menu
      if (list) {
        list.querySelectorAll("a").forEach((a) => {
          a.addEventListener("click", () => {
            if (nav.classList.contains("ms-menu--open")) {
              closeMenu();
            }
          });
        });
      }
    })
    .catch((err) => {
      console.error("Erro ao carregar menu:", err);
    });
})();
