/**
 * Function that removes accents from a string.
 * @param {string} str - the string to remove the accents.
 * @returns {string} the string without tildes the accents.
 */
module.exports = (str) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
} 