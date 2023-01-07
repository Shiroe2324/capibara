const { PermissionFlagsBits, Message, Client, ChannelType } = require('discord.js');
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
    name: 'say',
    usage: 'say (canal) [mensaje]',
    example: ['say hello world', 'say #general hello world'],
    aliases: [],
    cooldown: 2000,
    category: 'utilidad',
    description: ['Envía un mensaje a un canal especifico o al canal donde se ejecutó el comando.'],
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ManageMessages
    ],
    userPermissions: [],

    /**
     * function with the code to execute the command.
     * @param {Message} msg - The message sent by the user.
     * @param {string[]} args - The arguments of the message sent by the user.
     * @param {Client} client - The bot's client.
     */
    execute: async (msg, args, client) => {
        let channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[0]);
        let message = args.slice(1).join(' ');

        if (!channel) {
            channel = msg.channel;
            message = args.join(' ');
        }

        if (channel.type !== ChannelType.GuildText) return Utils.send(msg, 'Tienes que mencionar un canal de texto!');
        if (!client.channels.cache.has(channel.id) || !channel.permissionsFor(client.user).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return Utils.send(msg, 'No puedo enviar mensajes a ese canal!');
        if (!channel.members.has(msg.author.id) || !channel.permissionsFor(msg.author).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) return Utils.send(msg, 'No puedes enviar mensajes a ese canal!');
        if (!message) return Utils.send(msg, 'No puedes enviar un mensaje vacio!');

        Utils.setCooldown('say', msg.author.id, msg.guildId);
        
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
