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
    name: 'setprefix',
    usage: 'setprefix [prefix]',
    aliases: ['prefix'],
    cooldown: 10000,
    category: 'administracion',
    description: 'Actualiza el prefix del bot en el servidor.',
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks
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

        if (!args[0]) {
            return Utils.send(msg, 'El prefix debe tener al menos 1 caracter.')
        } else if (args[0].length > 16) {
            return Utils.send(msg, 'El prefix debe tener menos de 16 caracteres.')    
        } else if (guild.prefix === args[0]) {
            return Utils.send(msg, 'El prefix colocado es el actual prefix del servidor.') 
        }
        
        Utils.setCooldown('emojis', msg.author.id);

        guild.prefix = args[0];
        await guild.save(); 

        Utils.send(msg, `El prefix se ha actualizado correctamente a \`${args[0]}\`.`)
    }
}