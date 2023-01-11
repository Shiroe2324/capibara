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
    name: 'withdraw',
    usage: 'withdraw [cantidad]',
    examples: ['withdraw 1k', 'withdraw 200', 'withdraw all'],
    aliases: [],
    cooldown: 5000,
    category: 'economia',
    description: ['Retira {coins} que tengas guardadas en el banco.'],
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.UseExternalEmojis
    ],
    userPermissions: [],

    /**
     * function with the code to execute the command.
     * @param {Message} msg - The message sent by the user.
     * @param {string[]} args - The arguments of the message sent by the user.
     * @param {Client} client - The bot's client.
     */
    execute: async (msg, args, client) => {
        const guild = await Utils.guildFetch(msg.guildId);
        const user = await Utils.userFetch(msg.author.id, msg.guildId);
        const formatedCoins = await Utils.setCoinsFormat(args[0], user, 'deposited');
        const coins = Math.round(formatedCoins);

        if (isNaN(coins)) {
            return Utils.send(msg, `Tienes que colocar una cantidad de ${guild.coin} valida!`);
        } else if (user.depositedCoins < coins) {
            return Utils.send(msg, `No puedes sacar mas ${guild.coin} de las que posees!`);
        } else if (coins <= 0) {
            return Utils.send(msg, `La cantidad de ${guild.coin} a sacar no puede ser menor o igual que 0!`);
        }

        user.depositedCoins -= coins;
        user.coins += coins;
        await user.save();

        return Utils.send(msg, `Has retirado **${Utils.formatNumber(coins)}** ${guild.coin} del banco`);
    }
}