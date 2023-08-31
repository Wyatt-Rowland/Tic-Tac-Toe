document.addEventListener('DOMContentLoaded', () => {

    // This should santize the users input and prevent XSS attacks. This is for security reasons
    const sanitizeModule = (() => {
        // Creates an empty, invisible div
        const div = document.createElement('div');
        const sanitizeInput = (input) => {     
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
    const domHelpers = (() => {
        const queryMain = (selector) => document.getElementById('main').querySelector(selector);
        const _dirtyPlayer1 = () => queryMain('.get-player1-name-input').value;
        const _dirtyPlayer2 = () => queryMain('.get-player2-name-input').value;
        return {
            getRadioValue: () => queryMain('#radio').value,
            cleanPlayer1: () => sanitizeModule.sanitizeInput(_dirtyPlayer1),
            cleanPlayer2: () => sanitizeModule.sanitizeInput(_dirtyPlayer2),
            getForm: () => queryMain('#form-container')
        }
        
    })();


    // Function to show the form, and hide the form 

    const formControl = (() => {
        // Function to show the form for names
        const showForm = () => {
            const form = domHelpers.getForm();
            form.classList.add('active');
            form.style.opacity = 1;
            const player2Input = form.querySelector('.get-player2-name-input');
            player2Input.style.opacity = (domHelpers.getRadioValue() !== 'player2') ? 0 : 1;
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

    const validationModule = (() => {
        const radioValue = domHelpers.getRadioValue();
        const _isValidNameInput = (input) => {            
            return input && input.length >= 1 && input.length <= 10 && /^[a-zA-Z0-9!@#$%^&*()_+,\-./:;<=>?@[\]^_`{|}~]+$/.test(input);
        };
        const _validatePlayerName = (input) => {
            if (radioValue !== 'player2' || _isValidNameInput(input)) {
                return true;
            } else {
                return false;
            }
        }
        const validPlayer1 = () => _validatePlayerName(domHelpers.cleanPlayer1());
        const validPlayer2 = () => _validatePlayerName(domHelpers.cleanPlayer2());
        return { validPlayer1, validPlayer2 } 
    })();

    console.log(domHelpers.cleanPlayer1())
    console.log(validationModule.validPlayer1())

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
                    default: aiName = "Player 2"; break;
                }
                player2Name.textContent = aiName;
        }

        const renderPlayerInfo = () => {
            if (validationModule.validPlayer1() === false || validationModule.validPlayer2() === false) {
                player1Input.placeholder = "REQUIRED";
                player2Input.placeholder = "REQUIRED";
            } else if (validationModule.validPlayer1() === true || validationModule.validPlayer2() === true) {
                player1Name.textContent = player1Input;
                if (domHelpers.getRadioValue() === 'player2') {
                    player2Name.textContent = player2Input;
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

    const playerModule = (() => {
        const createPlayer = (name, symbol) => {
            let score = 0;
            return {
                name,
                symbol,
                makeMove: (dataIndex, gameBoard) => {
                    if (gameBoard[dataIndex] === null) {
                        gameBoard[dataIndex] = symbol;
                        return true;
                    }
                    return false;
                }
            }
        }
    
        const createAI = (score) => {

        }   
        return {
            createPlayer,
            createAI
        }
    })(); 
    
    // This will be a module that will contain the gameBoard
    const boardModule = (() => {
        const gameContainer = domElements.mainElement.querySelector('#game-container');
        // Clear game board            

        const _clearBoard = () => {
            gameContainer.innerHTML = '';
        };

        const createBoard = () => {
            _clearBoard();               
            // Loop to create the rows
            for (let i = 0; i < 9; i++) {
                const gridItem = document.createElement('div');
                gridItem.classList.add('grid-item');
                gridItem.setAttribute('data-index', i);
                gameContainer.appendChild(gridItem);
            }
            const addBoardListener = () => {
                
            }
        }      
        // Return it so I can call it later
        return { createBoard };
    })();

    // This module will contain game information
    const gameModule = (() => {
        let player1 = null;
        let player2 = null;
        const gameContainer = domElements.mainElement.querySelector('#game-container');

        const initializePlayers = (player1Name, player2Name) => {
            player1 = playerModule.createPlayer(domHelpers.cleanPlayer1(), "X", 0);
            if (domHelpers.getRadioValue() === 'player2') {
                //TODO
            } else {
                player2 = playerModule.createPlayer(domHelpers.cleanPlayer2(), "O", 0);
            }
        }

        const getPlayer1 = () => player1;
        const getPlayer2 = () => player2;

        let board = Array(9).fill(null);
        let currentPlayer = player1;
        
        const initilizeBoardListeners = () => {
            board
            gameContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('grid-item')) {
                    const dataIndex = e.target.getAttribute('data-index');
                    if (currentPlayer === player1) {
                        player1.makeMove(dataIndex);
                        switchPlayer();
                    } else {
                        player2.makeMove(dataIndex);
                        switchPlayer();
                    }
                }
            });
        }

        const setBoard = (gridItem) => {
            if (player1.makeMove === true || player2.makeMove === true) {
                gridItem[dataIndex].innerHTML = symbol;
            }
        };

        const switchPlayer = () => {
            currentPlayer = currentPlayer === player1 ? player2 : player1;
            
        }

        const checkWin = () => {
            //TODO
        }

        const checktie = () => {
            //TODO
        }

        const resetGame = () => {
         //TODO

        }

        return {
            initializePlayers,
            board,
            getPlayer1,
            getPlayer2,
            initilizeBoardListeners,
            setBoard,
            switchPlayer,
            checkWin,
            checktie,
            resetGame,
            currentPlayer
        }
    })();

    const eventListenerModule = (() => {
        const initializeEventListeners = () => {
            const newGameBtn = domElements.mainElement.querySelector('#new-game-btn');
            newGameBtn.addEventListener('click', formControl.showForm);            

            const radioButtons = domElements.mainElement.querySelectorAll('[name="radio"]');
            radioButtons.forEach(radio => {
                radio.addEventListener('change', () => {
                    renderModule.updatePlayer2Name();
                    radio.bind(formControl.hideForm());
                });
            });
        } 
        return { initializeEventListeners }; 
    })();
     
    const displayModule = (() => {
        const displayBtn = domElements.mainElement.querySelector('.confirm-name-btn');    
            const displayListener = (() => { 
                displayBtn.addEventListener('click', (e) => {             
                    e.preventDefault();
                    if (validationModule.validPlayer1() && 
                        validationModule.validPlayer2()) {
                            formControl.hideForm(); 
                            boardModule.createBoard();
                            gameModule.initializePlayers();
                            gameModule.initilizeBoardListeners();
                            const currentPlayer1 = gameModule.getPlayer1();
                            const currentPlayer2 = gameModule.getPlayer2();
                        } 
                    renderModule.renderPlayerInfo();
                });
            })();   
    })();

    eventListenerModule.initializeEventListeners();
});