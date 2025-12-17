import player from "./player";
import computerPlayer from "./computer-player";
import ship from "./ship";
import * as ui from "./ui";


let gameMode = null;
let player1 = null;
let player2 = null;
let currentPlayer = null;
let gameOver = false;

const standardFleet = [
    { name: 'Carrier', length: 5 },
    { name: 'Battleship', length: 4 },
    { name: 'Destroyer', length: 3 },
    { name: 'Submarine', length: 3 },
    { name: 'Patrol Boat', length: 2 },
];

let currentShipIndex = 0;
let currentOrientation = 'horizontal';

export function init() {
    ui.displayMessage('Welcome to Battleship!');

    document.getElementById('pvc-btn').addEventListener('click', () => selectMode('PvC'));
    document.getElementById('pvp-btn').addEventListener('click', () => selectMode('PvP'));
    document.getElementById('rotate-btn').addEventListener('click', toggleOrientation);
    document.getElementById('start-placement-btn').addEventListener('click', handleNameEntry);
    document.getElementById('end-turn-btn').addEventListener('click', () => {
        ui.hide('end-turn-btn');
        switchTurnsPvP();
});
}

function selectMode(mode) {
    gameMode = mode;
    if (gameMode === 'PvC') {
        const parentNode = document.getElementById('name-screen');
        const child1 = document.getElementById('name-label-2');
        const child2 = document.getElementById('player2-name-input');
        const toBeAltered = document.getElementById('name-label-1');

        parentNode.removeChild(child1);
        parentNode.removeChild(child2);
        toBeAltered.textContent = 'Player Name:';
        ui.displayMessage(`Mode selected: ${mode} - Enter Player name`);
        ui.hide('setup-screen');
        ui.show('name-screen');
    }
    ui.hide('setup-screen');
    ui.show('name-screen');
    ui.displayMessage(`Mode selected: ${mode} - Enter Player names`);
}

function handleNameEntry() {
    const name1Input = document.getElementById('player1-name-input');
    const name1 = name1Input.value || 'Player 1';

    if (!player1 && gameMode === 'PvC') {
        player1 = player(name1, 1);
        player2 = computerPlayer('CPU', 2);
        ui.hide('name-screen');
        ui.show('game-screen');
        ui.updatePlayerNames(player1.name, player2.name);
        beginPlacementPhase(player1);
    } else if (!player1 && gameMode === 'PvP') {
        const name2Input = document.getElementById('player2-name-input');
        const name2 = name2Input.value || 'Player 2';
        player1 = player(name1, 1);
        player2 = player(name2, 2);
        ui.hide('name-screen');
        ui.show('game-screen');
        ui.updatePlayerNames(player1.name, player2.name);
        beginPlacementPhase(player1);
    }
}


function beginPlacementPhase(player) {
    currentPlayer = player;
    const opponent = (player === player1) ? player2 : player1;
    currentShipIndex = 0;

    ui.displayMessage(`${player.name}: Place your ${standardFleet[currentShipIndex].name}`);
    console.log(`${player.id}`)
    ui.renderPlayerBoard(`player${player.id}-board`, player.board, handlePlacementClick, true);
    ui.renderPlayerBoard(`player${opponent.id}-board`, opponent.board, null, false);
}

function toggleOrientation() {
    currentOrientation = (currentOrientation === 'horizontal') ? 'vertical' : 'horizontal';
    document.getElementById('rotate-btn').textContent = `Rotate: ${currentOrientation.toUpperCase()}`;
}

function handlePlacementClick(e) {
    if (gameOver) return;

    const x = +e.target.dataset.x;
    const y = +e.target.dataset.y;
    const shipData = standardFleet[currentShipIndex];
    const newShip = ship(shipData.length);

    try {
        currentPlayer.board.placeShip(newShip, [x, y], currentOrientation);
        currentShipIndex++;
        ui.renderPlayerBoard(`player${currentPlayer.id}-board`, currentPlayer.board, handlePlacementClick, true);
        if (currentShipIndex < standardFleet.length) {
            ui.displayMessage(`Place your ${standardFleet[currentShipIndex].name}`);
        } else {
            finishPlacement();
        }
    } catch (error) {
        ui.displayMessage("Invalid placement! Try again.");
    }
}

