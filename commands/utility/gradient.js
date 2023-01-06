const superagent = require('superagent'); // se importa superagent para la busqueda de la API
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
    name: 'gradient',
    usage: 'gradient [color]',
    aliases: [],
    cooldown: 3000,
    category: 'utilidad',
    description: 'Muestra un color en formato hexadecimal y su respectivo gradiente.',
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
        if (!/^#?[0-9a-f]{6}$/i.test(args[0])) return Utils.send(msg, 'Tienes que colocar un color en formato hex válido!')

        Utils.setCooldown('hexcolor', msg.author.id, msg.guildId);

        try {
            const color = args[0].toLowerCase().replace('#', ''); 
            const { body } = await superagent.get(`https://api.alexflipnote.dev/color/${color}`)

            const embed = new EmbedBuilder()
                .setColor(`#${color}`)
                .setTitle(body.name)
                .setImage(body.images.gradient);

            Utils.send(msg, { embeds: [embed] })
        } catch (e) {
            Utils.send(msg, `Sucedió un error al buscar el color: ${e}`);
        }

    }
}
