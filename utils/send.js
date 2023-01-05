const { Message } = require('discord.js');


/**
 * reply or send a message to a channel.
 * @param {Message} msg - message to send.
 * @param {string|object} data - data to send.
 * @returns {Message} msg.
 */

module.exports = async (msg, data) => {
    let message;

    try {
        if (typeof data === 'object') {
            message = await msg.reply({ ...data, allowedMentions: { repliedUser: false } });
        } else {
            message = await msg.reply({ content: data, allowedMentions: { repliedUser: false } });
        }
    } catch (err) {
        message = await msg.channel.send(data);
    }

    return message;
}
