document.addEventListener('DOMContentLoaded', () => {

    // This should santize the users input and prevent XSS attacks. This is for security reasons
    const sanitizeModule = (function(){
        const sanitizeInput = (input) => {
            // Creates an empty, invisible div
                const div = document.createElement('div');
                //sets the div to input value
                div.textContent = input;
                // returns only its innerHTML, which prevents any of it from adding to my html
                return div.innerHTML;
            }
        return { sanitizeInput };
    })();
    // This will get dom elements one time
    const domElements = {
        mainElement: document.getElementById('main')
    };
    // Get all helpers value here so I don't need to type querySelector as much
    const domHelpers = {
        getRadioValue: function() {
            return domElements.mainElement.querySelector('#radio').value;
        },
        player1NameInput:  function() {
            return sanitizeModule.sanitizeInput(domElements.mainElement.querySelector('.get-player1-name-input').value);
        },
        player2NameInput: function(){
            return sanitizeModule.sanitizeInput(domElements.mainElement.querySelector('.get-player2-name-input').value);
        },
        getForm: function() {
            return domElements.mainElement.querySelector('#form-container');
        }
    };


    // This will be a module that will contain the gameBoard
    const boardModule = (() => {
        // Clear game board
        const _clearBoard = () => {
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

    const validationModule = (() => {
        const isValidInput = (input) => {            
            console.log("input:", input)

            return input && input.length >= 1 && input.length <= 10 && /^[a-zA-Z0-9!@#$%^&*()_+,\-./:;<=>?@[\]^_`{|}~]+$/.test(input);
        };
        const validatePlayerName = (input) => {
            if (domHelpers.getRadioValue() !== 'player2' || isValidInput(input)) {
                return true;
            } else {
                return false;
            }
        }
        return { validatePlayerName } 
    })();

    

    // Creates players displays, and shows their names and score
    const renderModule = (() => {
        const player1Name = domElements.mainElement.querySelector('#player1-name');
        const player2Name = domElements.mainElement.querySelector('#player2-ai-name');
        const player1Input = domElements.mainElement.querySelector('.get-player1-name-input');
        const player2Input = domElements.mainElement.querySelector('.get-player2-name-input');

            // This will keep the player 2 name up-to-date
        const updatePlayer2Name = () => {
                let aiName = '';
                switch (domHelpers.getRadioValue()) {
                    case 'easy': aiName = "Locke"; break;
                    case 'normal': aiName = "Tom"; break;
                    case 'hard': aiName = "John"; break;
                    default: aiName = "Name Here"; break;
                }
                player2Name.textContent = aiName;
        }

        const renderPlayerInfo = () => {
            if (validationModule.validatePlayerName(domHelpers.player1NameInput()) === false || validationModule.validatePlayerName(domHelpers.player2NameInput()) === false) {
                player1Input.placeholder = "REQUIRED";
                player2Input.placeholder = "REQUIRED";
            } else if (validationModule.validatePlayerName(domHelpers.player1NameInput()) === true || validationModule.validatePlayerName(domHelpers.player2NameInput()) === true) {
                player1Name.textContent = domHelpers.player1NameInput();
                if (domHelpers.getRadioValue() === 'player2') {
                    player2Name.textContent = domHelpers.player2NameInput();
                } 
            } 
        };
        
        const updateScores = (winner, loser) => {

        }

        return {
            renderPlayerInfo,
            updateScores,
            updatePlayer2Name
        }
        
        
    })();

    // This module will contain game information
    const gameModule = (() => {
    
    })();

    // Event listener to show button
    const listenerModule = (() => {
        const listener = () => {
            const newGameBtn = domElements.mainElement.querySelector('#new-game-btn');
            newGameBtn.addEventListener('click', formControl.showForm);            

            const radioButtons = domElements.mainElement.querySelectorAll('[name="radio"]');
            radioButtons.forEach(radio => {
                radio.addEventListener('change', renderModule.updatePlayer2Name);
            });
        } 
        return { listener }; 
    })();
     
    // This is the module for the display
    const displayModule = (function(){
        const displayBtn = domElements.mainElement.querySelector('.confirm-name-btn');    
            // Listen for the New Game Button to be pressed, and then display the board. 
            const displayListener = (() => { 
                displayBtn.addEventListener('click', (e) => {             
                    e.preventDefault();

                    if (validationModule.validatePlayerName(domHelpers.player1NameInput()) && 
                        validationModule.validatePlayerName(domHelpers.player2NameInput())) {
                            formControl.hideForm(); 
                            boardModule.createBoard();
                        } 
                    renderModule.renderPlayerInfo();
                });
            })();    
    })();

    listenerModule.listener();
});