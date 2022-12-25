const userFetch = require('./userFetch');

/**
* añade xp a un usuario en su base de datos global
* @param {string} userId - la id del usuario 
* @param {number} xp - la xp a añadir
* @returns {boolean} un boolean si el usuario sube de nivel
*/
module.exports = async (userId, xp) => {
    const user = await userFetch(userId, 'global'); // base de datos global del usuario

    user.xp += xp; // xp añadida
    user.level = Math.floor(0.1 * Math.sqrt(user.xp)); // level que tiene por su xp

    await user.save(); // se guarda la base de datos
    return (Math.floor(0.1 * Math.sqrt(user.xp -= xp)) < user.level);  // y se retonan un boolean que verifica si sube de nivel o no
}