const { guilds } = require('./schemas');
const addCoins = require('./addCoins');

/**
 * search or create a database of a guild.
 * @param {string} id - id of the guild
 * @returns {guilds} the guild created or searched.
 */
module.exports = async (id) => {
    const guild = await guilds.findOne({ id: id });

    if (!guild) {
        await addCoins(process.env['BOT_ID'], id, Infinity);
        const newGuild = new guilds({ id: id, date: Date.now() });
        await newGuild.save();
        return newGuild;
    } else {
        return guild;
    }

}