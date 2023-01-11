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
    name: 'setcrimevalue',
    usage: 'setcrimevalue [minimo] [maximo]',
    examples: ['setcrimevalue 100 500', 'setcrimevalue 1k 10k'],
    aliases: ['crimevalue'],
    cooldown: 10000,
    category: 'administracion',
    description: [
        'Actualiza el valor maximo y minimo de {coins} que se consiguen con el comando crime.',
        'Actualmente el valor minimo es de **__{minCrimeValue}__** y el maximo es de **__{maxCrimeValue}__**.'
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
        const formatedMinValue = await Utils.setCoinsFormat(args[0]);
        const formatedMaxValue = await Utils.setCoinsFormat(args[1]);
        const minValue = Math.round(formatedMinValue);
        const maxValue = Math.round(formatedMaxValue);

        if (isNaN(minValue)) {
            return Utils.send(msg, `Tienes que colocar un valor minimo de ${guild.coin} valido!`);
        } else if (isNaN(maxValue)) {
            return Utils.send(msg, `Tienes que colocar un valor maximo de ${guild.coin} valido!`);
        } else if (minValue > 100000000000 || maxValue <= 100000000000) {
            return Utils.send(msg, 'Los valores no pueden exceder los 100000000000');
        } else if (minValue <= 0) {
            return Utils.send(msg, 'No puedes colocar un valor minimo de 0!');
        } else if (maxValue <= 0) {
            return Utils.send(msg, 'No puedes colocar un valor maximo de 0!');
        } else if (minValue === guild.crimeValue.min && maxValue === guild.crimeValue.max) {
            return Utils.send(msg, 'Ya se están usando esos valores!');
        } else if (maxValue < minValue) {
            return Utils.send(msg, 'El valor maximo no puede ser menor al valor minimo!');
        }

        Utils.setCooldown('setcrimevalue', msg.author.id, msg.guildId);
        guild.crimeValue = { min: minValue, max: maxValue, fail: guild.crimeValue.fail };
        await guild.save();

        Utils.send(msg, `los valores minimos y maximos se ha actualizado respectivamente a **${Utils.formatNumber(minValue)}** y **${Utils.formatNumber(maxValue)}**`);
    }
}