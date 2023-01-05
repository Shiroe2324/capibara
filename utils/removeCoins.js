const userFetch = require('./userFetch');
const { guildUser } = require('./schemas');

/**
 * remove coins to a guild member.
 * @param {string} userId - id of the member.
 * @param {string} guildId - id of the guild.
 * @param {number} coins - coind to remove.
 * @returns {guildUser} the member who remove coin.
 */
module.exports = async (userId, guildId, coins) => {
    const user = await userFetch(userId, guildId);
    user.coins -= coins;
    await user.save();
    return user;
}