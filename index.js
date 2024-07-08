
// RECUPERATION DES DONNEES POUR L'API

const API_URL = 'https://pokeapi.co/api/v2/pokemon';
let allPokemon = [];
let currentPage = 1;
const pokemonPerPage = 21; // Nombre de Pokémon par page pour avoir les 3 évolutions possibles

// Fonction pour récupérer les données des Pokémons depuis l'API
async function fetchPokemon() {
    try {
        const response = await fetch(`${API_URL}?limit=151`);
        const data = await response.json();
        allPokemon = await Promise.all(data.results.map(async (pokemon) => {
            const res = await fetch(pokemon.url);
            return res.json();
        }));
        displayPokemon(allPokemon);
        setupPagination();
        createTypeFilters(); // Ajoutez cette ligne
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
    }
}

// Fonction pour afficher les Pokémons sur la page
function displayPokemon(pokemonList) {
    const pokemonListElement = document.getElementById('pokemon-list');
    pokemonListElement.innerHTML = '';
    
    const startIndex = (currentPage - 1) * pokemonPerPage;
    const endIndex = startIndex + pokemonPerPage;
    const paginatedPokemon = pokemonList.slice(startIndex, endIndex);

    paginatedPokemon.forEach(pokemon => {
        const pokemonElement = document.createElement('div');
        pokemonElement.className = 'pokemon-card'; // Ajoutez cette ligne

        // Récupérer les stats du Pokémon
        const stats = pokemon.stats.reduce((acc, stat) => {
            acc[stat.stat.name] = stat.base_stat;
            return acc;
        }, {});

        // Convertir le poids de hectogrammes en kilogrammes
        const weightInKg = pokemon.weight / 10;
        // Convertir la taille de décimètres en mètres
        const heightInM = pokemon.height / 10;
        // toFixed(), utilisé par la suite, sert à limiter le nombre de décimales affichées (2 pour la taille, 1 pour le poids)
        
        pokemonElement.innerHTML = `
            <div class="pokemon-title">
                <p class="pokemon-number">ID ${pokemon.id}</p>
                <span class="pokemon-level">
                    <h2 class="pokemon-name">${pokemon.name}</h2>
                    <p class="pokemon-hp">pv <strong>${stats.hp}</strong></p>
                </span>
                <span class="pokemon-image">
                    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                </span>
            </div>
            <div class="pokemon-info">
                <div class="pokemon-types">
                    <span>Type : ${pokemon.types.map(type => type.type.name).join(', ')}</span>
                    <span class="pokemon-size">Size: ${heightInM.toFixed(2)} m</span>
                    <span class="pokemon-weight">Weight: ${weightInKg.toFixed(1)} kg</span>
                </div>
                <div class="pokemon-stats">
                    <div class="pokemon-stats-attack">
                        <p>Attack: ${stats.attack}</p>
                        <p>Sp. Attack: ${stats['special-attack']}</p>
                    </div>
                    <div class="pokemon-stats-defense">
                        <p>Defense: ${stats.defense}<p>
                        <p>Sp. Defense: ${stats['special-defense']}</p>
                    </div>
                    <p class="pokemon-speed">Speed ${stats.speed}</p>
                </div>
            </div>
        `;
        pokemonListElement.appendChild(pokemonElement);
    });

    updatePageInfo();
}

function setupPagination() {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInput = document.getElementById('page-input');
    const goToPageButton = document.getElementById('go-to-page');

    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayPokemon(allPokemon);
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentPage < Math.ceil(allPokemon.length / pokemonPerPage)) {
            currentPage++;
            displayPokemon(allPokemon);
        }
    });

    goToPageButton.addEventListener('click', () => {
        const pageNumber = parseInt(pageInput.value);
        if (pageNumber >= 1 && pageNumber <= Math.ceil(allPokemon.length / pokemonPerPage)) {
            currentPage = pageNumber;
            displayPokemon(allPokemon);
        } else {
            alert("Invalid page number !");
        }
    });

    // Mettre à jour l'input lorsque la page change
    function updatePageInput() {
        pageInput.value = currentPage;
    }

    // Appeler updatePageInput chaque fois que la page change
    const observer = new MutationObserver(updatePageInput);
    observer.observe(document.getElementById('page-info'), { childList: true });
}

function updatePageInfo() {
    const pageInfo = document.getElementById('page-info');
    const totalPages = Math.ceil(allPokemon.length / pokemonPerPage);
    pageInfo.textContent = `> ${currentPage} / ${totalPages}`;
    document.getElementById('page-input').max = totalPages; // Mettre à jour le max de l'input
}


