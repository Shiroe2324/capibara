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
    description: [
        'Consigues {coins} haciendo trabajos junto a capibaras.',
        'El minimo de {coins} que puedes conseguir trabajando en este servidor es de **__{minWorkValue}__** y el maximo es de **__{maxWorkValue}__**.'
    ],
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
        Utils.setCooldown('work', msg.author.id, msg.guildId);

        const guild = await Utils.guildFetch(msg.guildId);
        const max = guild.workValue.max;
        const min = guild.workValue.min;
        const money = (max === min ? 0 : Utils.random(max - min)) + min;
        const formatedMoney = Utils.formatNumber(money);
        
        const texts = [
            `**${msg.author.username}** trabajaste ba??ando capibaras y ganaste **${formatedMoney}** ${guild.coin}`,
            `**${msg.author.username}** trabajaste dandole de comer a los capibaras y ganaste **${formatedMoney}** ${guild.coin}`,
            `**${msg.author.username}** trabajaste limpiando el parque de los carpinchos y ganaste **${formatedMoney}** ${guild.coin}`,
            `**${msg.author.username}** trabajaste sacando a pasear a los capibaras y ganaste **${formatedMoney}** ${guild.coin}`,
            `**${msg.author.username}** trabajaste vendiendo productos de capibaras y ganaste **${formatedMoney}** ${guild.coin}`,
            `**${msg.author.username}** jugaste con los carpinchos y el cuidador te di?? **${formatedMoney}** ${guild.coin} como agradecimiento`
        ];

        Utils.addCoins(msg.author.id, msg.guildId, money); 
        const message = Utils.random(texts);

        Utils.send(msg, message);
    }
}
