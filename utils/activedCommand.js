const members = new Map();

/**
 * add a member to the list of members that have a actived command.
 * @param {string} member the member to add.
 * @param {string} type the type of action to perform (add|remove).
 * @returns {boolean} a boolean that say if the members list has the member.
 */

module.exports = (member, type) => {
    switch (type) {
        case 'add': members.set(member, true); break;
        case 'remove': members.delete(member); break;
        default: return members.has(member);
    }
}