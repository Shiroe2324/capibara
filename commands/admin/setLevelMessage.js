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
    name: 'setlevelmessage',
    usage: 'setlevelmessage [mensaje]',
    examples: ['setlevelmessage Felicidades {member} has subido al nivel \*\*{level}\*\*!'],
    aliases: ['levelmessage'],
    cooldown: 10000,
    category: 'administracion',
    description: [
        'Establece el mensaje enviado cada vez que un usuario sube de nivel.',
        'Tienes que colocar obligatoriamente **__{member}__** para hacer referencia al usuario y **__{level}__** para indicar el nivel al que sube',
        'Actualmente el mensaje establecido es:',
        '\`{levelMessage}\`'
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
        const message = args.join(' ');
        
        if (!args[0]) return Utils.send(msg, 'Tienes que colocar un mensaje!');
        if (!message.includes('{member}')) return Utils.send(msg, 'Tienes que colocar **{member}** una vez como minimo!');
        if (!message.includes('{level}')) return Utils.send(msg, 'Tienes que colocar **{level}** una vez como minimo!');
        if (message.length >= 2000) return Utils.send(msg, 'El mensaje colocado es demasiado largo!');
        if (guild.levelMessage === message) return Utils.send(msg, 'Ya se está usando ese mensaje!'); 

        guild.levelMessage = message;
        await guild.save();

        return Utils.send(msg, `El mensaje de subida de nivel a sido cambiado con exito a:\n\`${message}\``);
    }
}