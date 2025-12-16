const ship = (length) => {
    let hits = 0;
    
    const hit = () => {
        hits++;
    }

    const isSunk = () => {
        return hits >= length;
    }

    return {
        length,
        hit,
        isSunk
    };
};

export default ship;