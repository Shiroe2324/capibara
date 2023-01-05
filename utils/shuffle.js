/**
 * Suffle an array.
 * @param {array} array - the array to suffle.
 * @returns {array} the array shuffled.
 */
module.exports = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}