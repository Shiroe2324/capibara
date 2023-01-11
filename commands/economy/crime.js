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
    name: 'crime',
    usage: 'crime',
    examples: ['crime'],
    aliases: ['steal'],
    cooldown: 120000,
    category: 'economia',
    description: [
        'Consigues {coins} robando, pero con una posibilidad de fallar y perder parte de las {coins} que no tengas en el banco y no puedas usar comandos de economía por un tiempo.',
        'Se pueden perder del **10%** hasta el **30%** de las monedas que tienes',
        'El minimo de {coins} que puedes conseguir robando en este servidor es de **__{minCrimeValue}__** y el maximo es de **__{maxCrimeValue}__**.',
        'La posibilidad de fallar en este servidor es del **{crimeFail}%**'

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
        Utils.setCooldown('crime', msg.author.id, msg.guildId);

        const guild = await Utils.guildFetch(msg.guildId);

        if (Math.random() <= guild.crimeValue.fail) {
            const user = await Utils.userFetch(msg.author.id, msg.guildId);
            const coinsRemoved = parseInt(user.coins * ((Utils.random(20) + 10) / 100));
            const coinText = coinsRemoved === 0 ? `No perdistes ${guild.coin} pero` : `Has perdido **${Utils.formatNumber(coinsRemoved)}** ${guild.coin} y`;

            Utils.removeCoins(msg.author.id, msg.guildId, coinsRemoved);
            Utils.crimeFailed(msg.author.id, msg.guildId, 'add');
            return Utils.send(msg, `Fallaste el asalto. ${coinText} fuiste encarcelado por lo cual no podrás usar comandos de economía durante **5 minutos**`);
        }

        const max = guild.crimeValue.max;
        const min = guild.crimeValue.min;
        const money = (max === min ? 0 : Utils.random(max - min)) + min;
        const formatedMoney = Utils.formatNumber(money);
        
        const texts = [
            `**${msg.author.username}** robaste el parque de los capibaras y conseguiste **${formatedMoney}** ${guild.coin}`,
            `**${msg.author.username}** robaste el criadero de los capibaras y conseguiste **${formatedMoney}** ${guild.coin}`,
            `**${msg.author.username}** asaltaste a el cuidador de los capibaras y conseguiste **${formatedMoney}** ${guild.coin}`,
            `**${msg.author.username}** asaltaste un banco de ${guild.coin} y conseguiste **${formatedMoney}** ${guild.coin}`,
        ];

        Utils.addCoins(msg.author.id, msg.guildId, money); 
        const message = Utils.random(texts);

        Utils.send(msg, message);
    }
}
