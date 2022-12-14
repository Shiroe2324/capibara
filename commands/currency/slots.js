const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'slot',
    aliases: ['slots'],
    cooldown: 5000,
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.UseExternalEmojis
    ],
    userPermissions: [],
    execute: async (msg, args, client, Utils) => {
        let guild = 'global';
        let coinsName = 'capicoins';
        if (args[1] === '-s') {
            guild = msg.guild.id;
            coinsName = 'servercoins'
        }

        const user = await Utils.userFetch(msg.author.id, guild);
        const formatedCoins = await Utils.setCoinsFormat(user, args[0]);
        const betCoins = Math.round(formatedCoins);

        if (isNaN(betCoins)) {
            return msg.reply(`Tienes que colocar una cantidad de ${coinsName} valida!`)
        } else if (user.coins < betCoins) {
            return msg.reply(`No puedes apostar más ${coinsName} de las que posees actualmente!`);
        } else if (betCoins < 20) {
            return msg.reply(`No puedes apostar menos de 20 ${coinsName}!`);
        }

        Utils.setCooldown('slot', msg.author.id);

        let multiplier = 0;
        const deck = [];
        const emojis = [
            { id: 1, image: '🍒', value: 0.5 },
            { id: 2, image: '🍊', value: 0.5 },
            { id: 3, image: '🍋', value: 0.5 },
            { id: 4, image: '🍉', value: 1 },
            { id: 5, image: '🍇', value: 1 },
            { id: 6, image: '🍓', value: 1 },
            { id: 7, image: '🎰', value: 2 }
        ];
        let lines = ['✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️'];

        for (let x = 0; x < 9; x++) {
            deck.push(emojis[Utils.weightedRandom({ 0: 0.2, 1: 0.2, 2: 0.2, 3: 0.11, 4: 0.11, 5: 0.11, 6: 0.07  })]);
        }


        const checkWin = (card1, card2, card3, line1, line2, emoji1, emoji2) => {
            if (deck[card1].id === deck[card2].id && deck[card1].id === deck[card3].id) {
                multiplier += deck[card1].value;
                lines[line1] = emoji1;
                lines[line2] = emoji2;
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
            `${lines[0]} ${lines[15]} ${lines[14]} ${lines[13]} ${lines[12]}`,
            `${lines[1]} ${deck[0].image} ${deck[1].image} ${deck[2].image} ${lines[11]}`,
            `${lines[2]} ${deck[3].image} ${deck[4].image} ${deck[5].image} ${lines[10]}`,
            `${lines[3]} ${deck[6].image} ${deck[7].image} ${deck[8].image} ${lines[9]}`,
            `${lines[4]} ${lines[5]} ${lines[6]} ${lines[7]} ${lines[8]}`
        ];

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Slots`, iconURL: msg.author.avatarURL({ dynamic: true }) })
            .setDescription(table.join('\n'))

        if (multiplier === 0) {
            embed.setColor(0xff0000).addFields([{ name: 'Perdiste...', value: `Lastimosamente has perdido **${betCoins}** ${coinsName}` }]);
            Utils.removeCoins(msg.author.id, guild, betCoins);
        } else {
            embed.setColor(0x00ff00).addFields([{ name: 'Ganaste!!', value: `Has ganado **${Math.floor(betCoins * multiplier)}** ${coinsName}` }]);
            Utils.addCoins(msg.author.id, guild, Math.floor(betCoins * multiplier));
        }

        msg.reply({ embeds: [embed] });
    }
}