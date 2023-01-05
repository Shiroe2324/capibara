const { EmbedBuilder, PermissionFlagsBits, Message, Client } = require('discord.js');
const Utils = require('../../utils');

/**
 * @property name - The name of the command.
 * @property usage - The syntax in which the command is used.
 * @property aliases - The aliases of the command.
 * @property cooldown - the cooldown time of the command
 * @property category - The name of the command category.
 * @property description - The description of the command.
 * @property onlyCreator - Check if the command is only for the creator of the bot.
 * @property botPermissions - List of bot permissions for the command.
 * @property userPermissions - List of user permissions for the command.
 */
module.exports = {
    name: 'emojis',
    usage: 'emojis',
    aliases: ['emojilist', 'listemoji'],
    cooldown: 10000,
    category: 'utilidad',
    description: 'Muestra todos los emojis del servidor',
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
        Utils.setCooldown('emojis', msg.author.id);

        const emojis = msg.guild.emojis.cache.map(emoji => `${emoji} - \`${emoji}\` (**[Link](${emoji.url})**)`); // la lista de emojis del servidor

        if (emojis.length === 0) return Utils.send(msg, 'El servidor no cuenta con emojis.')

        const embed = (index) => {
            const current = emojis.slice(index, index + 10);
            return new EmbedBuilder()
                .setTitle(`Lista de emojis de **${msg.guild.name}** (${emojis.length})`)
                .setThumbnail(msg.guild.iconURL({ dynamic: true, size: 2048 }))
                .setDescription(current.join('\n'))
                .setFooter({ text: `ID: ${msg.guildId} ${emojis.length > 10 ? `--- página: ${(index+10)/10} de ${Math.ceil(emojis.length/10)}` : ''}` })
                .setColor(Utils.color)
        }

        Utils.pageSystem(msg, embed, emojis.length, 120000, true);
    }
}