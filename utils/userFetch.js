const { globalUser, guildUser } = require('./schemas');

/**
 * busca crea una base de datos de un usuario.
 * @param {string} userId - la id del usuario.
 * @param {string} guildId - la id del servidor, o global.
 * @returns {globalUser|false} el usuario buscado o creado.
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