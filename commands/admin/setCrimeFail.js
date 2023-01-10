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
    name: 'setcrimefail',
    usage: 'crimefail [valor]',
    examples: ['crimefail 10000', 'crimefail 1m'],
    aliases: ['crimefail'],
    cooldown: 10000,
    category: 'administracion',
    description: [
        'Actualiza el valor de {coins} que se consiguen con el comando daily.',
        'Actualmente el valor de {coins} que se consiguen con el comando daily es de **__{dailyValue}__**.',
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
        const value = Number(formatedValue.toFixed(5));

        if (isNaN(value)) {
            return Utils.send(msg, `Tienes que colocar un porcentaje valido!`);
        } else if (value <= 0) {
            return Utils.send(msg, 'No puedes colocar un porcentaje menor o igual que **0%**!');
        } else if (value > 80) {
            return Utils.send(msg, 'No puedes colocar un porcentaje mayor que **80%**!');
        } else if (value === (guild.crimeValue.fail / 100)) {
            return Utils.send(msg, 'Ya se está usando ese porcentaje!');
        }

        Utils.setCooldown('setcrimefail', msg.author.id, msg.guildId);
        guild.crimeValue = { min: guild.crimeValue.min, max: guild.crimeValue.max, fail: value / 100 };
        await guild.save();

        Utils.send(msg, `El porcentaje de fallar un crimen se ha actualizado a **${value}%**`);
    }
}
