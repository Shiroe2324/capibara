const Utils = require('./utils');
const { Message, Client, PermissionFlagsBits } = require('discord.js');
const members = new Map();

/**
 * Function that add xp to a user if level system is activated, and add roles and objects if the user level up.
 * @param {Message} msg - the message sent.
 * @param {Client} client - the bot client.
 * @returns {void}
 */
module.exports = async (msg, client) => {
    if (members.has(msg.author.id)) return;

    const guild = await Utils.guildFetch(msg.guildId);
    const max = guild.xp.max;
    const min = guild.xp.min;
    const randomXp = (max === min ? 0 : Utils.random(max - min)) + guild.xp.min;
    const xp = await Utils.addXp(msg.author.id, msg.guildId, randomXp);
    const user = await Utils.userFetch(msg.author.id, msg.guildId);
    const guildChannel = msg.guild.channels.cache.get(guild.levelChannel);

    if (xp) {
        if (guild.levelChannel === 'none' && msg.channel.permissionsFor(client.user).has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel])) {
            Utils.send(msg, guild.levelMessage.replace(/\{(member)\}/gi, msg.author.toString()).replace(/\{(level)\}/gi, user.level), true);
        } else if (guildChannel.permissionsFor(client.user).has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel])) {
            guildChannel.send(guild.levelMessage.replace(/\{(member)\}/gi, msg.author.toString()).replace(/\{(level)\}/gi, user.level));
        }
    }

    members.set(msg.author.id, true);
    setTimeout(() => members.delete(msg.author.id), 30000);
}