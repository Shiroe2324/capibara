const { Message } = require('discord.js');


/**
 * reply or send a message to a channel.
 * @param {Message} msg - message to send.
 * @param {string|object} data - data to send.
 * @returns {Message} msg.
 */

module.exports = async (msg, data) => {
    try {
        if (typeof data === 'object') {
            return msg.reply({ ...data, allowedMentions: { repliedUser: false } });
        } else {
            return msg.reply({ content: data, allowedMentions: { repliedUser: false } });
        }
    } catch (err) {
        return msg.channel.send(data)
    }
}