const { PermissionFlagsBits, Message, Client } = require('discord.js');
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
    name: 'blacklist',
    usage: 'blacklist [usuario]',
    aliases: ['bl'],
    cooldown: 0,
    category: 'privada',
    description: 'Coloca en blacklist a un usuario',
    onlyCreator: true,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages
    ],
    userPermissions: [],

    /**
     * function with the code to execute the command.
     * @param {Message} msg - The message sent by the user.
     * @param {string[]} args - The arguments of the message sent by the user.
     * @param {Client} client - The bot's client.
     */
    execute: async (msg, args, client) => {
        const user = client.users.fetch(args[0]);
        if (!user) return Utils.send(msg, 'El usuario no existe.')
     
        const userdb = await Utils.user(args[0], 'global');

        userdb.blacklist = true;
        await userdb.save();
        Utils.send(msg, 'El usuario se ha añadido a la blacklist.')
    }
}