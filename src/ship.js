const ship = (length) => {
    let hits = 0;
    let coordinates = [];
    
    const hit = () => {
        hits++;
    }

    const isSunk = () => {
        return hits >= length;
    }

    const setCoordinates = (coords) => {
        coordinates = coords;
    }

    const getCoordinates = () => coordinates;

    return {
        length,
        hit,
        isSunk,
        setCoordinates,
        getCoordinates
    };
};

export default ship;