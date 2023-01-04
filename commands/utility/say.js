const { PermissionFlagsBits, Message, Client, ChannelType } = require('discord.js');
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
    name: 'say',
    usage: 'say (canal) [mensaje]',
    aliases: [],
    cooldown: 2000,
    category: 'utilidad',
    description: 'Envía un mensaje a un canal especifico o al canal donde se ejecutó el comando.',
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages
    ],
    userPermissions: [],

    /**
     * funcion con el codigo a ejecutar del comando.
     * @param {Message} msg - El mensaje enviado por el usuario.
     * @param {string[]} args - Los argumentos del mensaje enviado por el usuario.
     * @param {Client} client - El cliente del bot.
     */
    execute: async (msg, args, client) => {
        let channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[0]);
        let message = args.slice(1).join(' ');

        if (!channel) {
            channel = msg.channel;
            message = args.join(' ');
        }

        if (channel.type !== ChannelType.GuildText) return msg.reply('Tienes que mencionar un canal de texto!');
        if (!client.channels.cache.has(channel.id) || !channel.permissionsFor(client.user).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return msg.reply('No puedo enviar mensajes a ese canal!');
        if (!channel.members.has(msg.author.id) || !channel.permissionsFor(msg.author).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return msg.reply('No puedes enviar mensajes a ese canal!');
        if (!message) return msg.reply('No puedes enviar un mensaje vacio!');

        msg.delete();

        channel.send({ 
            content: message, 
            allowedMentions: { 
                users: false,
                members: false, 
                everyone: channel.permissionsFor(msg.author).has(PermissionFlagsBits.MentionEveryone)
            } 
        });
    }
}