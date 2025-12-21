import gameboard from "./gameboard";
import { calculateHead, getActiveShip, setActiveShip } from "./state-manager";

const shipDock = document.querySelector('.ship-container');
let activeBoardLogic = null;
let activeDomGrid = null;

export function renderShipDock(fleetArray) {
    fleetArray.forEach(shipData => {
        const shipDiv = document.createElement('div');
        shipDiv.classList.add('ship');
        shipDiv.setAttribute('draggable', true);
        shipDiv.id = shipData.name.toLowerCase();
        shipDiv.dataset.id = shipData.name.toLowerCase();
        shipDiv.dataset.length = shipData.length;

        for (let i = 0; i < shipData.length; i++) {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('ship-cell');
            cellDiv.dataset.index = i;
            shipDiv.appendChild(cellDiv);
        }

        shipDock.appendChild(shipDiv);
    });
}

export function updateDockedShipVisual(shipElement, orientation) {
    if (!shipElement) return;

    if (orientation === 'vertical') {
        shipElement.classList.add('vertical');
    } else {
        shipElement.classList.remove('vertical');
    }
    
}

export function removeShipFromDock(shipToRemove) {
    const ship = document.getElementById(shipToRemove);
    if (ship && ship.parentNode) {
        ship.parentNode.removeChild(ship);
    }
}

function highlightPlacementPreview(domGrid, startX, startY, length, orientation, shouldAdd, isValid = true) {
    if (shouldAdd) clearAllPreviews();
    
    for (let i = 0; i < length; i++) {
        const x = Number(startX) + (orientation === 'vertical' ? i : 0);
        const y = Number(startY) + (orientation === 'horizontal' ? i : 0);
        
        const targetCell = domGrid[x]?.[y]; // optional chaining to safely return undefined when targetCell is invalid
        
        if (targetCell) {
            if (shouldAdd) {
                targetCell.classList.add('placement-preview');
                if (!isValid) targetCell.classList.add('invalid');
            } else {
                targetCell.classList.remove('placement-preview', 'invalid');
            }
        }
    }
}

export function refreshHoverPreview(cell) {
    const shipData = getActiveShip();
    if (!shipData || !activeBoardLogic || !activeDomGrid) return;

    const x = Number(cell.dataset.x);
    const y = Number(cell.dataset.y);
    
    const isValid = activeBoardLogic.isValidPlacement(activeBoardLogic.grid, x, y, shipData.length, shipData.orientation);
    highlightPlacementPreview(activeDomGrid, x, y, shipData.length, shipData.orientation, shouldAdd, isValid);
}

export function clearAllPreviews() {
    const previews = document.querySelectorAll('.placement-preview, .invalid');
    previews.forEach(cell => {
        cell.classList.remove('placement-preview', 'invalid');
    });
}

export function setupPlacementListeners(boardDiv, domGrid, board, onPlacement) {
    activeBoardLogic = board;
    activeDomGrid = domGrid;
    
    const handleHover = (e, shouldAdd) => {
        const shipData = getActiveShip();
        if (!shipData) {
            return;
        }
        const cell = e.target.closest('.cell');
        if (!cell) return;

        const x = parseInt(cell.dataset.x, 10);
        const y = parseInt(cell.dataset.y, 10);

        const [headX, headY] = calculateHead(x, y, shipData.grabOffset, shipData.orientation);
        
        const isValid = board.isValidPlacement(board.grid, headX, headY, shipData.length, shipData.orientation);
        
        highlightPlacementPreview(domGrid, headX, headY, shipData.length, shipData.orientation, shouldAdd, isValid);
    }
    
    let currentGrabOffset = 0;

    shipDock.addEventListener('mousedown', (e) => {
        const ship = e.target.closest('.ship');
        const cell = e.target.closest('.ship-cell');
        if (ship) {
            currentGrabOffset = cell ? parseInt(cell.dataset.index, 10) : 0;

            setActiveShip({ shipId: ship.dataset.id,
                            element: ship,
                            length: ship.dataset.length,
                            grabOffset: currentGrabOffset,
                            orientation: 'horizontal'
            });

            document.querySelectorAll('.ship').forEach(s => s.classList.remove('selected'));
            ship.classList.add('selected');
        }
    });

    shipDock.addEventListener('dragstart', (e) => {
        const ship = e.target.closest('.ship');
        if (ship) {
            e.dataTransfer.setData('shipId', ship.id);
        }
    });


    boardDiv.addEventListener('mouseover', (e) => handleHover(e, true));
    boardDiv.addEventListener('mouseout', (e) => handleHover(e, false));

    boardDiv.addEventListener('dragenter', (e) => handleHover(e, true));
    boardDiv.addEventListener('dragleave', (e) => handleHover(e, false));

    boardDiv.addEventListener('click', (e) => {
        if (e.target.closest('.cell')) {
            const x = parseInt(e.target.dataset.x, 10);
            const y = parseInt(e.target.dataset.y, 10);
            
            onPlacement(x, y)
        }
    });
    
    boardDiv.addEventListener('drop', (e) => {
        if (e.target.closest('.cell')) {
            e.preventDefault();

            const x = parseInt(e.target.dataset.x, 10);
            const y = parseInt(e.target.dataset.y, 10);
            
            onPlacement(x, y)
        }
    });

    boardDiv.addEventListener('dragover', (e) => e.preventDefault()); // allows use of the native HTML Drag and Drop API
}

export function renderPlayerBoard(containerId, gameboard, handler, showShips) {
    const container = document.getElementById(containerId);
    
    if (!container) return;

    container.innerHTML = '';
    const domCells = Array.from({ length: 10 }, () => Array(10).fill(null));
    for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
    
            cell.dataset.x = x;
            cell.dataset.y = y;

            const cellStatus = gameboard.grid[x][y];
            
            if (cellStatus === 'miss') {
                cell.classList.add('miss');
            } else if (cellStatus === 'hit') {
                cell.classList.add('hit');
            } else if (cellStatus !== null && showShips) {
                cell.classList.add('ship-present');
            }

            if (handler) {
                cell.addEventListener('click', handler);
            }
            container.appendChild(cell);
            domCells[x][y] = cell; 
        }
    }
    return domCells;
}

export function displayMessage(msg) {
    document.querySelector('#message-area').textContent = msg;
}

export function highlightActivePlayer(playerId) {
    const p1Label = document.getElementById('player1-name');
    const p2Label = document.getElementById('player2-name');

    p1Label.classList.toggle('active-turn', playerId === 1);
    p2Label.classList.toggle('active-turn', playerId === 2);
}

export function showPassDeviceScreen(nextPlayerName, callback) {
    const cover = document.createElement('div');
    cover.id = 'pass-device-cover';
    cover.innerHTML = `
            <div class="modal">
                <h2>Pass Device to ${nextPlayerName}</h2>
                <button id="ready-btn">I am Ready</button>
            </div>
        `;
    document.body.appendChild(cover);
    document.getElementById('ready-btn').onclick = () => {
        document.body.removeChild(cover);
        callback();
    };
}

export function hide(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.add('hidden');
    }
}

export function show(id) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.remove('hidden');
    }
}

export function updatePlayerNames(name1, name2) {
    const p1NameDisplay = document.getElementById('player1-name');
    const p2NameDisplay = document.getElementById('player2-name');

    if (p1NameDisplay) p1NameDisplay.textContent = name1;
    if (p2NameDisplay) p2NameDisplay.textContent = name2;
}

export function hideAllShips(containerId, gameboard) {
    renderPlayerBoard(containerId, gameboard, null, false);
}