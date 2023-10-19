document.addEventListener('DOMContentLoaded', () => {

  // This will get dom elements one time
  const domElements = {
      mainElement: document.getElementById('main')
  };
  // Get all helpers value here so I don't need to type querySelector as much
  const domHelpers = (() => {
      const queryMain = (selector) => document.getElementById('main').querySelector(selector);
      const resetBtn = () => queryMain('#reset-button');
      return {
          getRadioValue: () => queryMain('#radio').value, resetBtn
      }
      
  })();

  // Creates players displays, and shows their names and score
  const renderModule = (() => {
      const winnerBanner = domElements.mainElement.querySelector('#winner-banner');
      const winnerText = domElements.mainElement.querySelector('#winner-text');

      const showWinnerIcon = (winnerSymbol) => {
          let winnerName = '';
          if (gameModule.getPlayer1().symbol === winnerSymbol) {
              winnerName = winnerSymbol;
          } else if (gameModule.getPlayer2().symbol === winnerSymbol) {
              winnerName = gameModule.getPlayer2().symbol;
          }
          // Update banner with winner's symbol
          winnerText.textContent = `${winnerName} wins!`
          // Add active to display banner
          winnerBanner.classList.add('active');
      }
      const showTieIcon = () => {
        winnerText.textContent = "Its a draw!";
        winnerBanner.classList.add('active');
      };
      const hideWinnerIcon = () => {
        winnerBanner.classList.remove('active');
      }
      return {
          showWinnerIcon,
          showTieIcon,
          hideWinnerIcon
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
              makeMove: (dataIndex, gameBoard) => {
                if (gameModule.isGameOver === true) {
                    return false;
                }
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
              console.log("I am executing");
              let randomIndex;
              do {
                  randomIndex = Math.floor(Math.random() * 9);
              } while (!player.makeMove(randomIndex, gameBoard));
              const gridItem = gridItems[randomIndex];

              gameModule.setBoard(gridItem, player.symbol); 
      }
      
      // Initialize count here so that it won't reset to 1.
      let count = 1;
      const normalAI = (player, board) => {
        if (count % 2) {
            easyAI(player, board);
            console.log('ez')
            count++;
        } else {
            hardAI(player, board);
            console.log('hard')
            count++;
        }
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
                  
                  if (moveVal > bestVal) {
                        bestMove = i;
                        bestVal = moveVal;
                    }
                  tempBoard[i] = null;
                  
              }
          }
          if (bestMove !== -1) {
            let tempBoard = [...board];  // Use tempBoard to simulate the move
            player.makeMove(bestMove, tempBoard);
            if (!gameModule.checkWin(tempBoard)) {
              gameModule.checkTie(tempBoard);
            }
            // Then make the actual move
            player.makeMove(bestMove, board);
            const gridItems = boardModule.getGridItems();
            const gridItem = gridItems[bestMove];
            gameModule.setBoard(gridItem, player.symbol);
          }           
      };

      return {
          easyAI,
          normalAI,
          hardAI,
          createPlayer
      }
  })();

  const minMaxModule = (() => {
      const minimax = (board, depth, maximizing, playerSymbol, opponentSymbol) => {
          const score = gameModule.evaluateBoard(board);
          const availableCells = boardModule.getEmptyGridCells(board);
          const tempBoard = [...board];
          
          if (score !== null) {
            return score - depth;
          }

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
      // Flags to protect game logic
      let isGameOver = false;
      let isAITurn = false; 



      const initializePlayers = () => {
            player1 = playerAICreation.createPlayer(player1, 'X', 0);
          switch (difficulty) {
              case 'player2': player2 = playerAICreation.createPlayer(player2, 'O', 0); break;
              case 'easy': player2 = playerAICreation.createPlayer('Locke', 'O', 0); break;
              case 'normal': player2 = playerAICreation.createPlayer('Tom', 'O', 0); break;
              case 'hard': player2 = playerAICreation.createPlayer('John', 'O', 0); break;
              default: break;
          }
          currentPlayer = player1;

      }           
       console.log(domHelpers.getRadioValue());

      const getPlayer1 = () => player1;
      const getPlayer2 = () => player2;

      let board = Array(9).fill(null);

      const initilizeBoardListeners = () => {
          gameContainer.addEventListener('click', (e) => {
              if (e.target.classList.contains('grid-item')) {
                  if (isAITurn === true) {
                    return;
                  }
                  const dataIndex = e.target.getAttribute('data-index');
                  console.log('currentPlayer:', currentPlayer);
                  console.log('dataIndex:', dataIndex);
                  console.log('board:', board);
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
          if (isAITurn) return; // Prevent switch if it's AI's turn
          difficulty = domHelpers.getRadioValue();
          currentPlayer = currentPlayer === player1 ? player2 : player1;

          
          if (currentPlayer === player2 && difficulty !== 'player2') {
              isAITurn = true;
              executeAI(currentPlayer, currentPlayer, board, difficulty);
              // if (!checkWin(board)) {
              //     checkTie(board);
              // }
          }
      }

      const executeAI = (currentPlayer, player, gameBoard, difficulty) => {
          console.log("Board before AI move:", [...gameBoard]);  // Copy the array to prevent mutation during logging
          
          let tempBoard = [...gameBoard];
          setTimeout(() => {
              console.log("Executing AI of difficulty:", difficulty);  // Debugging line
              switch(difficulty) {
                  case 'easy':
                      playerAICreation.easyAI(player, gameBoard);
                      break;
                  case 'normal':
                    playerAICreation.normalAI(currentPlayer, gameBoard);
                      break;
                  case 'hard':
                      playerAICreation.hardAI(currentPlayer, gameBoard);
                      break;
                  // Other cases for 'normal' and 'hard' will come here later
              }
              if (!gameModule.checkWin(tempBoard)) {
                gameModule.checkTie(tempBoard);
              }
              isAITurn = false;
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

      const evaluateBoard = (board) => {
        // Check for win
        for (let i = 0; i < winIfMatched.length; i++) {
          const [a, b, c] = winIfMatched[i];
          if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a] === 'X' ? -10 : 10;
          }
        }
        
        // Check for tie
        if (board.every(cell => cell !== null)) {
          return 0;
        }
        
        // Game still in progress
        return null;
      };

      const checkWin = (gameBoard) => {
        for (let i = 0; i < winIfMatched.length; i++) {
            const [a, b, c] = winIfMatched[i];
            if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
                handleWin([a, b, c], gameBoard[a]); 
                return true;  // Someone won
            }
        }
        return false;  // No winner yet
    };
      
      const handleWin = (winningSequence, winnerSymbol) => {
          const gameContainer = domElements.mainElement.querySelector('#game-container');
          const winningCells = winningSequence.map(index => gameContainer.childNodes[index]);
      
          winningCells.forEach(cell => {
              cell.style.backgroundColor = 'green';
          });
      
          endGame(true, winnerSymbol);
          setTimeout(() => {
              renderModule.showWinnerIcon(winnerSymbol);
          }, 1000);
      }
      const checkTie = (gameBoard) => {
        if (gameBoard.every(cell => cell !== null)) {
            handleTie();
            return true;  // It's a tie
        }
        return false;  // No tie
    };
      const handleTie = () => {
        endGame(false);
        renderModule.showTieIcon();
        return true;
      }


      const endGame = (isWin, winnerSymbol = null) => {
        isGameOver = true;
          if (isWin) {
              const winner = winnerSymbol === player1.symbol ? player1 : player2;
              return true;
          } else if (checkTie) {
              console.log('Its a draw');
              return false;
          }
      }

      const resetGame = () => {
        //Reset game over
        isGameOver = false;
        // reset the board array
        gameBoard = Array(9).fill(null);
        // update the DOM
        boardModule.createBoard();
        renderModule.hideWinnerIcon();
    };

      return {
          initializePlayers,
          board,
          getPlayer1,
          getPlayer2,
          initilizeBoardListeners,
          setBoard,
          evaluateBoard,
          switchPlayer,
          checkWin,
          checkTie,
          resetGame,
          currentPlayer,
          get isGameOver() { return isGameOver; },
      }
  })();

  const eventListenerModule = (() => {
    const resetBtnListener = () => {
        domHelpers.resetBtn().addEventListener('click', function() {
            gameModule.resetGame();
            domHelpers.resetBtn.classList.remove('active');
        });
    };

    const initializeEventListeners = () => {
        const radioButtons = domElements.mainElement.querySelectorAll('[name="radio"]');
        radioButtons.forEach(radio => {
            radio.addEventListener('change', () => {
                difficulty = domHelpers.getRadioValue();
                console.log(domHelpers.getRadioValue());
            });
        });
        resetBtnListener(); 
    };
  
        return { initializeEventListeners, resetBtnListener }; 
    })();

    const displayModule = (() => {
        const newGameBtn = domElements.mainElement.querySelector('#new-game-btn');
        const displayListener = () => { 
            newGameBtn.addEventListener('click', (e) => {             
                e.preventDefault();
                boardModule.createBoard();
                gameModule.initializePlayers();
                gameModule.initilizeBoardListeners();
            });
        };
    
        return { displayListener }
    })();

    displayModule.displayListener();
    eventListenerModule.initializeEventListeners();
});