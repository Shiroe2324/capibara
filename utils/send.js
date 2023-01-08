const { Message } = require('discord.js');


/**
 * reply or send a message to a channel.
 * @param {Message} msg - message to send.
 * @param {string|object} data - data to send.
 * @param {boolean} replied - a boolean indicating if the message replied
 * @returns {Message} msg.
 */

module.exports = async (msg, data, replied = false) => {
    let message;

    try {
        if (typeof data === 'object') {
            message = await msg.reply({ ...data, allowedMentions: { repliedUser: replied } });
        } else {
            message = await msg.reply({ content: data, allowedMentions: { repliedUser: replied } });
        }
    } catch (err) {
        message = await msg.channel.send(data);
    }

    return message;
}
