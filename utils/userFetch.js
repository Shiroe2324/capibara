const { globalUser, guildUser } = require('./schemas');

/**
 * search or create a database of a user.
 * @param {string} userId - id of the member.
 * @param {string} guildId - id of the guild or 'global'.
 * @returns {globalUser} the searched or created user.
 */
module.exports = async (userId, guildId) => {
    if (guildId === 'global') {
        const user = await globalUser.findOne({ user: userId });
        if (!user) {
            const newUser = new globalUser({ user: userId, date: Date.now() });
            await newUser.save(); 
            return newUser;
        }
        return user;
    }

    const user = await guildUser.findOne({ user: userId, guild: guildId });
    if (!user) {
        const newUser = new guildUser({ user: userId, guild: guildId, date: Date.now() });
        await newUser.save(); 
        return newUser;
    }
    return user;
}