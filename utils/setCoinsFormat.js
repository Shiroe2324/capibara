const { guildUser } = require('./schemas');

/**
 * removes the formats to a string or number of coins.
 * @param {guildUser} user - the user database to get their coins.
 * @param {string|number} coins - the string or number of coins to format.
 * @returns {number} the number of coins already formatted.
 */
module.exports = (user, coins) => {
    if (typeof Number(coins) === 'number' && !isNaN(coins)) return coins; 
    
    switch (coins) {
        case 'all': return user.coins;
        case 'half': return user.coins / 2;
        case 'quarter': return user.coins / 4;
    }

    if (!/^([0-9]+[.])?[0-9]+[kmbtq]$/i.test(coins)) return NaN;

    const formatedCoins = parseFloat(coins);
    const format = coins.substring(coins.length - 1);

    switch (format) {
        case 'k': return formatedCoins * 1000;
        case 'm': return formatedCoins * 1000000;
        case 'b': return formatedCoins * 1000000000;
        case 't': return formatedCoins * 1000000000000;
        case 'q': return formatedCoins * 1000000000000000;
    }
}