import player from "./player";

const computerPlayer = (name = 'Computer', id) => {
    const basePlayer = player(name, id);

    const isComputer = true;

    const makeRandomAttack = (opponentBoard) => {
        let x, y, coordKey;

        do {
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * 10);
            coordKey = `${x},${y}`;
        } while (basePlayer.movesMade.has(coordKey));

        const result = basePlayer.attack(opponentBoard, [x, y]);
        return {x, y, result};
    }

    return {
        ...basePlayer,
        isComputer,
        makeRandomAttack
    }
}

export default computerPlayer;