function finishPlacement() {
    if (gameMode === 'PvC') {
        player2.board.placeShipsRandomly(standardFleet);
        startGame();
    } else if (gameMode === 'PvP' && currentPlayer === player1) {
        ui.hideAllShips('player1-board', player1.board);
        ui.showPassDeviceScreen(player2.name, () => {
            beginPlacementPhase(player2);
        })
    } else if (gameMode === 'PvP' && currentPlayer === player2) {
        ui.hideAllShips('player2-board', player2.board);
        ui.showPassDeviceScreen(player1.name, () => {
            startGame();
        });
        
    }
}

function startGame() {
    ui.hide('placement-controls');
    gameOver = false;
    currentPlayer = player1;
    ui.highlightActivePlayer(1);
    ui.displayMessage(`${player1.name}'s turn to attack`);
    ui.renderPlayerBoard('player1-board', player1.board, null, true);
    ui.renderPlayerBoard('player2-board', player2.board, handleAttackClick, false);
}

function switchTurnsPvP() {
    const nextPlayer = (currentPlayer === player1) ? player2 : player1;
    const nextPlayerBoardId = (nextPlayer === player1) ? 'player1-board' : 'player2-board';
    const opponentBoardId = (nextPlayer === player1) ? 'player2-board' : 'player1-board';
    ui.renderPlayerBoard(`player${currentPlayer.id}-board`, currentPlayer.board, null, false);

    ui.showPassDeviceScreen(nextPlayer.name, () => {
        // 1. Update Game State
        currentPlayer = nextPlayer;

        // 2. Re-render Boards
        // Show current player their own ships (true)
        ui.renderPlayerBoard(nextPlayerBoardId, nextPlayer.board, null, true);
        
        // Show current player the opponent's board with hidden ships (false)
        ui.renderPlayerBoard(opponentBoardId, (nextPlayer === player1 ? player2 : player1).board, handleAttackClick, false);

        // 3. Update UI Labels
        ui.highlightActivePlayer(currentPlayer === player1 ? 1 : 2);
        ui.displayMessage(`${currentPlayer.name}'s turn to attack!`);
    });
}

function handleAttackClick(e) {
    const x = +e.target.dataset.x;
    const y = +e.target.dataset.y;
    if (gameOver) return;
    console.log([x, y]);

    if (gameMode === 'PvC') {
        if (currentPlayer !== player1) return;

        player1.attack(player2.board, [x, y]);
        
        ui.renderPlayerBoard('player2-board', player2.board, handleAttackClick, false);

        if (player2.board.allShipsSunk()) {
            endGame(player1.name);
        } else {
            switchCurrentPlayer();
            ui.highlightActivePlayer(2);
            ui.displayMessage("Computer is thinking...");
            setTimeout(computerTurn, 800);
        }
    } else {
        if (currentPlayer === player1) {
            
            player1.attack(player2.board, [x, y]);
            ui.renderPlayerBoard('player2-board', player2.board, null, false);
            if (player2.board.allShipsSunk()) {
                endGame(player1.name);
            }
            ui.show('end-turn-btn');
        } else {
            
            player2.attack(player1.board, [x, y]);
            ui.renderPlayerBoard('player1-board', player1.board, null, false);
            if (player1.board.allShipsSunk()) {
                endGame(player2.name);
            }
            ui.show('end-turn-btn');
        }
    }
}

const switchCurrentPlayer = () => {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
}

const computerTurn = () => {
    if (gameOver) return;
    
    player2.makeRandomAttack(player1.board);

    ui.renderPlayerBoard('player1-board', player1.board, null, true);

    if (player1.board.allShipsSunk()) {
        endGame(player2.name);
    } else {
        switchCurrentPlayer();
        ui.highlightActivePlayer(1);
        ui.displayMessage(`Your turn, ${player1.name}`);
    }
}



