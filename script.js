// This will get dom elements one time
const domElements = {
    mainElement: document.getElementById('main')
};

// This should santize the users input and ensure it fits the criteria. 
const sanitizeModule = (function(){
    const sanitizeInput = (input) => {
        if (input && input.length >= 1 && input.length <= 10 && /^[a-zA-Z0-9!@#$%^&*()_+,\-./:;<=>?@[\]^_`{|}~]+$/.test(input)){
            const div = document.createElement('div');
            div.textContent = input;
            return { value: div.innerHTML, valid: true };
        }
        return { value: null, valid: false };
    }
    return {sanitizeInput}
})();

// This gets radio value, as well as sets a variable name for player 2 name to be used
const domHelpers = {
    getRadioValue: function() {
        return domElements.mainElement.querySelector('#radio').value;
    },
    sanitizedPlayer2Name: function() {
        return sanitizeModule.sanitizeInput(domElements.mainElement.querySelector('.get-player2-name-input').value);
    },
    getForm: function() {
        return domElements.mainElement.querySelector('#form-container')
    }
};


// This will be a module that will contain the gameBoard
const boardModule = (function() {
    // Clear game board
    const _clearBoard = function() {
        const gridElements = domElements.mainElement.querySelectorAll('.grid-item');
        gridElements.forEach(element => element.parentNode.removeChild(element));
    };

    const createBoard = function() {
        _clearBoard();           
        const gameContainer = domElements.mainElement.querySelector('#game-container');
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

const formControl = (function() {
    // Function to show the form for names
    const showForm = () => {
        let form = domHelpers.getForm();
        form.classList.add('active');
        form.style.opacity = 1;
        if (domHelpers.getRadioValue() !== 'player2') {
            form.querySelector('.get-player2-name-input').style.opacity = 0;
        }
    }
    // Function to hide form
    const hideForm = () => {
        let form = domHelpers.getForm();
        form.classList.remove('active');
        form.style.opacity = 0;
    }
    return {
        showForm: showForm,
        hideForm: hideForm
    }
})();

// Event listener to show button
const listener = () => {
    const newGameBtn = domElements.mainElement.querySelector('#new-game-btn');
    newGameBtn.addEventListener('click', formControl.showForm);
}


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
    const player1Name = domElements.mainElement.querySelector('#player1-name');
    const player2Name = domElements.mainElement.querySelector('#player2-ai-name');

    const renderPlayerInfo = () => {
        const player1NameInput = domElements.mainElement.querySelector('.get-player1-name-input').value;
        const player2NameInput = domHelpers.getRadioValue() === 'player2' ? domHelpers.sanitizedPlayer2Name() : null;
        // Check that it exists and sanitize it            
        const sanitizedPlayerName = sanitizeModule.sanitizeInput(player1NameInput)

        if (!sanitizedPlayerName.valid) {
            domElements.mainElement.querySelector('.get-player1-name-input').value = 'REQUIRED';
            return;
        } 
        player1Name.textContent = sanitizedPlayerName.value;

        // Check if the radio value is player 2, and if it is, then make sure it exists. 
        if (domHelpers.getRadioValue() === 'player2') {
            const player2NameValidation = domHelpers.sanitizedPlayer2Name();
            if (!player2NameValidation.valid) {
                domElements.mainElement.querySelector('.get-player2-name-input').value = 'REQUIRED';
                return;
            }
            player2Name.textContent = player2NameValidation.value;
        } else if (domHelpers.getRadioValue() === 'easy') {
            player2Name.textContent = 'Buck'
        } else if (domHelpers.getRadioValue() === 'normal') {
            player2Name.textContent = 'Tom'
        } else {
            player2Name.textContent = 'John'
        }
    };
    
    const updateScores = (winner, loser) => {

    }

    return {
        renderPlayerInfo,
        updateScores
    }
    
    
})();

// This module will contain game information
const gameModule = (function() {
   
})();

// This is the module for the display
const displayModule = (function(){
    const displayBtn = domElements.mainElement.querySelector('.confirm-name-btn');
        // Listen for the New Game Button to be pressed, and then display the board. 
        displayBtn.addEventListener('click', (e) => {
            e.preventDefault();
            boardModule.createBoard();
            formControl.hideForm();
            renderModule.renderPlayerInfo();
        });

})();

listener();