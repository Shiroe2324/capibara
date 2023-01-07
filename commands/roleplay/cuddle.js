const { PermissionFlagsBits, Message, Client, EmbedBuilder } = require('discord.js');
const Utils = require('../../utils');
const nekoClient = require('nekos.life');
const neko = new nekoClient();

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
    name: 'cuddle',
    usage: 'cuddle [usuario]',
    examples: ['cuddle @shiro'],
    aliases: [],
    cooldown: 4000,
    category: 'roleplay',
    description: ['Te acurrucas con un usuario.'],
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
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
        const search = await Utils.findMember(msg, args);
        Utils.activedCommand(msg.author.id, 'remove');

        if (search.error) return search.message({ content: search.messageError, embeds: [], components: [] });
        if (search.member.id === msg.author.id) return search.message({ content: 'No te puedes acurrucar contigo mismo!', embeds: [], components: [] });

        Utils.setCooldown('cuddle', msg.author.id, msg.guildId);

        const image = await neko.cuddle();

        const embed = new EmbedBuilder()
            .setImage(image.url)
            .setColor(Utils.color);

        if (search.member.id === client.user.id) {
            embed.setAuthor({ name: `*Se acurruca con ${msg.author.username}* :3` });
        } else {
            embed.setAuthor({ name: `${msg.author.username} se acurrucó con ${search.member.user.username}.` });
        }

        search.message({ embeds: [embed], components: [] });
    }
}