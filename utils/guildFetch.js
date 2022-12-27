const { guilds } = require('./schemas');

/**
 * busca o crea una base de datos de un servidor.
 * @param {string} id - la id del servidor.
 * @returns {guilds} el servidor buscado o creado.
 */
module.exports = async (id) => {
    const guild = await guilds.findOne({ id: id }); // base de datos del servidor

    // verificador por si no existe la base de datos
    if (!guild) {
        const newGuild = new guilds({ id: id, date: Date.now() }); // la nueva base de datos
        await newGuild.save();
        return newGuild;
    } else {
        return guild;
    }

}