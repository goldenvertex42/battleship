import ship from "./ship";

const gameboard = () => {
    const grid = Array.from({ length: 10 }, () => Array(10).fill(null));
    const shipsPlaced = [];

    const reset = () => {
        for (let i = 0; i < 10; i++) {
            grid[i].fill(null);
        }
        shipsPlaced.length = 0;
    };
    
    const hasAdjacentShip = (grid, checkX, checkY) => {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                const neighborX = checkX + dx;
                const neighborY = checkY + dy;

                if (neighborX >= 0 && neighborX < 10 && neighborY >= 0 && neighborY < 10) {
                    if (grid[neighborX][neighborY] !== null) {
                        return true;
                    }
                }
            }
        }
    }
    
    const isValidPlacement = (grid, x, y, length, orientation) => {
        const startX = Number(x);
        const startY = Number(y);
        const shipLength = Number(length);
        
        if (startX < 0 || startY < 0 || startX >= 10 || startY >= 10) return false;

        if (orientation === 'vertical' && startX + shipLength > 10) return false; 
        if (orientation === 'horizontal' && startY + shipLength > 10) return false; 
        
        for (let i = 0; i < shipLength; i++) {
            const checkX = startX + (orientation === 'vertical' ? i : 0);
            const checkY = startY + (orientation === 'horizontal' ? i : 0);
            if (grid[checkX][checkY] !== null) {
                return false;
            }
        }

        for (let i = 0; i < shipLength; i++) {
            const checkX = startX + (orientation === 'vertical' ? i : 0);
            const checkY = startY + (orientation === 'horizontal' ? i : 0);
            if (hasAdjacentShip(grid, checkX, checkY)) {
                return false;
            }
        }
        
        return true;
    }
    
    const placeShip = (ship, startCoords, orientation) => {
        const [startX, startY] = startCoords;
        const shipCoords = [];
        if (!isValidPlacement(grid, startX, startY, ship.length, orientation)) {
            throw new Error('Invalid placement: out of bounds, collision, or too close to another');
        };
        for (let i = 0; i < ship.length; i++) {
            const x = startX + (orientation === 'vertical' ? i : 0);
            const y = startY + (orientation === 'horizontal' ? i : 0);
        
            grid[x][y] = ship;
            
            shipCoords.push([x, y]);
        }
        ship.setCoordinates(shipCoords);
        shipsPlaced.push(ship);
        return true;
    }

    const placeShipsRandomly = (fleetDefinitions) => {
        fleetDefinitions.forEach(shipDef => {
            const newShip = ship(shipDef.length);
            let placed = false;
            while (!placed) {
                const orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';
                const startX = Math.floor(Math.random() * 10);
                const startY = Math.floor(Math.random() * 10);
                if (isValidPlacement(grid, startX, startY, shipDef.length, orientation)) {
                    placeShip(newShip, [startX, startY], orientation);
                    placed = true;
                };
            };
        });
    }    

    const receiveAttack = (coords) => {
        const [x, y] = coords;
        const cell = grid[x][y];

        if (cell === null) {
            grid[x][y] = 'miss';
            return 'miss';
        }

        if (typeof cell === 'object' && cell !== 'miss') {
            cell.hit();
            grid[x][y] = 'hit';
            return 'hit';
        }

        return 'already targeted';
    }

    const allShipsSunk = () => {
        return shipsPlaced.every(ship => ship.isSunk());
    }
    
    return {
        grid,
        reset,
        placeShip,
        receiveAttack,
        isValidPlacement,
        allShipsSunk,
        placeShipsRandomly
    };
}

export default gameboard;