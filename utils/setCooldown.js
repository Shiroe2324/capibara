const userFetch = require('./userFetch');

/**
 * sets the cooldown to a specific command and user.
 * @param {string} commandName - the name of the command.
 * @param {string} userId - id of the member.
 * @param {string} guildId - id of the guild.
 * @returns {void}
 */
module.exports = async (commandName, userId, guildId) => {
    const user = await userFetch(userId, guildId);
    user.cooldowns.set(commandName, Date.now());
    await user.save();
}