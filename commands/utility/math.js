const { PermissionFlagsBits, Message, Client, EmbedBuilder, codeBlock } = require('discord.js');
const Utils = require('../../utils');
const calculator = require('mathjs');

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
    name: 'math',
    usage: 'math [expresión]',
    examples: ['math 7+9+62*3', 'math derivative("sqrt(\'x\')", "x")', 'math cbrt(27)', 'math 9^2'],
    aliases: ['calc', 'c'],
    cooldown: 2000,
    category: 'utilidad',
    description: [
        'Calcula una expresión matemática y devuelve su resultado.',
        'El comando utiliza el metodo `evaluate` de la librería mathjs, para más información de como usarlo visita **[mathjs.org](https://mathjs.org/index.html)**'
    ],
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
        const expresion = Utils.removeAccents(args.join(' '));

        try {
            const result = calculator.evaluate(expresion);
            const embed = new EmbedBuilder()
                .setAuthor({ name: `${client.user.username} calculator`, iconURL: client.user.avatarURL() })
                .setDescription(codeBlock('yaml', `${result.toString()} `))
                .setColor(Utils.color);

            Utils.send(msg, { embeds: [embed] });
        } catch (err) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: `${client.user.username} calculator`, iconURL: client.user.avatarURL() })
                .setDescription(codeBlock('diff', '- Sucedió un error al calcular la expresión!'))
                .setColor(Utils.color);

            Utils.send(msg, { embeds: [embed] });
        }
    }
}