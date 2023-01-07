const { PermissionFlagsBits, Message, Client } = require('discord.js');
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
    name: 'setminimumbet',
    usage: 'setminimumbet [valor]',
    examples: ['setminimumbet 10000', 'setminimumbet 1m'],
    aliases: ['minimumbet'],
    cooldown: 10000,
    category: 'administracion',
    description: [
        'Actualiza el valor minimo de {coins} que se necesitan para apostar.',
        'Actualmente el valor minimo de {coins} que se necesitan para apostar es de **{minimumBet}**.',
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
        const formatedValue = await Utils.setCoinsFormat(args[0]);
        const value = Math.round(formatedValue);

        if (isNaN(value)) {
            return Utils.send(msg, `Tienes que colocar un valor de ${guild.coin} valido!`);
        } else if (value <= 0) {
            return Utils.send(msg, 'No puedes colocar un valor de 0!');
        } else if (value === guild.minimumBet) {
            return Utils.send(msg, 'Ya se está usando ese valor!');
        }

        Utils.setCooldown('setminimumbet', msg.author.id, msg.guildId);
        guild.minimumBet = value;
        await guild.save();

        Utils.send(msg, `El valor minimo de ${guild.coin} para apostar se ha actualizado a **${value}**`);
    }
}