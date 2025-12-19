import gameboard from "./gameboard";

const player = (name, id) => {
    const board = gameboard();
    const movesMade = new Set();

    const attack = (opponentBoard, coords) => {
        const coordKey = `${coords[0]},${coords[1]}`;
        movesMade.add(coordKey);
        return opponentBoard.receiveAttack(coords);
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