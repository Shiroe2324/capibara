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
    name: 'kiss',
    usage: 'kiss [usuario]',
    examples: ['kiss @shiro'],
    aliases: [],
    cooldown: 4000,
    category: 'roleplay',
    description: ['Besa a otro usuario.'],
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
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
        Utils.activedCommand(msg.author.id, 'add');
        const search = await Utils.findMember(msg, args);
        Utils.activedCommand(msg.author.id, 'remove');

        if (search.error) return search.message({ content: search.messageError, embeds: [], components: [] })
        if (search.member.id === msg.author.id) return search.message({ content: 'No te puedes besar a ti mismo!', embeds: [], components: [] })

        Utils.setCooldown('kiss', msg.author.id, msg.guildId);
        
        const image = await neko.kiss();

        if (search.member.id === client.user.id) return search.message({ content: 'A mi no me puedes besar! >:C', embeds: [], components: [] })

        if (search.member.user.bot) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: `${msg.author.username} besó a ${search.member.user.username}.` })
                .setImage(image.url)
                .setColor(Utils.color);

            return search.message({ embeds: [embed], components: [] })
        }

        Utils.setCooldown('kiss', search.member.id, msg.guildId);

        const author = await Utils.userFetch(msg.author.id, 'global');
        const mention = await Utils.userFetch(search.member.id, 'global');
        const authorKisses = author.kisses.get(search.member.id);
        const mentionKisses = mention.kisses.get(msg.author.id);

        if (!authorKisses && !mentionKisses) {
            author.kisses.set(search.member.id, 1);
            mention.kisses.set(msg.author.id, 1);
        } else {
            author.kisses.set(search.member.id, authorKisses + 1);
            mention.kisses.set(msg.author.id, mentionKisses + 1);
        }

        author.save();
        mention.save();

        const kissAmount = author.kisses.get(search.member.id) === 1 ? 'vez' : 'veces';

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${msg.author.username} besó a ${search.member.user.username}.` })
            .setDescription(`**${msg.author.username}** y **${search.member.user.username}** se han besado **${author.kisses.get(search.member.id)}** ${kissAmount} en total.`)
            .setImage(image.url)
            .setColor(Utils.color);

        return search.message({ embeds: [embed], components: [] });
    }
}