import gameboard from "./gameboard";

describe('Gameboard Factory', () => {
    describe('gameboard grid', () => {
        let board;
        
        beforeEach(() => {
            board = gameboard();
        });

        test('gameboard grid has 10 rows', () => {
            expect(board.grid.length).toBe(10);
        });

        describe('each row has 10 columns', () => {
            test('test one row', () => {
                expect(board.grid[0].length).toBe(10);
            });

            test('test another row', () => {
                expect(board.grid[9].length).toBe(10);
            });
        });
    });

    describe('placeShip function', () => {
        let board;
        let mockShip;
        const startCoords = [0, 0];

        beforeEach(() => {
            board = gameboard();
            mockShip = ship(3);
        });

        const horizontalCoords = [
            [0, 0],
            [0, 1],
            [0, 2]
        ];

        test.each(horizontalCoords)(
            'places a horizontal ship using the startCoords', 
            (x, y) => {
                board.placeShip(mockShip, startCoords, 'horizontal');
                expect(board.grid[x][y]).toBe(mockShip);
            }
        );
        
        const verticalCoords = [
            [0, 0],
            [1, 0],
            [2, 0]
        ];

        test.each(verticalCoords)(
            'places a vertical ship using the startCoords', 
            (x, y) => {
                board.placeShip(mockShip, startCoords, 'vertical');
                expect(board.grid[x][y]).toBe(mockShip);
            }
        ); 
    });

    describe('receiveAttack function', () => {
        let board;
        let mockShip;
        const startCoords = [0, 0];

        beforeEach(() => {
            board = gameboard();
            mockShip = ship(3);
            board.placeShip(mockShip, startCoords, 'horizontal');
        });

        test('a successful attack returns hit', () => {
            expect(board.receiveAttack([0, 0])).toBe('hit');
        });
        
        test('an unsuccessful attack returns miss', () => {
            expect(board.receiveAttack([5, 5])).toBe('miss');
        });

        test('an attack on an already targeted hit cell returns already targeted', () => {
            board.receiveAttack([0, 1]);
            expect(board.receiveAttack([0, 1])).toBe('already targeted');
        });

        test('an attack on an already targeted missed cell returns already targeted', () => {
            board.receiveAttack([5, 5]);
            expect(board.receiveAttack([5, 5])).toBe('already targeted');
        });
    });

    describe('allShipsSunk function', () => {
        let board;
        let mockShip1;
        let mockShip2;
        

        beforeEach(() => {
            board = gameboard();
            mockShip1 = ship(1);
            mockShip2 = ship(2);
            
            board.placeShip(mockShip1, [0, 0], 'horizontal');
            board.placeShip(mockShip2, [5, 5], 'vertical');
        });

        test('all ships are not sunk', () => {
            expect(board.allShipsSunk()).toBe(false);
        });

        test('all ships are sunk', () => {
            board.receiveAttack([0, 0]);
            board.receiveAttack([5, 5]);
            board.receiveAttack([6, 5]);
            expect(board.allShipsSunk()).toBe(true);
        });
    });

    describe('automated ship placement', () => {
        let board;
        beforeEach(() => {
            board = gameboard();
        });

        test('placeShipsRandomly places a full fleet without errors or collisions', () => {
            const fleet = [{ length: 5 }, { length: 4 }, { length: 3 }, { length: 3 }, { length: 2 }];
            
            board.placeShipsRandomly(fleet);
            
            const cellsUsed = board.grid.flat().filter(cell => cell !== null && cell !== 'miss' && cell !== 'hit');
            const totalShipLength = fleet.reduce((sum, ship) => sum + ship.length, 0);

            expect(cellsUsed.length).toBe(totalShipLength);
        });
    })
});