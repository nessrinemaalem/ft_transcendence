document.addEventListener("DOMContentLoaded", function() {
    // Fonction pour charger le contenu
    function chargerContenu(page) {
        fetch(page + ".html")
            .then(response => response.text())
            .then(data => {
                document.getElementById("contenu").innerHTML = data;
            })
            .catch(error => console.error('Erreur de chargement:', error));
    }

    // Gérer le chargement initial
    if (window.location.hash) {
        chargerContenu(window.location.hash.substr(1));
    } else {
        chargerContenu("accueil");
    }

    // Gérer la navigation
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('href').substr(1);
            chargerContenu(page);
        });
    });
});
