const { users } = require('./schemas');

/**
 * busca crea una base de datos de un usuario.
 * @param {string} userId - la id del usuario.
 * @param {string} guildId - la id del servidor, o global.
 * @returns {users|false} el usuario buscado o creado.
 */
module.exports = async (userId, guildId) => {
    const user = await users.findOne({ user: userId, guild: guildId }); // base de datos del usuario
    
     // verificador por si no existe la base de datos
    if (!user) {
        const newUser = new users({ user: userId, guild: guildId, date: Date.now() }); // la nueva base de datos
        await newUser.save(); 
        return newUser;
    } else {
        return user;
    }
}