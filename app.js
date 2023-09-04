const gameBoard = (function () {
    const board = new Array(9).fill(null);
    const players = {};
    let currentPlayer;

    const lines = [[0, 1, 2], [3, 4, 5], [6, 7, 8],
                   [0, 3, 6], [1, 4, 7], [2, 5, 8],
                   [0, 4, 8], [2, 4, 6]];

    function addPlayers(playerOne, playerTwo) {
        players.one = playerOne;
        players.two = playerTwo;
        currentPlayer = players.one;
        gameDisplay.update(board, currentPlayer);
    }

    function swapCurrentPlayer() {
        if (currentPlayer === players.one) {
            currentPlayer = players.two;
        } else {
            currentPlayer = players.one;
        }
    }

    function mark(x, y, player) {
        if (player != currentPlayer.name) { return false };

        let index = x + 3*y;
        if (board[index]) { return false };
        board[index] = currentPlayer.marker;

        let result = check();
        if (result) {
            gameDisplay.update(board, currentPlayer);
            gameDisplay.displayOutcome(result, currentPlayer);
        } else {
            swapCurrentPlayer();
            gameDisplay.update(board, currentPlayer);
        }

        return true;
    }

    function check() {
        for (const line of lines) {
            let x = line.map((i) => board[i]);
            if (x[0] == x[1] && x[0] == x[2] && x[0] != null) {
                return line;
            }
        }

        return Object.keys(board).some(k => board[k] == null) ? false : "draw";
    }

    function reset() {
        board.fill(null);
        currentPlayer = players.one;
        gameDisplay.reset();
        gameDisplay.update(board, currentPlayer);
    }

    return { addPlayers, mark, reset, board };
})();


const gameDisplay = (function () {
    const gameBoardCells = document.querySelectorAll('.game-board-cell');
    const turnDisplay = document.querySelector('.player-turn-display');

    const update = (board, player) => {
        turnDisplay.innerHTML = `It's ${player.name}'s turn!`;
        gameBoardCells.forEach((cell, i) => {
            cell.innerHTML = board[i];
            if (board[i]) {
                cell.classList.add(board[i]);
            }
        });
    }

    const displayOutcome = (cells, player) => {
        if (cells == 'draw') {
            turnDisplay.innerHTML = "Draw!";
        } else {
            turnDisplay.innerHTML = `${player.name} wins!`;
            gameBoardCells.forEach((cell) => {
                if (cells.includes(parseInt(cell.dataset.index))) {
                    cell.classList.add('win');
                }
            })
        }
    }

    const reset = () => {
        gameBoardCells.forEach((cell) => {
            cell.classList.remove('X', 'O', 'win')
        })
    }

    return { update, displayOutcome, reset }
})();


const Player = (name, marker) => {
    const makeMove = (x, y) => gameBoard.mark(x, y, name);

    return { name, marker, makeMove };
}

const Computer = (name, marker) => {
    const { makeMove } = Player(name, marker);

    const requestMove = (board) => {
        const availableCells = board.map((e, i) => e ? null : i).filter(i => i != null);
        const choice = availableCells[Math.floor(Math.random() * availableCells.length)];
        setTimeout(function() { makeMove(choice % 3, Math.floor(choice / 3), name)}, 500);
    }

    return { name, marker, requestMove };
}

const human = Player('Human', 'X');
const computer = Computer('Computer', 'O');

gameBoard.addPlayers(human, computer);

const cells = document.querySelectorAll('.game-board-cell');
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        let x = cell.dataset.index % 3;
        let y = Math.floor(cell.dataset.index / 3);
        human.makeMove(x, y);
        computer.requestMove(gameBoard.board)
    });
});

const resetButton = document.querySelector('.reset-button');
resetButton.addEventListener('click', gameBoard.reset);
