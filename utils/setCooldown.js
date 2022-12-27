const userFetch = require('./userFetch');

/**
 * establece el cooldown a un comando y un usuario en especifico.
 * @param {string} commandName - el nombre del comando.
 * @param {string} userId - la id del usuario.
 * @returns {void}
 */
module.exports = async (commandName, userId) => {
    const user = await userFetch(userId, 'global'); // base de datos global del usuario
    user.cooldowns.set(commandName, Date.now()) // se establece el cooldown
    await user.save(); // y se guarda la base de datos
}