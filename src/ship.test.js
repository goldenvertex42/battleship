import ship from "./ship";

describe('Ship Factory', () => {
    test('ship should expose length property', () => {
        const testShip = ship(3);
        expect(testShip.length).toBe(3);
    })

    describe('public methods', () => {
        let testShip;

        beforeEach(() => {
            testShip = ship(2);
        })

        test('isSunk returns false initially', () => {
            expect(testShip.isSunk()).toBe(false);
        })

        test('hit and isSunk interact correctly', () => {
            testShip.hit();
            expect(testShip.isSunk()).toBe(false);

            testShip.hit();
            expect(testShip.isSunk()).toBe(true);
        }) 
    })
})