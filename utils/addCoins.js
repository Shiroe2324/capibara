const userFetch = require('./userFetch');
const { guildUser } = require('./schemas');

/**
 * add coins to a guild member.
 * @param {string} userId - id of the member.
 * @param {string} guildId - id of the guild.
 * @param {number} coins - coind to add.
 * @returns {guildUser} the member who add coin.
 */
module.exports = async (userId, guildId, coins) => {
    const user = await userFetch(userId, guildId);
    user.coins += coins;
    await user.save();
    return user
}