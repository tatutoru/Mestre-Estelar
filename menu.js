// menu.js - versão robusta
(function() {
  const script = document.currentScript || (function(){
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  // base do script (ex: /Mestre-Estelar/  ou /Mestre-Estelar/equip/)
  const scriptUrl = new URL(script.src, location.origin);
  const basePath = scriptUrl.pathname.replace(/\/[^\/]*$/, '/');

  fetch(basePath + 'menu.html')
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    })
    .then(html => {
      // cria um container se não existir (evita erro)
      let container = document.getElementById('menu-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'menu-container';
        // insere no começo do body (ajuste se quiser outro local)
        document.body.insertBefore(container, document.body.firstChild);
      }
      container.innerHTML = html;
    })
    .catch(err => console.error("Erro ao carregar o menu:", err));
})();
