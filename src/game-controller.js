import player from "./player";
import computerPlayer from "./computer-player";
import * as ui from "./ui";

let activePlayer;
let opponent;
let gameOver = false;

const switchTurns = () => {
    [activePlayer, opponent] = [opponent, activePlayer];
    ui.displayMessage(`${activePlayer.name}'s Turn`);
}

const checkWin = () => {
    if (opponent.board.allShipsSunk()) {
        gameOver = true;
        ui.displayMessage(`${activePlayer.name} has won the battle!`);
        return true;
    }
    return false;
}

export const initGame = () => {
    const player1 = player('Human', 1);
    const player2 = computerPlayer('Computer', 2, true);
    activePlayer = player1;
    opponent = player2;

    const standardFleet = [
        { name: 'Carrier', length: 5 },
        { name: 'Battleship', length: 4 },
        { name: 'Cruiser', length: 3 },
        { name: 'Submarine', length: 3 },
        { name: 'Destroyer', length: 2 },
    ];

    player1.board.placeShipsRandomly(standardFleet);
    player2.board.placeShipsRandomly(standardFleet);

    ui.initializeBoardsVersusPC(player1, player2, handleCellClick);
}

const handleCellClick = (e) => {
    if (activePlayer.isComputer || gameOver) return;
    
    const x = +e.target.dataset.x;
    const y = +e.target.dataset.y;

    const result = activePlayer.attack(opponent.board, [x, y]);
    if (result) {
        ui.updateCellVisual(opponent.id === 1 ? 'player1-board' : 'player2-board', x, y, result);

        if (checkWin()) return;
        
        switchTurns();

        if (activePlayer.isComputer) {
            setTimeout(computerTurn, 600);
        }
    }
}

const computerTurn = () => {
    const {x, y, result} = activePlayer.makeRandomAttack(opponent.board);

    ui.updateCellVisual('player1-board', x, y, result);

    if (checkWin()) return;

    switchTurns();
}



