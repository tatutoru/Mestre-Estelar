fetch("menu.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("menu-container").innerHTML = data;
    })
    .catch(err => console.error("Erro ao carregar o menu:", err));
