/**
 * genera un numero aleatorio, o escoge un elemento aleatorio de un array.
 * @param {number|array} max - el numero maximo a sacar, o el elemento aleatorio elegido del array.
 * @returns {number|any} el número aleatorio o el index aleatorio sacado.
 */
module.exports = (max = 0) => {
    if (typeof max === 'object') {
        return max[Math.floor(Math.random() * max.length)];
    } else {
        return Math.floor(Math.random() * max + 1);
    }
}