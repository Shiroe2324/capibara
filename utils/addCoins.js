const userFetch = require('./userFetch');
const { guildUser } = require('./schemas');

/**
 * añade coins a un usuario en un servidor.
 * @param {string} userId - la id del usuario.
 * @param {string} guildId - la id del servidor.
 * @param {number} coins - las monedas a añadir.
 * @returns {guildUser} el usuario a quien se le añadió las coins.
 */
module.exports = async (userId, guildId, coins) => {
    const user = await userFetch(userId, guildId); // base de datos del usuario en el servidor
    user.coins += coins; // coins añadidas
    await user.save(); // se guarda la base de datos
    return user; // y se retonan los datos del usuario
}