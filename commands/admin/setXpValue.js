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
    name: 'setxpvalue',
    usage: 'setxpvalue [minimo] [maximo]',
    examples: ['setxpvalue 10 30', 'setxpvalue 4k 5k'],
    aliases: ['xpvalue'],
    cooldown: 10000,
    category: 'administracion',
    description: [
        'Establece el minimo y el maximo de xp obtenida en el servidor por cada mensaje.',
        'Actualmente en el servidor el minimo es **__{minXp}__** y el maximo es **__{maxXp}__**.',
        'La formula que usa para cada nivel es: **floor(0.1 × √xp)**',
        'La cantidad de xp que se necesita para un nivel es **(xp * xp * 100)**',
        '*floor significa que se redondea al numero entero menor más cercano*'
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
            return Utils.send(msg, `Tienes que colocar un valor minimo de **xp** valido!`);
        } else if (isNaN(maxValue)) {
            return Utils.send(msg, `Tienes que colocar un valor maximo de **xp** valido!`);
        } else if (minValue <= 0) {
            return Utils.send(msg, 'No puedes colocar un valor minimo de 0!');
        } else if (maxValue <= 0) {
            return Utils.send(msg, 'No puedes colocar un valor maximo de 0!');
        } else if (minValue === guild.xp.min && maxValue === guild.xp.max) {
            return Utils.send(msg, 'Ya se están usando esos valores!');
        } else if (maxValue < minValue) {
            return Utils.send(msg, 'El valor maximo no puede ser menor al valor minimo!');
        }

        Utils.setCooldown('setxpvalue', msg.author.id, msg.guildId);
        guild.xp = { min: minValue, max: maxValue };
        await guild.save();

        Utils.send(msg, `los valores de xp minimos y maximos se ha actualizado respectivamente a **${Utils.formatNumber(minValue)}** y **${Utils.formatNumber(maxValue)}**`);
    }
}