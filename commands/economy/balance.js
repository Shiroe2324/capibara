const { EmbedBuilder, PermissionFlagsBits, Message, Client } = require('discord.js');
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
    name: 'balance',
    usage: 'balance (usuario)',
    examples: ['balance', 'balance @shiro'],
    aliases: ['bal'],
    cooldown: 5000,
    category: 'economia',
    description: ['Muestra la cantidad de {coins} que tienes en el servidor.'],
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.UseExternalEmojis
    ],
    userPermissions: [],

    /**
     * function with the code to execute the command.
     * @param {Message} msg - The message sent by the user.
     * @param {string[]} args - The arguments of the message sent by the user.
     * @param {Client} client - The bot's client.
     */
    execute: async (msg, args, client) => {
        Utils.activedCommand(msg.author.id, 'add');
        const search = await Utils.findMember(msg, args, true, false);
        Utils.activedCommand(msg.author.id, 'remove');

        if (search.error) return search.message({ content: search.messageError, embeds: [], components: [] })

        Utils.setCooldown('balance', msg.author.id, msg.guildId);

        const user = await Utils.userFetch(search.member.id, msg.guildId);
        const guild = await Utils.guildFetch(msg.guildId);

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Balance de ${search.member.user.tag}`, iconURL: search.member.user.avatarURL({ dynamic: true }) }, msg.author.displayName)
            .setTitle(`**${user.coins}** ${guild.coin}`)
            .setColor(Utils.color);

        search.message({ embeds: [embed], components: [] })
    }
}
