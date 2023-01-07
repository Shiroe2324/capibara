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
    name: 'setworkvalue',
    usage: 'setworkvalue [minimo] [maximo]',
    examples: ['setworkvalue 100 500', 'setworkvalue 1k 10k'],
    aliases: ['workvalue'],
    cooldown: 10000,
    category: 'administracion',
    description: [
        'Actualiza el valor maximo y minimo de {coins} que se consiguen con el comando work.',
        'Actualmente el valor minimo es de **{minWorkValue}** y el maximo es de **{maxWorkValue}**.'
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
        const formatedMinValue = await Utils.setCoinsFormat(args[0]);
        const formatedMaxValue = await Utils.setCoinsFormat(args[1]);
        const minValue = Math.round(formatedMinValue);
        const maxValue = Math.round(formatedMaxValue);

        if (isNaN(minValue)) {
            return Utils.send(msg, `Tienes que colocar un valor minimo de ${guild.coin} valido!`);
        } else if (isNaN(maxValue)) {
            return Utils.send(msg, `Tienes que colocar un valor maximo de ${guild.coin} valido!`);
        } else if (minValue <= 0) {
            return Utils.send(msg, 'No puedes colocar un valor minimo de 0!');
        } else if (maxValue <= 0) {
            return Utils.send(msg, 'No puedes colocar un valor maximo de 0!');
        } else if (minValue === guild.workValue.min && maxValue <= guild.workValue.max) {
            return Utils.send(msg, 'Ya se están usando esos valores!');
        } else if (maxValue < minValue) {
            return Utils.send(msg, 'El valor maximo no puede ser menor al valor minimo!');
        }

        Utils.setCooldown('setworkvalue', msg.author.id, msg.guildId);
        guild.workValue = { min: minValue, max: maxValue };
        await guild.save();

        Utils.send(msg, `los valores minimos y maximos se ha actualizado respectivamente a **${minValue}** y **${maxValue}**`);
    }
}