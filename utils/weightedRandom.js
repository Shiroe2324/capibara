/**
* genera un index aleatorio con las posibilidades agregadas (la suma de las posibilidades tiene que ser 1)
* @param {object} indexList - la lista de index's maximos con sus posibilidades en decimales
* @returns {number} el index aleatorio elegido
*/
module.exports = (indexList) => {
    let total = 0; // cantidad de porcentaje total
    const randomNumber = Math.random(); // numero aleatorio [0,1)

    // se itera cada elemento del object indexList
    for (let index in indexList) {
        total += indexList[index]; // se le suma al porcentaje total la probabilidad del index que se está iterando

        // se verifica si el numero aleatorio [0,1) es menor o igual al porcentaje total actual, si es asi se devuelve el index que se está iterando
        if (randomNumber <= total) return Number(index);
    }
}