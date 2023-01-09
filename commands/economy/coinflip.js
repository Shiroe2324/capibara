const { EmbedBuilder, PermissionFlagsBits, Message, Client } = require('discord.js');
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
    name: 'coinflip',
    usage: 'coinflip [head|tails] [cantidad]',
    examples: ['coinflip head 1k', 'coinflip tails 100', 'coinflip h 100'],
    aliases: ['cf'],
    cooldown: 5000,
    category: 'economia',
    description: ['Tira una moneda imaginaria, la cual puede caer en cara o cruz (head o tails).'],
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
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
        const userSide = args[0]?.replace(/^(h|head)$/i, 'head').replace(/^(t|tails)$/i, 'tails');
        const user = await Utils.userFetch(msg.author.id, msg.guildId);
        const formatedCoins = await Utils.setCoinsFormat(args[1], user);
        const betCoins = Math.round(formatedCoins);

        if (isNaN(betCoins)) {
            return Utils.send(msg, `Tienes que colocar una cantidad de ${guild.coin} valida!`)
        } else if (user.coins < betCoins) {
            return Utils.send(msg, `No puedes apostar **más ${guild.coin}** de las que posees actualmente!`)
        } else if (betCoins < guild.minimumBet) {
            return Utils.send(msg, `No puedes apostar menos de **${Utils.formatNumber(guild.minimumBet)} ${guild.coin}**!`)
        } else if (userSide !== 'head' && userSide !== 'tails') {
            return Utils.send(msg, `Tienes que colocar uno de los dos lados de la moneda **[h/t]** o **[head/tails]**!`)
        }

        Utils.setCooldown('coinflip', msg.author.id, msg.guildId);

        const side = Utils.random(['head', 'tails']);


        const embed = new EmbedBuilder()
            .setAuthor({ name: client.user.username, iconURL: client.user.avatarURL() })
            .setDescription(`en la moneda Salió **${side}**`)

        if (side === userSide) {
            embed.setColor(0x00ff00).addFields([{ name: 'Ganaste!!', value: `Has ganado **${betCoins}** ${guild.coin}` }]);
            Utils.addCoins(msg.author.id, msg.guildId, betCoins);
        } else {
            embed.setColor(0xff0000).addFields([{ name: 'Perdiste...', value: `Lastimosamente has perdido **${betCoins}** ${guild.coin}` }]);
            Utils.removeCoins(msg.author.id, msg.guildId, betCoins);
        }

        Utils.send(msg, { embeds: [embed] })
    }
}
