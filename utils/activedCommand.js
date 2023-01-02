const members = new Map();

/**
 * Añade un miembro a una lista para evitar que use comandos.
 * @param {string} member el miembro a añadir o eliminar
 * @param {string} type el tipo de miembro a añadir o eliminar (add|remove).
 * @returns {boolean} un verificador que indica si el miembro fue añadido o no.
 */

module.exports = (member, type) => {
    switch (type) {
        case 'add': members.set(member, true); break;
        case 'remove': members.delete(member); break;
        default: return members.has(member);
    }
}