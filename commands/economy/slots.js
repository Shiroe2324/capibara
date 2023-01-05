const { EmbedBuilder, PermissionFlagsBits, Message, Client } = require('discord.js');
const Utils = require('../../utils');

/**
 * @property name - The name of the command.
 * @property usage - The syntax in which the command is used.
 * @property aliases - The aliases of the command.
 * @property cooldown - the cooldown time of the command
 * @property category - The name of the command category.
 * @property description - The description of the command.
 * @property onlyCreator - Check if the command is only for the creator of the bot.
 * @property botPermissions - List of bot permissions for the command.
 * @property userPermissions - List of user permissions for the command.
 */
module.exports = {
    name: 'slot',
    usage: 'slot [cantidad]',
    aliases: ['slots'],
    cooldown: 10000,
    category: 'economia',
    description: 'Un tragamonedas el cual se gana si hay una linea vertical, diagonal u horizontal de tres emojis iguales.\nCada emoji tiene su valor, van de 1, 2, 4 y hasta 5 de multiplicador.',
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

        Utils.setCooldown('slot', msg.author.id);

        let multiplier = 0;
        const deck = [];

        let border = ['✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️'];

        const emojis = [
            { id: 1, image: '🍒', value: 1 },
            { id: 2, image: '🍊', value: 1 },
            { id: 3, image: '🍋', value: 1 },
            { id: 4, image: '🍉', value: 2 },
            { id: 5, image: '🍇', value: 2 },
            { id: 6, image: '🍓', value: 2 },
            { id: 7, image: '🎰', value: 4 },
            { id: 0, image: guild.coin, value: 5 }
        ];

        for (let x = 0; x < 9; x++) {
            deck.push(emojis[Utils.weightedRandom({ 0: 0.2, 1: 0.2, 2: 0.2, 3: 0.1, 4: 0.1, 5: 0.1, 6: 0.055, 7: 0.045 })]);
        }

        const checkWin = (card1, card2, card3, line1, line2, emoji1, emoji2) => {
            if (deck[card1].id === 0 && deck[card2].id === deck[card3].id || deck[card1].id === 0 && deck[card3].id === 0) {
                multiplier += deck[card2].value;
                border[line1] = emoji1;
                border[line2] = emoji2;
            } else if (deck[card2].id === 0 && deck[card1].id === deck[card3].id || deck[card1].id === 0 && deck[card2].id === 0) {
                multiplier += deck[card3].value;
                border[line1] = emoji1;
                border[line2] = emoji2;
            } else if (deck[card3].id === 0 && deck[card1].id === deck[card2].id || deck[card2].id === 0 && deck[card3].id === 0) {
                multiplier += deck[card1].value;
                border[line1] = emoji1;
                border[line2] = emoji2;
            } else if (deck[card1].id === deck[card2].id && deck[card1].id === deck[card3].id) {
                multiplier += deck[card1].value;
                border[line1] = emoji1;
                border[line2] = emoji2;
            }
        }

        checkWin(0, 1, 2, 1, 11, '➡️', '⬅️');
        checkWin(3, 4, 5, 2, 10, '➡️', '⬅️');
        checkWin(6, 7, 8, 3, 9, '➡️', '⬅️');
        checkWin(0, 3, 6, 15, 5, '⬇️', '⬆️');
        checkWin(1, 4, 7, 14, 6, '⬇️', '⬆️');
        checkWin(2, 5, 8, 13, 7, '⬇️', '⬆️');
        checkWin(2, 4, 6, 4, 12, '↗️', '↙️');
        checkWin(0, 4, 8, 0, 8, '↘️', '↖️');

        const table = [
            `${border[0]} ${border[15]} ${border[14]} ${border[13]} ${border[12]}`,
            `${border[1]} ${deck[0].image} ${deck[1].image} ${deck[2].image} ${border[11]}`,
            `${border[2]} ${deck[3].image} ${deck[4].image} ${deck[5].image} ${border[10]}`,
            `${border[3]} ${deck[6].image} ${deck[7].image} ${deck[8].image} ${border[9]}`,
            `${border[4]} ${border[5]} ${border[6]} ${border[7]} ${border[8]}`
        ];

        const embed = new EmbedBuilder()
            .setAuthor({ name: client.user.username, iconURL: client.user.avatarURL() })
            .setDescription(table.join('\n'))

        if (multiplier === 0) {
            embed.setColor(0xff0000).addFields([{ name: 'Perdiste...', value: `Lastimosamente has perdido **${betCoins}** ${guild.coin}` }]);
            Utils.removeCoins(msg.author.id, msg.guildId, betCoins);
        } else {
            embed.setColor(0x00ff00).addFields([{ name: 'Ganaste!!', value: `Has ganado **${Math.floor(betCoins * multiplier)}** ${guild.coin}` }]);
            Utils.addCoins(msg.author.id, msg.guildId, Math.floor(betCoins * multiplier));
        }

        Utils.send(msg, { embeds: [embed] })
    }
}