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
    name: 'editsnipe',
    usage: 'editsnipe (canal)',
    aliases: [],
    cooldown: 10000,
    category: 'utilidad',
    description: 'Muestra el ultimo mensaje editado de un canal especifico o al canal donde se ejecutó el comando.\nSe puede seleccionar un canal con mencion, id, o simplemente no colocar nada y se selecciona automáticamente el canal actual.',
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
        const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[0]) || msg.channel;
        const message = client.editsnipes.get(channel.id);

        if (!message) return msg.reply(`No se ha editado ningún mensaje recientemente en ${channel}.`).catch(e => console.log(e));

        const oldMessageEmbed = new EmbedBuilder()
            .setAuthor({ name: message.old.author.tag, iconURL: message.old.author.avatarURL({ dynamic: true }) })
            .setTitle('Antiguo mensaje')
            .setDescription(message.old.content)
            .setTimestamp(message.old.createdAt)
            .setColor(Utils.color);

        const newMessageEmbed = new EmbedBuilder()
            .setAuthor({ name: message.new.author.tag, iconURL: message.old.author.avatarURL({ dynamic: true }) })
            .setTitle('Nuevo mensaje')
            .setDescription(message.new.content)
            .setTimestamp(message.time)
            .setColor(Utils.color);

        msg.channel.send({ embeds: [oldMessageEmbed, newMessageEmbed] }).catch(e => console.log(e));
    }
}