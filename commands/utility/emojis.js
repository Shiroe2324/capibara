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
     * funcion con el codigo a ejecutar del comando.
     * @param {Message} msg - El mensaje enviado por el usuario.
     * @param {string[]} args - Los argumentos del mensaje enviado por el usuario.
     * @param {Client} client - El cliente del bot.
     */
    execute: async (msg, args, client) => {
        Utils.setCooldown('emojis', msg.author.id); // se establece el cooldown

        const emojis = msg.guild.emojis.cache.map(emoji => `${emoji} - \`${emoji}\` (**[Link](${emoji.url})**)`); // la lista de emojis del servidor

        // se verifica si no hay emojis
        if (emojis.length === 0) return msg.reply('El servidor no cuenta con emojis.');

        // embed interactivo con paginas
        const embed = (index) => {
            const current = emojis.slice(index, index + 10);
            return new EmbedBuilder()
                .setTitle(`Lista de emojis de **${msg.guild.name}** (${emojis.length})`)
                .setThumbnail(msg.guild.iconURL({ dynamic: true, size: 2048 }))
                .setDescription(current.join('\n'))
                .setFooter({ text: `ID: ${msg.guild.id} ${emojis.length > 10 ? `--- página: ${(index+10)/10} de ${Math.ceil(emojis.length/10)}` : ''}` })
                .setColor(Utils.color)
        }

        // se ejecuta la funcion que genera el embed con las paginas
        Utils.pageSystem(msg, embed, emojis.length, 120000, true);
    }
}