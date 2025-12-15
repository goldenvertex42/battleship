import ship from "./ship";

export default gameboard = () => {
    const grid = Array.from({ length: 10 }, () => Array(10).fill(null));
    const shipsPlaced = [];

    const placeShip = (ship, startCoords, direction) => {
        const [startX, startY] = startCoords;

        for(let i = 0; i < ship.length; i++) {
            let x = startX;
            let y = startY;

            if (direction === 'vertical') {
                y += i;
            } else {
                x += i;
            }

            if (x < 0 || x >= 10 || y < 0 || y >= 10 || grid[x][y] !== null) {
                throw new Error('Invalid placement');
            }

            grid[x][y] = ship;
        }

        shipsPlaced.push(ship);
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
        allShipsSunk
    };
}