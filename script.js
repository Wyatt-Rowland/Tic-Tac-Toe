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
            cleanPlayer1: () => sanitizeModule.sanitizeInput(_dirtyPlayer1()),
            cleanPlayer2: () => sanitizeModule.sanitizeInput(_dirtyPlayer2()),
            getForm: () => queryMain('#form-container')
        }
        
    })();


    // Function to show the form, and hide the form 

    const formControl = (() => {
        // Function to show the form for names
        const showForm = () => {
            const form = domHelpers.getForm();
            form.classList.add('active');
            const player2Input = form.querySelector('.get-player2-name-input');
            player2Input.style.opacity = (domHelpers.getRadioValue() !== 'player2') ? 0 : 1;
        }
        // Function to hide form
        const hideForm = () => {
            let form = domHelpers.getForm();
            form.classList.remove('active');
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
        const validPlayer2 = () => {
            if (radioValue !== 'player2') {
                return true
            }
            return _validatePlayerName(domHelpers.cleanPlayer2()); 
        }        

        return { validPlayer1, validPlayer2 } 
    })();

    // Creates players displays, and shows their names and score
    const renderModule = (() => {
        const player1Name = domElements.mainElement.querySelector('#player1-name');
        const player2Name = domElements.mainElement.querySelector('#player2-ai-name');
        const player1Input = domElements.mainElement.querySelector('.get-player1-name-input');
        const player2Input = domElements.mainElement.querySelector('.get-player2-name-input');
        const winnerBanner = domElements.mainElement.querySelector('#winner-banner');
        const winnerText = domElements.mainElement.querySelector('#winner-text');

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
                player1Name.textContent = domHelpers.cleanPlayer1();
                if (domHelpers.getRadioValue() === 'player2') {
                    player2Name.textContent = domHelpers.cleanPlayer2();
                } 
            } 
        };

        const showWinnerIcon = (winnerSymbol) => {
            let winnerName = '';
            if (gameModule.getPlayer1().symbol === winnerSymbol) {
                winnerName = gameModule.getPlayer1().name;
            } else if (gameModule.getPlayer2().symbol === winnerSymbol) {
                winnerName = gameModule.getPlayer2().name;
            }
            // Update banner with winner's name
            winnerText.textContent = `${winnerName} wins!`
            // Add active to display banner
            winnerBanner.classList.add('active');
        }

        
        const updateScores = (winner, loser) => {

        }

        return {
            renderPlayerInfo,
            updateScores,
            updatePlayer2Name, 
            showWinnerIcon
        }
        
        
    })();


    
    // This will be a module that will contain the gameBoard
    const boardModule = (() => {
        const gameContainer = domElements.mainElement.querySelector('#game-container');
        let gridItems = [];
        // Clear game board            
        const _clearBoard = () => {
            gameContainer.innerHTML = '';
        };

        const createBoard = () => {
            _clearBoard();      
            gridItems.length = 0;         
            // Loop to create the rows
            for (let i = 0; i < 9; i++) {
                const gridItem = document.createElement('div');
                gridItem.classList.add('grid-item', 'inactive');
                gridItem.setAttribute('data-index', i);
                gameContainer.appendChild(gridItem);
                gridItems.push(gridItem);
                gridItem.innerHTML = '1';
            }
        } 

        const getGridItems = () => {
            return gridItems;
        }
        const getEmptyGridCells = (currentBoard) => {
            return currentBoard.map((cell, idx) => (cell === null) ? idx : null).filter(idx => idx !== null);
        }

        return { createBoard, getGridItems, getEmptyGridCells };
    })();


    const playerAICreation = (() => {
           // Create Player Factory Function
        const createPlayer = (name = 'Anonymous', symbol = 'X') => {
            let score = 0;
            return {
                name,
                symbol,
                score,
                makeMove: (dataIndex, gameBoard) => {
                    if (gameBoard[dataIndex] === null) {
                        gameBoard[dataIndex] = symbol;
                        return true; // move successful
                    }
                    return false; //move failed, spot occupied
                }
            }
        }

        let gridItems = boardModule.getGridItems();
        let lastRandomIndex;
        // If no player 2, use this for easy AI
        const easyAI = (player, gameBoard) => {
            setTimeout(() => {
                console.log("I am executing");
                let randomIndex;
                do {
                    randomIndex = Math.floor(Math.random() * 9);
                } while (!player.makeMove(randomIndex, gameBoard));
                const gridItem = gridItems[randomIndex];

                gameModule.setBoard(gridItem, player.symbol);
            }, 1000);   
        }
        const hardAI = (player, board) => {
            // Ensure the board and player are defined
            if (!board || !player) {
                console.error("Board or player not defined");
                return;
            }
            const emptyCells = boardModule.getEmptyGridCells(board);
            console.log("Available empty cells for AI:", emptyCells);

            let playerSymbol = player.symbol;
            let opponentSymbol = playerSymbol === 'X' ? 'O' : 'X';

            let bestVal = -Infinity;
            let bestMove = -1;

            for (let i = 0; i < 9; i++) {
                if (board[i] === null) {
                    // Use a tempBoard for simulation
                    let tempBoard = [...board];

                    tempBoard[i] = playerSymbol;
                    let moveVal = minMaxModule.minimax(tempBoard, 0, false, player.symbol, opponentSymbol);
                    console.log(`Move Value for index ${i}: ${moveVal}`);

                    tempBoard[i] = null;

                    if (moveVal > bestVal) {
                        bestMove = i;
                        bestVal = moveVal;
                    }
                }
            }
            if (bestMove !== -1) {
                // Use the actual board to make the move. 
                player.makeMove(bestMove, board);
                const gridItems = boardModule.getGridItems();  // Assuming you have this function
                const gridItem = gridItems[bestMove];
                gameModule.setBoard(gridItem, player.symbol);
                console.log("AI chose index:", bestMove);

            }        
        };

        return {
            easyAI,
            hardAI,
            createPlayer
        }
    })();

    const minMaxModule = (() => {
        const minimax = (board, depth, maximizing, playerSymbol, opponentSymbol) => {
            const score = gameModule.checkWin(board);
            const availableCells = boardModule.getEmptyGridCells(board);
            let tempBoard = [...board];
    
            if (score === 10) return score - depth;
            if (score === -10) return score + depth;
            
            if (gameModule.checkTie(board)) return 0;
    
            if (maximizing) {
                let best = -Infinity;
                for (let i = 0; i < availableCells.length; i++) {
                    let cellIndex = availableCells[i];
                    tempBoard[cellIndex] = playerSymbol;
                    best = Math.max(best, minimax(tempBoard, depth + 1, false, playerSymbol, opponentSymbol));
                    tempBoard[cellIndex] = null;
                }
                return best;
            } else {
                let best = Infinity;
                for (let i = 0; i < availableCells.length; i++) {
                    let cellIndex = availableCells[i];
                    tempBoard[cellIndex] = opponentSymbol;
                    best = Math.min(best, minimax(tempBoard, depth + 1, true, playerSymbol, opponentSymbol));
                    tempBoard[cellIndex] = null;
                }
                return best;
            }
        }
        return { minimax };
    })();
     

    // This module will contain game information
    const gameModule = (() => {
        let player1 = null;
        let player2 = null;
        let currentPlayer = null;
        const gameContainer = domElements.mainElement.querySelector('#game-container');
        let difficulty = domHelpers.getRadioValue();

        const initializePlayers = () => {
            player1 = playerAICreation.createPlayer(domHelpers.cleanPlayer1(), "X", 0);
            switch (difficulty) {
                case 'player2': player2 = playerAICreation.createPlayer(domHelpers.cleanPlayer2(), 'O', 0); break;
                case 'easy': player2 = playerAICreation.createPlayer('Locke', 'O', 0); break;
                case 'normal': player2 = playerAICreation.createPlayer('Tom', 'O', 0); break;
                case 'hard': player2 = playerAICreation.createPlayer('John', 'O', 0); break;
                default: break;
            }
            currentPlayer = player1;

        }           
         console.log(domHelpers.getRadioValue());//////
         /////
         ////
         /////
                        //////THIS IS MY ISSUE, I need to address this tomorrow. 
         /////
         /////


        const getPlayer1 = () => player1;
        const getPlayer2 = () => player2;

        let board = Array(9).fill(null);

        const initilizeBoardListeners = () => {
            gameContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('grid-item')) {
                    const dataIndex = e.target.getAttribute('data-index');
                    const moveSuccess = currentPlayer.makeMove(dataIndex, board);
                    if (moveSuccess) {
                        setBoard(e.target, currentPlayer.symbol);
                        if (!checkWin(board)) {
                            checkTie(board);
                        }
                        switchPlayer();
                    }
                }
            });
        }

        // const setBoard = (gridItem, symbol) => {
        //     gridItem.innerHTML = symbol;
        //     gridItem.classList.remove('inactive');
        // };
        const setBoard = (gridItem, symbol) => {
            if (!gridItem) {
                console.log("Grid Item is Undefined");
                return;
            }
            gridItem.classList.remove('inactive');
            gridItem.innerHTML = '';
        
            if (symbol === 'X') {
                const xSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                xSvg.setAttribute("viewBox", "0 0 100 100");
                xSvg.classList.add("symbol");
        
                const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line1.setAttribute("x1", "10");
                line1.setAttribute("y1", "10");
                line1.setAttribute("x2", "90");
                line1.setAttribute("y2", "90");
                line1.setAttribute("stroke", "black");
                line1.setAttribute("stroke-width", "8");
                // line1.classList.add("handwritten");                
                line1.classList.add("handwritten-line1");

        
                const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line2.setAttribute("x1", "90");
                line2.setAttribute("y1", "10");
                line2.setAttribute("x2", "10");
                line2.setAttribute("y2", "90");
                line2.setAttribute("stroke", "black");
                line2.setAttribute("stroke-width", "8");
                // line2.classList.add("handwritten");
                line2.classList.add("handwritten-line2");

        
                xSvg.appendChild(line1);
                xSvg.appendChild(line2);
                gridItem.appendChild(xSvg);
            } else {
                const oSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                oSvg.setAttribute("viewBox", "0 0 100 100");
                oSvg.classList.add("symbol");
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", "M 50,50 m -45,0 a 45,45 0 1,0 90,0 a 45,45 0 1,0 -90,0");
                path.setAttribute("stroke", "black");
                path.setAttribute("stroke-width", "8");
                path.setAttribute("fill", "none");
                path.classList.add("handwritten");

                oSvg.appendChild(path);
                // oSvg.appendChild(circle);

                gridItem.appendChild(oSvg);
            }
        };

        const switchPlayer = () => {
            difficulty = domHelpers.getRadioValue();
            currentPlayer = currentPlayer === player1 ? player2 : player1;
            console.log(`Current player is ${currentPlayer.name} with symbol ${currentPlayer.symbol}`);  // Debugging line

            
            if (currentPlayer === player2 && difficulty !== 'player2') {
                executeAI(currentPlayer, currentPlayer, board, difficulty);
                // if (!checkWin(board)) {
                //     checkTie(board);
                // }
            }
        }
 
        const executeAI = (currentPlayer, player, gameBoard, difficulty) => {
            console.log("Board before AI move:", [...gameBoard]);  // Copy the array to prevent mutation during logging

            setTimeout(() => {
                console.log("Executing AI of difficulty:", difficulty);  // Debugging line
                switch(difficulty) {
                    case 'easy':
                        playerAICreation.easyAI(player, gameBoard);
                        break;
                    case 'normal':
                        break;
                    case 'hard':
                        playerAICreation.hardAI(currentPlayer, gameBoard);
                        break;
                    // Other cases for 'normal' and 'hard' will come here later
                }
                switchPlayer();
            }, 500);
        }


        const winIfMatched = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8], 
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ]

        const checkWin = (gameBoard) => {
            for (let i = 0; i < winIfMatched.length; i++) {
                const [a, b, c] = winIfMatched[i];
                if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
                    handleWin([a, b, c], gameBoard[a]); 
                    if (gameBoard[a] === 'X') {
                        return -10;
                    } else {
                        return 10;
                    }
                }
            }
            return 0;
        }
        
        const handleWin = (winningSequence, winnerSymbol) => {
            const gameContainer = domElements.mainElement.querySelector('#game-container');
            const winningCells = winningSequence.map(index => gameContainer.childNodes[index]);
        
            // winningCells.forEach(cell => {
            //     cell.style.backgroundColor = 'green';
            // });
        
            endGame(true, winnerSymbol);
            // setTimeout(() => {
            //     renderModule.showWinnerIcon(winnerSymbol);
            // }, 1000);
        }
        const checkTie = (gameBoard) => {
            // if (!checkWin(gameBoard) && gameBoard.every(cell => cell != null)) {
            //     endGame(false);
            //     return true;
            // }
            // return false;
        };

        
        const endGame = (isWin, winnerSymbol = null) => {
            if (isWin) {
                const winner = winnerSymbol === player1.symbol ? player1 : player2;
                winner.score++;
                return true;
            } else {
                console.log('Its a draw');
                return false;
            }
        }

        const resetGame = () => {
         
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
            checkTie,
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
                    difficulty = domHelpers.getRadioValue();
                    renderModule.updatePlayer2Name();
                    formControl.hideForm();
                    console.log(domHelpers.getRadioValue());//////

                });
            });
        } 
        return { initializeEventListeners }; 
    })();


    const displayModule = (() => {
        const displayBtn = domElements.mainElement.querySelector('.confirm-name-btn');    
            const displayListener = () => { 
                displayBtn.addEventListener('click', (e) => {             
                    e.preventDefault();
                    if (validationModule.validPlayer1() === true) {
                            if (domHelpers.getRadioValue() !== 'player2' || validationModule.validPlayer2() === true) {
                                formControl.hideForm(); 
                                boardModule.createBoard();
                                gameModule.initializePlayers();
                                gameModule.initilizeBoardListeners();
                                renderModule.renderPlayerInfo();
                            }
                        } 
                });
            };   
        return { displayListener }
    })();
    displayModule.displayListener();
    eventListenerModule.initializeEventListeners();
}); 