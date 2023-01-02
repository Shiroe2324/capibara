const { guildUser } = require('./schemas');

/**
 * quita los formatos a una cadena o numero de monedas.
 * @param {guildUser} user - la base de datos del usuario para conseguir sus monedas.
 * @param {string|number} coins - la cadena o numero de monedas a formatear.
 * @returns {number} el numero de monedas ya formateado.
 */
module.exports = (user, coins) => {
    if (typeof Number(coins) === 'number' && !isNaN(coins)) return coins; // si es solamente un numero sin formato, se retorna el propio numero

    //se verifica si se necesitan todas las monedas, la mitad, solo una cuarta parte
    switch (coins) {
        case 'all': return user.coins;
        case 'half': return user.coins / 2;
        case 'quarter': return user.coins / 4;
    }

    /* se verifica por medio de una RexExp si la cadena cumple con los requisitos, ejemplos: ['19m', '9.6b', '1k', '999q']
    en caso contrario se retorna NaN */
    if (!/^([0-9]+[.])?[0-9]+[kmbtq]$/i.test(coins)) return NaN;

    const formatedCoins = parseFloat(coins); // se quitan las letras y se pasa al tipo FloatingNumber 
    const format = coins.substring(coins.length - 1); // se selecciona el tipo de formato usado

    // se verifica que formato se está usando, y lo devuelve en su valor exacto (mil, millon, billon, trillon, quatrillon)
    switch (format) {
        case 'k': return formatedCoins * 1000;
        case 'm': return formatedCoins * 1000000;
        case 'b': return formatedCoins * 1000000000;
        case 't': return formatedCoins * 1000000000000;
        case 'q': return formatedCoins * 1000000000000000;
    }
}