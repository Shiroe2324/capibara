const members = new Map();

/**
 * add a member to the list of members that fail a crime.
 * @param {string} member the member to add.
 * @param {string} guild the guild where it happened.
 * @param {string} type the type of action to perform (add|remove|get).
 * @returns {boolean|number} a boolean that say if the members list has the member or a number with Date now.
 */

module.exports = (member, guild, type) => {
    switch (type) {
        case 'add': members.set(member + guild, Date.now()); break;
        case 'remove': members.delete(member + guild); break;
        case 'get': return members.get(member + guild); break;
        default: return members.has(member + guild);
    }
}