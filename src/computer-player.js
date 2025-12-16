import player from "./player";

const computerPlayer = (name = 'Computer') => {
    const basePlayer = player(name);

    const makeRandomAttack = (opponentBoard) => {
        let x, y, coordKey;

        do {
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * 10);
            coordKey = `${x},${y}`;
        } while (basePlayer.movesMade.has(coordKey));

        return basePlayer.attack(opponentBoard, [x, y]);
    }

    return {
        ...basePlayer,
        makeRandomAttack
    }
}

export default computerPlayer;