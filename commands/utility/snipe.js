const { PermissionFlagsBits, Message, Client, EmbedBuilder } = require('discord.js');
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
    name: 'snipe',
    usage: 'snipe (canal)',
    aliases: [],
    cooldown: 10000,
    category: 'utilidad',
    description: 'Muestra el ultimo mensaje eliminado del canal actual o seleccionado.\nSe puede seleccionar un canal con mencion, id, o simplemente no colocar nada y se selecciona automáticamente el canal actual.',
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
        const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[0]) || msg.channel; // el canal seleccionado
        const message = client.snipes.get(channel.id); // el ultimo mensaje eliminado del canal seleccionado

        // verificador por si no se ha borrado ningún mensaje recientemente en el canal
        if (!message) return msg.reply(`No se ha borrado ningún mensaje recientemente en ${channel}.`);

        // embed con la información del mensaje eliminado
        const embed = new EmbedBuilder()
            .setAuthor({ name: message.data.author.tag })
            .setThumbnail(message.data.author.avatarURL({ dynamic: true, size: 2048 }))
            .setDescription(message.data.content)
            .setTimestamp(message.time)
            .setColor(Utils.color);

        // se envía el embed
        msg.channel.send({ embeds: [embed] })
    }
}