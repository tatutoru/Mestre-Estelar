fetch("/Mestre-Estelar/menu.html")
  .then(response => {
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.text();
  })
  .then(data => document.getElementById("menu-container").innerHTML = data)
  .catch(err => console.error("Erro ao carregar o menu:", err));
