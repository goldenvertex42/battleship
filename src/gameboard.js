import ship from "./ship";

export default gameboard = () => {
    const grid = Array.from({ length: 10 }, () => Array(10).fill(null));
    const shipsPlaced = [];

    const isValidPlacement = (grid, startX, startY, length, orientation) => {
        for (let i = 0; i < length; i++) {
            const x = startX + (orientation === 'vertical' ? i : 0);
            const y = startY + (orientation === 'horizontal' ? i : 0);
            if (x < 0 || x >= 10 || y < 0 || y >= 10 || grid[x][y] !== null) {
                return false;
            }
        }
        return true;
    }
    
    const placeShip = (ship, startCoords, orientation) => {
        const [startX, startY] = startCoords;
        if (!isValidPlacement(grid, startX, startY, ship.length, orientation)) {
            throw new Error('Invalid placement: out of bounds or a collision');
        };
        for (let i = 0; i < ship.length; i++) {
            const x = startX + (orientation === 'vertical' ? i : 0);
            const y = startY + (orientation === 'horizontal' ? i : 0);

            grid[x][y] = ship;
        }
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
        placeShip,
        receiveAttack,
        allShipsSunk,
        placeShipsRandomly
    };
}