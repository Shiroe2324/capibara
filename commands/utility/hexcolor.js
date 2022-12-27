const superagent = require('superagent'); // se importa superagent para la busqueda de la API
const { EmbedBuilder, PermissionFlagsBits, Message, Client } = require('discord.js');
const Utils = require('../../utils');

/**
 * @property name - El nombre del comando.
 * @property usage - La sintaxis en que se usa el comando.
 * @property aliases - Los aliases del comando.
 * @property cooldowns - el tiempo de cooldown del comando
 * @property category - El nombre de la categoría del comando.
 * @property description - La descripcion del comando.
 * @property onlyCreator - Verificador si el comando es solo para el creador del bot.
 * @property botPermissions - Lista de permisos del bot para el comando.
 * @property userPermissions - Lista de permisos del usuario para el comando.
 */
module.exports = {
    name: 'hexcolor',
    usage: 'hexcolor [color]',
    aliases: ['hex'],
    cooldown: 3000,
    category: 'utilidad',
    description: 'Muestra un color en formato hexadecimal.',
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks
    ],
    userPermissions: [],

    /**
     * funcion con el codigo a ejecutar del comando.
     * @param {Message} msg - El mensaje enviado por el usuario.
     * @param {string[]} args - Los argumentos del mensaje enviado por el usuario.
     * @param {Client} client - El cliente del bot.
     */
    execute: async (msg, args, client) => {
        // se verifica por medio de una RegExp si el color dado es correcto, ejemplos: ['#D9022B', 'FF00FF', '#abcdef']
        if (!/^#?[0-9a-f]{6}$/i.test(args[0])) return msg.reply('Tienes que colocar un color en formato hex válido!');

        Utils.setCooldown('hexcolor', msg.author.id); // se establece el cooldown

        try {
            const color = args[0].toLowerCase().replace('#', ''); // se quita el # y las letras se pasan a minusculas
            const { body } = await superagent.get(`https://api.alexflipnote.dev/color/${color}`) // se busca por medio de una API el color dado

            // embed con los datos del color
            const embed = new EmbedBuilder()
                .setColor(`#${color}`)
                .setTitle(body.name)
                .setImage(body.images.square)
                .addFields([
                    { name: '**Hex**', value: body.hex.string.toUpperCase(), inline: true },
                    { name: '**RGB**', value: `${body.rgb.values[0]}, ${body.rgb.values[1]}, ${body.rgb.values[2]}`, inline: true }
                ]);

            msg.reply({ embeds: [embed] }); // se envía el embed
        } catch (e) {
            msg.reply(`Sucedió un error al buscar el color: ${e}`) // si hay un error al buscar el color, se le informa al usuario
        }

    }
}