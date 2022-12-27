/**
 * Funcion que quita tildes o acentos a un string.
 * @param {string} str - el string a quitar los acentos.
 * @returns {string} el string sin tildes o acentos.
 */
module.exports = (str) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
} 