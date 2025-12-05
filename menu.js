fetch("/Mestre-Estelar/menu.html")
  .then(r => r.text())
  .then(html => {
    document.getElementById("menu-container").innerHTML = html;
  })
  .catch(err => console.error("Erro ao carregar o menu:", err));
