import gameboard from "./gameboard";

const player = (name, id) => {
    const board = gameboard();
    const movesMade = new Set();

    const attack = (opponentBoard, coords) => {
        const coordKey = `${coords[0]},${coords[1]}`;
        if (movesMade.has(coordKey)) {
            throw new Error('Already attacked here');
        }
        movesMade.add(coordKey);
        return opponentBoard.receiveAttack([coords[0],coords[1]]);
    }

    return {
        name,
        id,
        board,
        attack,
        movesMade
    }
}

export default player;