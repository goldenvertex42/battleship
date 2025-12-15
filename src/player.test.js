import gameboard from "./gameboard";
import player from "./player";
import computerPlayer from "./computer-player";

describe('Player Factory', () => {

    test('player can be initialized with a name property', () => {
        const human = player('Denver');
        expect(human.name).toBe('Denver');
    });

    test('player object contains an initialized gameboard', () => {
        const human = player('Denver');

        expect(human.board).toBeDefined();
        expect(human.board.grid.length).toBe(10);
    });

    describe('attack functionality', () => {
        let p1;
        let p2;

        beforeEach(() => {
            p1 = player('1');
            p2 = player('2');
        });

        test('player can attack opponents board', () => {
            p1.attack(p2.board, [0, 0]);

            expect(p2.board.grid[0][0]).toBe('miss');
        });

        test('calling attack on an attacked cell', () => {
            p1.attack(p2.board, [0, 0]);

            expect(() => p1.attack(p2.board, [0, 0])).toThrow(Error);
        });
    });
});

describe('Computer Player Factory', () => {
    let computer;
    let opponentBoard;
    let mathRandomSpy;

    beforeEach(() => {
        computer = computerPlayer();
        opponentBoard = gameboard();
        mathRandomSpy = jest.spyOn(Math, 'random');
    });

    afterEach(() => {
        mathRandomSpy.mockRestore();
    });

    test('makes an attack on random, valid coordinate', () => {
        mathRandomSpy.mockReturnValue(0.5);

        computer.makeRandomAttack(opponentBoard);

        expect(opponentBoard.grid[5][5]).not.toBeNull();
        expect(computer.movesMade.has('5,5')).toBe(true);
    });

    test('does not attack same coordinate twice', () => {
        opponentBoard.receiveAttack([0, 0]);
        computer.movesMade.add('0,0');

        mathRandomSpy.mockReturnValueOnce(0);
        mathRandomSpy.mockReturnValueOnce(0);
        mathRandomSpy.mockReturnValue(0.1);
        

        computer.makeRandomAttack(opponentBoard);

        expect(computer.movesMade.has('0,0')).toBe(true);
        expect(computer.movesMade.has('1,1')).toBe(true);
        expect(opponentBoard.grid[1][1]).not.toBeNull();
    })
})