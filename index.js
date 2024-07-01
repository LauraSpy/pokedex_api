
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
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
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
        pokemonElement.innerHTML = `
            <div class="pokemon-title">
                <span class="pokemon-level">
                    <p class="pokemon-number">Niveau ${pokemon.id}</p>
                    <h2 class="pokemon-name">${pokemon.name}</h2>
                </span>
                <span class="pokemon-image">
                    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                </span>
            </div>
            <p class="pokemon-types">Type(s): ${pokemon.types.map(type => type.type.name).join(', ')}</p>
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
            alert("Numéro de page invalide !");
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
    pageInfo.textContent = `Page ${currentPage} sur ${totalPages}`;
    document.getElementById('page-input').max = totalPages; // Mettre à jour le max de l'input
}


document.getElementById('search').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredPokemon = allPokemon.filter(pokemon => 
        pokemon.name.toLowerCase().includes(searchTerm) || 
        pokemon.id.toString().includes(searchTerm)
    );
    currentPage = 1; // Réinitialiser à la première page lors d'une recherche
    displayPokemon(filteredPokemon);
});

function createTypeFilters() {
    const types = [...new Set(allPokemon.flatMap(pokemon => pokemon.types.map(type => type.type.name)))];
    const filtersElement = document.getElementById('filters');
    types.forEach(type => {
        const button = document.createElement('button');
        button.textContent = type;
        button.addEventListener('click', () => filterByType(type));
        filtersElement.appendChild(button);
    });
}

function filterByType(type) {
    const filteredPokemon = allPokemon.filter(pokemon => 
        pokemon.types.some(t => t.type.name === type)
    );
    currentPage = 1; // Réinitialiser à la première page lors d'un filtrage
    displayPokemon(filteredPokemon);
}

fetchPokemon();

// IMPLEMENTATION DE LA RECHERCHE

document.getElementById('search').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredPokemon = allPokemon.filter(pokemon => 
        pokemon.name.toLowerCase().includes(searchTerm) || 
        pokemon.id.toString().includes(searchTerm)
    );
    displayPokemon(filteredPokemon);
});

// IMPLEMENTATION DES FILTRES

function createTypeFilters() {
    const types = [...new Set(allPokemon.flatMap(pokemon => pokemon.types.map(type => type.type.name)))];
    const filtersElement = document.getElementById('filters');
    types.forEach(type => {
        const button = document.createElement('button');
        button.textContent = type;
        button.addEventListener('click', () => filterByType(type));
        filtersElement.appendChild(button);
    });
}

function filterByType(type) {
    const filteredPokemon = allPokemon.filter(pokemon => 
        pokemon.types.some(t => t.type.name === type)
    );
    displayPokemon(filteredPokemon);
}

// Appelez cette fonction après avoir récupéré tous les Pokémon
createTypeFilters();