const { PermissionFlagsBits, Message, Client, emoji } = require('discord.js');
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
    name: 'setemoji',
    usage: 'setemoji [emoji|default]',
    examples: ['setemoji default', 'setemoji <:capicoin:1057747950027165727>'],
    aliases: [],
    cooldown: 10000,
    category: 'administracion',
    description: [
        'Especifica que emoji se debe de usar como moneda en el servidor.',
        'Se puede colocar "default" para reestablecer al emoji predeterminado.',
        'El emoji actual del servidor es {coins}'
    ],
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.UseExternalEmojis
    ],
    userPermissions: [PermissionFlagsBits.Administrator],

    /**
     * function with the code to execute the command.
     * @param {Message} msg - The message sent by the user.
     * @param {string[]} args - The arguments of the message sent by the user.
     * @param {Client} client - The bot's client.
     */
    execute: async (msg, args, client) => {
        const guild = await Utils.guildFetch(msg.guildId);

        if (!args[0]) return Utils.send(msg, 'Tienes que colocar un emoji!');

        if (args[0] === 'default') {
            if (guild.coin === process.env['COIN_NAME']) return Utils.send(msg, 'Ya se está usando el emoji predeterminado!');
            guild.coin = process.env['COIN_NAME'];
            await guild.save();
            return Utils.send(msg, 'Se ha restablecido el emoji predeterminado.');
        }

        const emoji = Utils.emoji(args[0], client);

        if (!emoji.isEmoji) return Utils.send(msg, 'Tienes que especificar un emoji válido!');
        if (emoji.type === 'guild' && !emoji.existInBot) return Utils.send(msg, 'Tienes que colocar un emoji predeterminado o que esté en un servidor donde yo esté!');
        if (args[0] === guild.coin) return Utils.send(msg, 'Ya se está usando ese emoji!');

        Utils.setCooldown('setemoji', msg.author.id, msg.guildId);
        guild.coin = args[0];
        await guild.save();

        Utils.send(msg, `Se ha actualizado el emoji de moneda a ${args[0]}.`);
    }
}
