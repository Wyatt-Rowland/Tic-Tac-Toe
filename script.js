// This will get dom elements one time

const domElements = {
    mainElement: () => document.getElementById('main')
};

// This will be a module that will contain the gameBoard

const boardModule = (function() {
    // Clear game board
    const _clearBoard = function() {
        const gridElements = domElements.mainElement().querySelectorAll('.grid');
        gridElements.forEach(element => element.parentNode.removeChild(element));
    };

    const createBoard = function() {
        _clearBoard();           
        const gameContainer = domElements.mainElement().querySelector('#game-container');
        // Loop to create the rows
        for (let i = 0; i < 3; i++) {
            const gridRow = document.createElement('div');
            gridRow.classList.add('grid-row', 'grid');
            // Loop to create the columns
            for (let j = 0; j < 3; j++) {
                const gridColumn = document.createElement('div');
                gridColumn.classList.add('grid-column', 'grid');
                gridRow.appendChild(gridColumn);
            }
            gameContainer.appendChild(gridRow);
        }
    }       
    // Return it so I can call it later
    return {createBoard}
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