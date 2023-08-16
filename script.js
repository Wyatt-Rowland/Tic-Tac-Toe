// This will get dom elements one time

const domElements = {
    mainElement: () => document.getElementById('main')
};

// This will be a module that will contain the gameBoard

const boardModule = (function() {
    // Clear game board
    const _clearBoard = function() {
        const gridElements = domElements.mainElement().querySelectorAll('.grid-item');
        gridElements.forEach(element => element.parentNode.removeChild(element));
    };

    const createBoard = function() {
        _clearBoard();           
        const gameContainer = domElements.mainElement().querySelector('#game-container');
        // Loop to create the rows
        for (let i = 0; i < 9; i++) {
            const gridItem = document.createElement('div');
            gridItem.classList.add('grid-item');
            gameContainer.appendChild(gridItem);
            }
        }       
    // Return it so I can call it later
    return {createBoard}
})();

// Function to show the form, and hide the form 

const formControl = () => {
    
    const showForm = () => {
        const form = domElements.mainElement.querySelector('#form-container')
        form.classList.add('active');
        form.style.opacity = 1;
    }
}

// Event listener to show button
domElements

// Creates players that can share characteristics

const createPlayer = (name, symbol, score) => {
    return {
        name,
        symbol,
        score,
        makeMove: function(e) {
            if (e.target.textContent !== '') return;
            e.target.textContent = this.symbol;
            // Determine current Player
            let currentPlayer = player1;
        }
    }
}


const elementsModule = (function() {
    function createElement(tag, attribute = {}, children = []) {
        const element = document.createElement(tag);
        for (let key in attribute) {
            if (key === "textContent") {
                element.textContent = attribute[key];
            } else {
                element.setAttribute(key, attribute[key]);
            }
        }
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        return element;
    }
    return {
        createElement: createElement
    }
})();

// Creates players displays, and shows their names and score

const renderModule = (function() {
    const render = () => {
        createPlayer.forEach((player, i) => {
            const playerEl = createModule.createElement('div')
        })
    }
})();

// This module will contain game information

const gameModule = (function() {
   
})();

// This is the module for the display

const displayModule = (function(){
    const displayBtn = domElements.mainElement().querySelector('#new-game-btn');
        // Listen for the New Game Button to be pressed, and then display the board. 
        displayBtn.addEventListener('click', boardModule.createBoard);
})();