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
    name: 'setdailyvalue',
    usage: 'setdailyvalue [valor]',
    examples: ['setdailyvalue 10000', 'setdailyvalue 1m'],
    aliases: ['dailyvalue'],
    cooldown: 10000,
    category: 'administracion',
    description: [
        'Actualiza el valor de {coins} que se consiguen con el comando daily.',
        'Actualmente el valor de {coins} que se consiguen con el comando daily es de **__{dailyValue}__**.',
    ],
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.UseExternalEmojis
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
        } else if (value > 100000000000) {
            return Utils.send(msg, 'El valor no puede exceder los 100000000000');
        } else if (value === guild.dailyValue) {
            return Utils.send(msg, 'Ya se está usando ese valor!');
        }

        Utils.setCooldown('setdailyvalue', msg.author.id, msg.guildId);
        guild.dailyValue = value;
        await guild.save();

        Utils.send(msg, `El valor ${guild.coin} que se consigue con daily se ha actualizado a **${Utils.formatNumber(value)}**`);
    }
}