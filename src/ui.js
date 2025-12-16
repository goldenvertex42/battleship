import gameboard from "./gameboard";

function renderPlayerBoard(containerId, gameboard, handler, isPlayerBoard) {
    const container = document.getElementById(containerId);
    
    if (!container) return;

    container.innerHTML = '';

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
            } else if (isPlayerBoard && cellStatus !== null) {
                cell.classList.add('ship-present');
            }

            if (!isPlayerBoard && handler) {
                cell.addEventListener('click', handler);
            }

            container.appendChild(cell);
        }
    }
}

export function initializeBoardsVersusPC(player1, player2, p2handler) {
    renderPlayerBoard('player1-board', player1.board, null, true);
    renderPlayerBoard('player2-board', player2.board, p2handler, false);
}

export function updateCellVisual(containerId, x, y, result) {
    const container = document.getElementById(containerId);
    const cell = container.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    
    if (cell) {
        cell.classList.add(result);
        cell.style.pointerEvents = 'none';
    }
}

export function displayMessage(msg) {
    document.querySelector('.message-container').textContent = msg;
}

