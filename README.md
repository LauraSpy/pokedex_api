# Pokédex README

Welcome to the Pokédex API, a web application that allows you to browse and filter Pokémon data. This README will guide you through the various features and options available on the site.

Note : I am using de PokéApi here - https://pokeapi.co. 

## Filtering Options

### Type Filters
The type filters are located in the dropdown menu at the top of the page. You can select one or multiple types to filter the Pokémon list. For example, if you select "Fire" and "Water", the list will only show Pokémon that have both Fire and Water types.

### Search Bar
The search bar allows you to filter Pokémon by various criteria. You can search by:

- Pokémon name
- Type (e.g. "Fire", "Water", etc.)
- ID number
- Simply type in your search query and press Enter to see the filtered results.

### Go to Page
The "Go to Page" feature allows you to navigate directly to a specific page of the Pokémon list. Simply enter the page number you want to go to and click the "Go" button.

## Understanding the JavaScript Code
If you're interested in understanding how the filtering options work, you can take a look at the JavaScript code that powers the site. Here are some key files and functions to look out for:

- script.js: This file contains the main JavaScript code that handles the filtering and pagination.
- filterTypes(): This function is responsible for filtering the Pokémon list based on the selected types.
- searchPokemon(): This function handles the search bar functionality, filtering the list based on the user's input.
- paginate(): This function is responsible for paginating the Pokémon list and updating the "Go to Page" feature.

By exploring these files and functions, you can gain a deeper understanding of how the filtering options work and even customize the code to suit your needs.