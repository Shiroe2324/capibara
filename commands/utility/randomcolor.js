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
    name: 'randomcolor',
    usage: 'randomcolor',
    aliases: ['randcolor'],
    cooldown: 3000,
    category: 'utilidad',
    description: 'Genera un color aleatorio en formato hexadecial y muestra su formato rgb.',
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
        Utils.setCooldown('randomcolor', msg.author.id);

        try {
            let color = '';
            while (color.length <= 6) {
                color += `${Utils.random(16).toString(16)}`;
            };

            const { body } = await superagent.get(`https://api.alexflipnote.dev/color/${color}`)

            const embed = new EmbedBuilder()
                .setColor(`#${color}`)
                .setTitle(body.name)
                .setImage(body.images.square)
                .addFields([
                    { name: '**Hex**', value: body.hex.string.toUpperCase(), inline: true },
                    { name: '**RGB**', value: `${body.rgb.values[0]}, ${body.rgb.values[1]}, ${body.rgb.values[2]}`, inline: true }
                ]);

            Utils.send(msg, { embeds: [embed] })
        } catch (e) {
            Utils.send(msg, `Sucedió un error al buscar el color: ${e}`);
        }

    }
}