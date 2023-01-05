/**
 * generates a random number, or picks a random element from an array.
 * @param {number|array} max - the maximum number to draw, or the random element chosen from the array.
 * @returns {number|any[]} the random number or the random index.
 */
module.exports = (max = 0) => {
    if (typeof max === 'object') {
        return max[Math.floor(Math.random() * max.length)];
    } else {
        return Math.floor(Math.random() * max + 1);
    }
}