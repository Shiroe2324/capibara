const { PermissionFlagsBits, Message, Client, EmbedBuilder } = require('discord.js');
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
    name: 'dice',
    usage: 'dice [cantidad]',
    examples: ['dice 1k', 'dice 200'],
    aliases: [],
    cooldown: 10000,
    category: 'economia',
    description: [
        'Lanza un dado de 6 caras.',
        'Se gana si la cara en la que cae es 5 o 6.',
        'Si la cara es 5 se gana lo apostado, si la cara es 6 se gana el doble de lo apostado.'
    ],
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
        const user = await Utils.userFetch(msg.author.id, msg.guildId);
        const formatedCoins = await Utils.setCoinsFormat(user, args[0]);
        const betCoins = Math.round(formatedCoins);

        if (isNaN(betCoins)) {
            return Utils.send(msg, `Tienes que colocar una cantidad de ${guild.coin} valida!`)
        } else if (user.coins < betCoins) {
            return Utils.send(msg, `No puedes apostar **más ${guild.coin}** de las que posees actualmente!`)
        } else if (betCoins < 20) {
            return Utils.send(msg, `No puedes apostar menos de **20 ${guild.coin}**!`)
        }

        Utils.setCooldown('dice', msg.author.id, msg.guildId);

        const dice = Utils.random(6)
        const diceResult = [];
        let multiplier = 0;
        for (let i = 0; i < dice; i++) {
            diceResult.push(guild.coin);
        }

        switch (dice) {
            case 6: multiplier = 2; break;
            case 5: multiplier = 1; break;
        }

        const winnerEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setAuthor({ name: `Dado de ${msg.author.tag}`, iconURL: msg.author.avatarURL({ dynamic: true }) })
            .setDescription(`${diceResult.join(' ')}`)
            .addFields([{ name: `🎲 - ${dice}`, value: `Has ganado ${parseInt(betCoins * multiplier)} ${guild.coin}` }]);

        const loserEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setAuthor({ name: client.user.username, iconURL: client.user.avatarURL() })
            .setDescription(`${diceResult.join(' ')}`)
            .addFields([{ name: `🎲 - ${dice}`, value: `Has Perdido ${betCoins} ${guild.coin} ...` }]);

        if (multiplier !== 0) {
            Utils.addCoins(msg.author.id, msg.guildId, parseInt(betCoins * multiplier));
            Utils.send(msg, { embeds: [winnerEmbed] })
        } else {
            Utils.removeCoins(msg.author.id, msg.guildId, betCoins);
            Utils.send(msg, { embeds: [loserEmbed] })
        }
    }
}
