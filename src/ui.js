import gameboard from "./gameboard";

export function renderPlayerBoard(containerId, gameboard, handler, showShips) {
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
            } else if (cellStatus !== null && showShips) {
                cell.classList.add('ship-present');
            }

            if (handler) {
                cell.addEventListener('click', handler);
            }

            container.appendChild(cell);
        }
    }
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