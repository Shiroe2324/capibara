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
    name: 'work',
    usage: 'work',
    examples: ['work'],
    aliases: [],
    cooldown: 300000,
    category: 'economia',
    description: ['Consigues {coins} haciendo trabajos junto con capibaras.'],
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks
    ],
    userPermissions: [],

    /**
     * function with the code to execute the command.
     * @param {Message} msg - The message sent by the user.
     * @param {string[]} args - The arguments of the message sent by the user.
     * @param {Client} client - The bot's client.
     */
    execute: async (msg, args, client) => {
        Utils.setCooldown('work', msg.author.id, msg.guildId);

        const guild = await Utils.guildFetch(msg.guildId);
        const money = Utils.random(400) + 100;

        const texts = [
            `**${msg.author.username}** trabajaste bañando capibaras y ganaste **${money}** ${guild.coin}`,
            `**${msg.author.username}** trabajaste dandole de comer a los capibaras y ganaste **${money}** ${guild.coin}`,
            `**${msg.author.username}** trabajaste limpiando el parque de los carpinchos y ganaste **${money}** ${guild.coin}`,
            `**${msg.author.username}** jugaste con los carpinchos y el cuidador te dió **${money}** ${guild.coin} como agradecimiento`
        ];

        Utils.addCoins(msg.author.id, msg.guildId, money); 
        const message = Utils.random(texts);

        Utils.send(msg, message)
    }
}