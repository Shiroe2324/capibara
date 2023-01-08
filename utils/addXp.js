const userFetch = require('./userFetch');

/**
 * add xp to a user in your global database.
 * @param {string} userId - id of the member.
 * @param {string} guildId - id of the guild.
 * @param {number} xp - xp to add.
 * @returns {boolean} a boolean if the user levels up.
 */
module.exports = async (userId, guildId, xp) => {
    const user = await userFetch(userId, guildId);

    user.xp += parseInt(xp, 10);
    user.level = Math.floor(0.1 * Math.sqrt(user.xp));

    await user.save()
    return (Math.floor(0.1 * Math.sqrt(user.xp -= xp)) < user.level);
}