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
    name: 'setlevelchannel',
    usage: 'setlevelchannel [canal|default]',
    examples: ['setlevelchannel #general', 'setlevelchannel default'],
    aliases: ['levelchannel'],
    cooldown: 10000,
    category: 'administracion',
    description: [
        'Establece el canal donde se enviaran los mensajes cuando un usuario sube de nivel.',
        'Puedes colocar **__default__** para eliminar el canal establecido, y que se use el canal donde el usuario mandó el mensaje',
        'Actualmente el canal establecido es **__{levelChannel}__**'
    ],
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages
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
        const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[0]);
        
        if (args[0] === 'default') {
            if (guild.levelChannel === 'none') return Utils.send(msg, 'Actualmente el servidor no cuenta con canal de niveles!');
            guild.levelChannel = 'none';
            await guild.save();
            return Utils.send(msg, 'Se ha eliminado el canal de niveles.');
        }

        if (!channel) return Utils.send(msg, 'Tienes que colocar un canal!');
        if (channel.type !== ChannelType.GuildText) return Utils.send(msg, 'Tienes que colocar un canal de texto de este servidor!');
        if (!msg.guild.channels.cache.has(channel.id)) return Utils.send(msg, 'Tienes que colocar un canal de este servidor!');
        if (!client.channels.cache.has(channel.id) || !channel.permissionsFor(client.user).has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages])) {
            return Utils.send(msg, 'Tienes que colocar un canal que yo pueda ver y que pueda mandar mensajes!');
        }
        if (guild.levelChannel === channel.id) return Utils.send(msg, 'Ya se está usando ese canal!'); 

        guild.levelChannel = channel.id;
        await guild.save();

        return Utils.send(msg, `El canal de niveles a sido cambiado con exito a ${channel}`);
    }
}