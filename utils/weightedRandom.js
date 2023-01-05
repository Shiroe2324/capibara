/**
 * generates a random index with the aggregated possibilities (the sum of the possibilities has to be 1).
 * @param {object} indexList -the list of maximum index with their possibilities in decimals.
 * @returns {number} the chosen random index.
 */
module.exports = (indexList) => {
    let total = 0;
    const randomNumber = Math.random();

    for (let index in indexList) {
        total += indexList[index];

        if (randomNumber <= total) return Number(index);
    }
}