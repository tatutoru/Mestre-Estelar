// menu.js - busca menu.html relativo a si mesmo e ajusta links relativos
(function() {
  const script = document.currentScript || (function(){
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  console.log('menu.js loaded from:', script.src);

  // base onde o menu.js está (ex: /Mestre-Estelar/ )
  const scriptUrl = new URL(script.src, location.href);
  const basePath = scriptUrl.pathname.replace(/\/[^\/]*$/, '/'); // termina com '/'

  const menuUrl = new URL('menu.html', scriptUrl).href;
  console.log('fetching menu from:', menuUrl);

  fetch(menuUrl)
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    })
    .then(html => {
      let container = document.getElementById('menu-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'menu-container';
        document.body.insertBefore(container, document.body.firstChild);
      }
      container.innerHTML = html;

      // --- Ajuste dos links relativos dentro do menu ---
      // Seleciona todos os links dentro do container
      const anchors = container.querySelectorAll('a[href]');

      anchors.forEach(a => {
        const href = a.getAttribute('href').trim();

        // ignora casos absolutos e especiais:
        // começa com '/', 'http:', 'https:', '#', 'mailto:', 'tel:'
        if (/^(\/|https?:|#|mailto:|tel:)/i.test(href)) {
          return; // já absoluto ou especial — não mexer
        }

        // Caso o href comece com './' ou '../' — resolvemos relativo ao menu.html original
        // new URL(href, menuUrl) resolve corretamente ../ e ./
        try {
          const resolved = new URL(href, menuUrl).pathname;
          // Queremos que o link aponte para a partir do basePath (por exemplo /Mestre-Estelar/index.html)
          // resolved já é o caminho absoluto do servidor (começa com '/')
          a.setAttribute('href', resolved);
        } catch (e) {
          // fallback simples: prefixa com basePath
          a.setAttribute('href', basePath + href);
        }
      });

      console.log('menu injected and links normalized.');
    })
    .catch(err => console.error("Erro ao carregar o menu:", err));
})();
