import player from "./player";
import computerPlayer from "./computer-player";
import ship from "./ship";
import * as ui from "./ui";


let gameMode = null;
let player1 = null;
let player2 = null;
let currentPlayer = null;
let gameOver = false;
let shipsPlaced = new Set();
let activeShipData = null;
let currentDomGrid = null;
let targetStack = [];
const computerShotMemory = createShotMap(10);

const standardFleet = [
    { name: 'Carrier', length: 5 },
    { name: 'Battleship', length: 4 },
    { name: 'Destroyer', length: 3 },
    { name: 'Submarine', length: 3 },
    { name: 'Patrol Boat', length: 2 },
    ];

export function init() {
    ui.displayMessage('Welcome to Battleship!');

    document.getElementById('pvc-btn').addEventListener('click', () => selectMode('PvC'));
    document.getElementById('pvp-btn').addEventListener('click', () => selectMode('PvP'));
    document.getElementById('start-placement-btn').addEventListener('click', handleNameEntry);
    document.getElementById('random-placement').addEventListener('click', handleRandomPlacement);
    document.getElementById('reset-btn').addEventListener('click', handleResetPlacement);
    document.getElementById('rotate-btn').addEventListener('click', rotateActiveShip);
    document.getElementById('done').addEventListener('click', () => {
        ui.hide('done');
        finishPlacement();
    });
    document.getElementById('end-turn-btn').addEventListener('click', () => {
        ui.hide('end-turn-btn');
        switchTurnsPvP();
    });
}

export function handleRandomPlacement() {
    currentPlayer.board.reset();
    shipsPlaced.clear();
    setActiveShip(null);
    currentPlayer.board.placeShipsRandomly(standardFleet);
    standardFleet.forEach(ship => shipsPlaced.add(ship.name));
    refreshPlacementUI(currentPlayer, `player${currentPlayer.id}-board`);
    standardFleet.forEach(ship => ui.removeShipFromDock(ship.name.toLowerCase()));
    if (shipsPlaced.size === standardFleet.length) {
        ui.displayMessage("Random placement complete! Move on?");
        ui.show('done');
    }
}

export function handleResetPlacement() {
    currentPlayer.board.reset();
    shipsPlaced.clear();
    setActiveShip(null);
    refreshPlacementUI(currentPlayer, `player${currentPlayer.id}-board`);
    ui.renderShips(standardFleet);
    ui.displayMessage("Board reset. Place your ships again.");
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
        ui.hide('setup-screen');
        ui.show('name-screen');
        ui.displayMessage(`Mode selected: ${mode} - Enter Player name`);
    } else if (gameMode === 'PvP') {
        ui.hide('setup-screen');
        ui.show('name-screen');
        ui.displayMessage(`Mode selected: ${mode} - Enter Player names`);
    }
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
    const opponent = (currentPlayer === player1) ? player2 : player1;
    const placementMessage = document.getElementById('placement-message');
    placementMessage.textContent = `What will your strategy be, ${player.name}?`;
    ui.displayMessage(`${currentPlayer.name}: Drag and drop your ships onto your board`);
    currentDomGrid = ui.renderPlayerBoard(`player${currentPlayer.id}-board`, currentPlayer.board, null, true);
    ui.renderPlayerBoard(`player${opponent.id}-board`, opponent.board, null, false);
    ui.renderShips(standardFleet);
    const boardDiv = document.getElementById(`player${currentPlayer.id}-board`);
    ui.setupPlacementListeners(boardDiv, currentDomGrid, currentPlayer.board, executePlacement);
}

export function setActiveShip(shipInfo) {
    activeShipData = shipInfo;

    if (shipInfo) {
        console.log(`Active ship set: ${shipInfo.shipId} (Length: ${shipInfo.length})`);
    } else {
        console.log("Active ship cleared.");
    }
}

export function getActiveShip() {
    return activeShipData;
}

export function rotateActiveShip() {
    const ship = getActiveShip();
    if (!ship) {
        ui.displayMessage('Select a ship first!');
        return;
    }
    ship.orientation = (ship.orientation === 'horizontal') ? 'vertical' : 'horizontal';
    ui.clearAllPreviews();
    ui.updateDockShipVisual(ship.element, ship.orientation);
    const hoveredCell = document.querySelector('.cell:hover');
    if (hoveredCell) {
        ui.refreshHoverPreview(hoveredCell);
    }
    document.getElementById('rotate-btn').textContent = `Rotate: ${(ship.orientation === 'horizontal') ? 'Vertical' : 'Horizonatal'}`;
}

export function calculateHead(x, y, length, grabOffset, orientation) {
    const headX = (orientation === 'vertical') ? x - grabOffset : x;
    const headY = (orientation === 'horizontal') ? y - grabOffset : y;
    return [headX, headY];
}

function refreshPlacementUI(player, boardId) {
    const boardDiv = document.getElementById(boardId);
    if (!boardDiv || !player) return;
    currentDomGrid = ui.renderPlayerBoard(boardId, player.board, null, true);
    ui.setupPlacementListeners(boardDiv, currentDomGrid, player.board, executePlacement);
    return currentDomGrid;
}

