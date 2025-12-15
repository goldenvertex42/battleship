export default Ship = (length) => {
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