const { users } = require('./schemas');

/**
* busca a un usuario en alguna base de datos
* @param {string} userId - la id del usuario 
* @param {string} guildId - la id del servidor, o global
* @returns {users} el usuario buscado o un false si no encuentra a nadie
*/
module.exports = async (userId, guildId) => {
    const user = await users.findOne({ user: userId, guild: guildId }); // base de datos del usuario
    if (!user) return false; // verificador por si no existe la base de datos
    return user;
}