function executePlacement(dropX, dropY) {
    if (!activeShipData) return;
   
    const x = Number(dropX);
    const y = Number(dropY);
    const length = Number(activeShipData.length);
    const grabOffset = Number(activeShipData.grabOffset);
    const shipId = activeShipData.shipId;
    console.log(shipId);
    const orientation = activeShipData.orientation;

    const [headX, headY] = calculateHead(x, y, length, grabOffset, orientation);
    if (headX < 0 || headY < 0) {
        ui.displayMessage('Ship not in bounds');
        return;
    }

    try {
        const newShip = ship(length);
        currentPlayer.board.placeShip(newShip, [headX, headY], activeShipData.orientation);
        shipsPlaced.add(shipId);
        
        ui.removeShipFromDock(shipId);
        ui.clearAllPreviews();
        refreshPlacementUI(currentPlayer, `player${currentPlayer.id}-board`);
        
        activeShipData = null;
        if (shipsPlaced.size === standardFleet.length) {
            finishPlacement();
        }
    } catch (error) {
        ui.displayMessage("Invalid placement!");
    }
}


function finishPlacement() {
    if (gameMode === 'PvC') {
        player2.board.placeShipsRandomly(standardFleet);
        startGame();
    } else if (gameMode === 'PvP' && currentPlayer === player1) {
        ui.hideAllShips('player1-board', player1.board);
        shipsPlaced.clear();
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
        currentPlayer = nextPlayer;

        ui.renderPlayerBoard(nextPlayerBoardId, nextPlayer.board, null, true);
        
        ui.renderPlayerBoard(opponentBoardId, (nextPlayer === player1 ? player2 : player1).board, handleAttackClick, false);

        ui.highlightActivePlayer(currentPlayer === player1 ? 1 : 2);
        ui.displayMessage(`${currentPlayer.name}'s turn to attack!`);
    });
}

function handleAttackClick(e) {
    const x = Number(e.target.dataset.x);
    const y = Number(e.target.dataset.y);
    if (gameOver) return;
    const coords = [x, y];
    const coordKey = `${x},${y}`;

    if (gameMode === 'PvC') {
        if (currentPlayer !== player1) return;
        
        if (player1.movesMade.has(coordKey)) {
            ui.displayMessage('Already attacked here - try another coordinate!');
            return;
        }

        player1.attack(player2.board, coords);
        
        ui.renderPlayerBoard('player2-board', player2.board, handleAttackClick, false);

        if (player2.board.allShipsSunk()) {
            endGame(player1.name);
        } else {
            switchCurrentPlayer();
            ui.highlightActivePlayer(2);
            ui.displayMessage("Computer is thinking...");
            computerTurn();
        }
    } else {
        if (currentPlayer === player1) {
            
            player1.attack(player2.board, coords);
            ui.renderPlayerBoard('player2-board', player2.board, null, false);
            if (player2.board.allShipsSunk()) {
                endGame(player1.name);
            }
            ui.show('end-turn-btn');
        } else {
            
            player2.attack(player1.board, coords);
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
    setTimeout(() => {
        const lastAttack = makeComputerMove();
        recordComputerAttack(lastAttack.x, lastAttack.y, lastAttack.result);
        if (lastAttack.result === 'hit') {
            const neighbors = getValidNeighbors(lastAttack.x, lastAttack.y, computerShotMemory);
            neighbors.forEach(coord => targetStack.push(coord));
        }

        ui.renderPlayerBoard('player1-board', player1.board, null, true);

        if (player1.board.allShipsSunk()) {
            endGame(player2.name);
        } else {
            switchCurrentPlayer();
            ui.highlightActivePlayer(1);
            ui.displayMessage(`Your turn, ${player1.name}`);
        }
    }, 1000);
}

function createShotMap(size = 10) {
    const map = [];
    for (let r = 0; r < size; r++) {
        map[r] = [];
        for (let c = 0; c < size; c++) {
            map[r][c] = 0;
        }
    }
    return map;
}

function recordComputerAttack(x, y, result) {
    computerShotMemory[x][y] = result === 'hit' ? 2 : 1;
}

function getValidNeighbors(x, y, shotMap) {
    const potentialNeighbors = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1]
    ];
    return potentialNeighbors.filter(([x, y]) => {
        const isOnBoard = x >= 0 && x < 10 && y >= 0 && y < 10;
        return isOnBoard && shotMap[x][y] === 0;
    })
}

const makeComputerMove = () => {
    let coords;
    if (targetStack.length > 0) {
        coords = targetStack.pop();
    } else {
        coords = generateRandomCoords();
    }

    const result = player2.attack(player1.board, coords);
    return { x: coords[0], y: coords[1], result};
}

const generateRandomCoords = () => {
    let x, y;
    x = Math.floor(Math.random() * 10);
    y = Math.floor(Math.random() * 10);
    let coordKey = `${x},${y}`;
    if (player2.movesMade.has(coordKey)) {
        return generateRandomCoords();
    } else {
        return [x, y];
    }
}

const endGame = (winnerName) => {
    gameOver = true;
    ui.displayMessage(`GAME OVER! ${winnerName} has sunk the enemy fleet!`);
    ui.renderPlayerBoard('player1-board', player1.board, null, true);
    ui.renderPlayerBoard('player2-board', player2.board, null, true);

    ui.clearAllPreviews();
    ui.highlightActivePlayer(0);
    const playAgainScreen = document.getElementById('play-again-screen');
    if (playAgainScreen) {
        const finalMessage = document.getElementById('final-message');
        finalMessage.textContent = `${winnerName} wins!`;
        ui.show('play-again-screen');
        document.getElementById('restart-btn').addEventListener('click', () => {
            window.location.reload();
        })
    }
}

if (process.env.NODE_ENV === 'development') {
    window.endGame = endGame;
}
