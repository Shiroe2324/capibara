const { PermissionFlagsBits, Message, Client } = require('discord.js');
const { guildFetch } = require('../../utils');
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
    name: 'setlevelsystem',
    usage: 'setlevelsystem',
    examples: ['setlevelsystem'],
    aliases: ['levelsystem'],
    cooldown: 10000,
    category: 'administracion',
    description: [
        'Activa o desactiva el sistema de niveles en el servidor.',
        'Acualmente el sistema de niveles se encuentra **__{levelSystem}__**.'
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
        Utils.setCooldown('setlevelsystem', msg.author.id, msg.guildId);

        const guild = await Utils.guildFetch(msg.guildId);

        if (guild.levelSystem) {
            guild.levelSystem = false;
            Utils.send(msg, 'Se ha **desactivado** el sistema de niveles con exito.');
        } else {
            guild.levelSystem = true;
            Utils.send(msg, 'Se ha **activado** el sistema de niveles con exito.');
        }

        await guild.save();
    }
}