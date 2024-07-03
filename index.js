
// RECUPERATION DES DONNEES POUR L'API

const API_URL = 'https://pokeapi.co/api/v2/pokemon';
let allPokemon = [];
let currentPage = 1;
const pokemonPerPage = 21; // Nombre de Pokémon par page pour avoir les 3 évolutions possibles

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
        console.error('Error, no data found:', error);
    }
}

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

    const select = document.createElement('select');
    select.id = 'type-filter';

    types.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type === 'all' ? 'All types' : type;
        select.appendChild(option);
    });

    select.addEventListener('change', (e) => filterByType(e.target.value));
    filtersElement.appendChild(select);
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


