const { guildUser } = require('./schemas');

/**
 * removes the formats to a string or number of coins.
 * @param {string|number} coins - the string or number of coins to format.
 * @param {guildUser} user - the user database to get their coins.
 * @param {string} type - the type of coins to format.
 * @returns {number} the number of coins already formatted.
 */
module.exports = (coins, user, type = 'free') => {
    if (typeof Number(coins) === 'number' && !isNaN(coins)) return Number(coins); 
    
    if (Boolean(user)) {
        switch (coins) {
            case 'all': return type === 'free' ? user.coins : user.depositedCoins;
            case 'half': return type === 'free' ? user.coins : user.depositedCoins / 2;
            case 'quarter': return type === 'free' ? user.coins : user.depositedCoins / 4;
        }
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