// IMPLEMENTATION DE LA RECHERCHE ET DU FILTRAGE
document.getElementById('search').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredPokemon = allPokemon.filter(pokemon => 
        pokemon.name.toLowerCase().includes(searchTerm) || 
        pokemon.id.toString().includes(searchTerm) ||
        pokemon.types.some(type => type.type.name.toLowerCase().includes(searchTerm))
    );
    currentPage = 1; // Réinitialiser à la première page lors d'une recherche
    displayPokemon(filteredPokemon);
});

// IMPLEMENTATION DES FILTRES
function createTypeFilters() {
    const types = ['all', ...new Set(allPokemon.flatMap(pokemon => pokemon.types.map(type => type.type.name)))];
    const filtersElement = document.getElementById('filters');
    filtersElement.innerHTML = ''; // Vider les filtres existants

    // Créer un conteneur pour les checkboxes
    const checkboxContainer = document.createElement('div');
    checkboxContainer.className = 'checkbox-container';

    // Créer les checkboxes pour les types
    types.forEach(type => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `type-${type}`;
        checkbox.value = type;
        checkbox.checked = type === 'all'; // Cocher "all" par défaut

        const label = document.createElement('label');
        label.htmlFor = `type-${type}`;
        label.textContent = type === 'all' ? 'All types' : type;

        const wrapper = document.createElement('div');
        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);

        checkboxContainer.appendChild(wrapper);
    });

    // Ajouter le conteneur de checkboxes au filtre
    filtersElement.appendChild(checkboxContainer);

    // Ajouter le filtre de vitesse
    const speedFilter = document.createElement('div');
    speedFilter.innerHTML = `
        <label for="speed-filter"> - Minimum speed :</label>
        <input type="number" id="speed-filter" min="0" max="200" value="0">
    `;
    filtersElement.appendChild(speedFilter);

    // Ajouter le bouton de validation
    const applyButton = document.createElement('button');
    applyButton.textContent = 'Apply filters';
    applyButton.addEventListener('click', applyFilters);
    filtersElement.appendChild(applyButton);

    // Ajouter le bouton pour afficher/cacher les filtres sur mobile
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Filters';
    toggleButton.id = 'toggle-filters';
    toggleButton.addEventListener('click', toggleFilters);
    filtersElement.insertBefore(toggleButton, filtersElement.firstChild);
}

// Fonction pour afficher/cacher les filtres
function toggleFilters() {
    const checkboxContainer = document.querySelector('.checkbox-container');
    const speedFilter = document.querySelector('#speed-filter').parentNode;
    const applyButton = document.querySelector('#filters button:last-child');
    
    checkboxContainer.classList.toggle('show');
    speedFilter.classList.toggle('show');
    applyButton.classList.toggle('show');
}

function filterByMultipleTypes() {
    const checkedTypes = Array.from(document.querySelectorAll('#filters input:checked'))
        .map(checkbox => checkbox.value);

    const filteredPokemon = checkedTypes.includes('all') || checkedTypes.length === 0
        ? allPokemon
        : allPokemon.filter(pokemon => 
            pokemon.types.some(t => checkedTypes.includes(t.type.name.toLowerCase()))
          );

    currentPage = 1; // Réinitialiser à la première page lors d'un filtrage
    displayPokemon(filteredPokemon);
}

function applyFilters() {
    const checkedTypes = Array.from(document.querySelectorAll('#filters input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    const minSpeed = parseInt(document.getElementById('speed-filter').value) || 0;

    const filteredPokemon = allPokemon.filter(pokemon => {
        const typeMatch = checkedTypes.includes('all') || 
            pokemon.types.some(t => checkedTypes.includes(t.type.name.toLowerCase()));
        const speedMatch = pokemon.stats.find(stat => stat.stat.name === 'speed').base_stat >= minSpeed;
        return typeMatch && speedMatch;
    });

    currentPage = 1; // Réinitialiser à la première page lors d'un filtrage
    displayPokemon(filteredPokemon);
}

function filterByType(type) {
    const filteredPokemon = type === 'all' 
        ? allPokemon 
        : allPokemon.filter(pokemon => 
            pokemon.types.some(t => t.type.name.toLowerCase() === type.toLowerCase())
          );
    currentPage = 1; // Réinitialiser à la première page lors d'un filtrage
    displayPokemon(filteredPokemon);
}

fetchPokemon();

// Appelez cette fonction après avoir récupéré tous les Pokémon
createTypeFilters();


