const { EmbedBuilder, PermissionFlagsBits, Message, Client } = require('discord.js');
const Utils = require('../../utils');

/**
 * @property name - El nombre del comando.
 * @property usage - La sintaxis en que se usa el comando.
 * @property aliases - Los aliases del comando.
 * @property cooldowns - el tiempo de cooldown del comando
 * @property category - El nombre de la categoría del comando.
 * @property description - La descripcion del comando.
 * @property onlyCreator - Verificador si el comando es solo para el creador del bot.
 * @property botPermissions - Lista de permisos del bot para el comando.
 * @property userPermissions - Lista de permisos del usuario para el comando.
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
     * funcion con el codigo a ejecutar del comando.
     * @param {Message} msg - El mensaje enviado por el usuario.
     * @param {string[]} args - Los argumentos del mensaje enviado por el usuario.
     * @param {Client} client - El cliente del bot.
     */
    execute: async (msg, args, client) => {
        const guild = await Utils.guildFetch(msg.guild.id);
        const user = await Utils.userFetch(msg.author.id, msg.guild.id);
        const formatedCoins = await Utils.setCoinsFormat(user, args[0]);
        const betCoins = Math.round(formatedCoins);

        if (isNaN(betCoins)) {
            return msg.reply(`Tienes que colocar una cantidad de ${guild.coin} valida!`)
        } else if (user.coins < betCoins) {
            return msg.reply(`No puedes apostar **más ${guild.coin}** de las que posees actualmente!`);
        } else if (betCoins < 20) {
            return msg.reply(`No puedes apostar menos de **20 ${guild.coin}**!`);
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
            Utils.removeCoins(msg.author.id, msg.guild.id, betCoins);
        } else {
            embed.setColor(0x00ff00).addFields([{ name: 'Ganaste!!', value: `Has ganado **${Math.floor(betCoins * multiplier)}** ${guild.coin}` }]);
            Utils.addCoins(msg.author.id, msg.guild.id, Math.floor(betCoins * multiplier));
        }

        msg.reply({ embeds: [embed] });
    }
}