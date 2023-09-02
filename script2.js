// Model Section: Holds data, logic, and rules of the application
const Model = (() => {
    const gameBoard = Array(9).fill(null);
    
    const isValidNameInput = (input) => {
      return input && input.length >= 1 && input.length <= 10 && /^[a-zA-Z0-9!@#$%^&*()_+,\-./:;<=>?@[\]^_`{|}~]+$/.test(input);
    };
  
    const createPlayer = (name = 'Anonymous', symbol = 'X') => {
      return { name, symbol };
    };
  
    const switchPlayer = () => {
        Model.currentPlayer = (Model.currentPlayer.symbol === 'X') ? Model.players.player2 : Model.players.player1;
    };
    
    const players = {
      player1: null,
      player2: null
    };
  
    return { isValidNameInput, createPlayer, gameBoard, players, switchPlayer, currentPlayer: null };
  })();
  
  // View Section: Handles everything related to the UI and display
  const View = (() => {
    const queryMain = selector => document.getElementById('main').querySelector(selector);
  
    const renderPlayerInfo = (validPlayer1, validPlayer2, cleanPlayer1, cleanPlayer2) => {
      if (!validPlayer1 || !validPlayer2) {
        queryMain('.get-player1-name-input').placeholder = "REQUIRED";
        queryMain('.get-player2-name-input').placeholder = "REQUIRED";
      } else {
        queryMain('#player1-name').textContent = cleanPlayer1;
        queryMain('#player2-ai-name').textContent = cleanPlayer2;
      }
    };
  
    const createBoard = () => {
      const gameContainer = queryMain('#game-container');
      gameContainer.innerHTML = ''; // Clear board
      for (let i = 0; i < 9; i++) {
        const gridItem = document.createElement('div');
        gridItem.classList.add('grid-item', 'inactive');
        gridItem.setAttribute('data-index', i);
        gridItem.textContent = "1";
        gameContainer.appendChild(gridItem);
      }
    };
  
    return { renderPlayerInfo, queryMain, createBoard };
  })();
  
  // Controller Section: Handles interaction between Model and View
  document.addEventListener('DOMContentLoaded', () => {
    const sanitizeInput = (input) => {
      const div = document.createElement('div');
      div.textContent = input;
      return div.innerHTML;
    };
  
    const form = View.queryMain('#form-container');
    form.addEventListener('click', (e) => {
      // TODO: Implement form click handling logic here
    });
  
    const newGameBtn = View.queryMain('#new-game-btn');
    newGameBtn.addEventListener('click', () => {
      form.classList.add('active');
    });
  
    const confirmNameBtn = View.queryMain('.confirm-name-btn');
    confirmNameBtn.addEventListener('click', (e) => {
      e.preventDefault();
  
      const dirtyPlayer1 = View.queryMain('.get-player1-name-input').value;
      const dirtyPlayer2 = View.queryMain('.get-player2-name-input').value;
  
      const cleanPlayer1 = sanitizeInput(dirtyPlayer1);
      const cleanPlayer2 = sanitizeInput(dirtyPlayer2);
  
      const validPlayer1 = Model.isValidNameInput(cleanPlayer1);
      const validPlayer2 = Model.isValidNameInput(cleanPlayer2);
  
      if (validPlayer1 && validPlayer2) {
        Model.players.player1 = Model.createPlayer(cleanPlayer1, 'X');
        Model.players.player2 = Model.createPlayer(cleanPlayer2, 'O');
        console.log("Player 1: ", Model.players.player1);  // Debugging line
        console.log("Player 2: ", Model.players.player2);  // Debugging line
        Model.currentPlayer = Model.players.player1;
        View.createBoard();
        form.classList.remove('active');
      }
  
      View.renderPlayerInfo(validPlayer1, validPlayer2, cleanPlayer1, cleanPlayer2);
    });
  
    const gameContainer = View.queryMain('#game-container');
    gameContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('grid-item')) {
        const dataIndex = e.target.getAttribute('data-index');
        const currentPlayer = Model.currentPlayer;
  
        if (Model.gameBoard[dataIndex] === null) {
          Model.gameBoard[dataIndex] = currentPlayer.symbol;
          e.target.textContent = currentPlayer.symbol;
          e.target.classList.remove('inactive');
          Model.switchPlayer();
        }
      }
    });
  });