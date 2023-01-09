const { PermissionFlagsBits, Message, Client, EmbedBuilder } = require('discord.js');
const Utils = require('../../utils');

/**
 * @property name - The name of the command.
 * @property usage - The syntax in which the command is used.
 * @property examples - Examples of how to use the command.
 * @property aliases - The aliases of the command.
 * @property cooldown - the cooldown time of the command
 * @property category - The name of the command category.
 * @property description - The description of the command.
 * @property onlyCreator - Check if the command is only for the creator of the bot.
 * @property botPermissions - List of bot permissions for the command.
 * @property userPermissions - List of user permissions for the command.
 */
module.exports = {
    name: 'daily',
    usage: 'daily',
    examples: ['daily'],
    aliases: [],
    cooldown: 86400000,
    category: 'economia',
    description: [
        'Consigues {coins} cada 24 horas y otros objetos más.',
        'La recompensa diaria de {coins} en este servidor es de **{dailyValue}**.'
    ],
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks
    ],
    userPermissions: [],

    /**
     * function with the code to execute the command.
     * @param {Message} msg - The message sent by the user.
     * @param {string[]} args - The arguments of the message sent by the user.
     * @param {Client} client - The bot's client.
     */
    execute: async (msg, args, client) => {
        Utils.setCooldown('daily', msg.author.id, msg.guildId);

        const guild = await Utils.guildFetch(msg.guildId);

        Utils.addCoins(msg.author.id, msg.guildId, guild.dailyValue); 

        const embed = new EmbedBuilder()
            .setAuthor({ name: msg.author.tag, iconURL: msg.author.avatarURL({ dynamic: true })})
            .setDescription(`**${msg.author.username}** has reclamado tu recompensa diaria y has conseguido:\n\n**${Utils.formatNumber(guild.dailyValue)}** ${guild.coin}`)
            .setColor(Utils.color);

        Utils.send(msg, { embeds: [embed] });
    }
}