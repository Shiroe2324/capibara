const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'slot',
    aliases: ['slots'],
    cooldown: 5,
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.UseExternalEmojis
    ],
    userPermissions: [],
    execute: async (msg, args, client, color, Utils) => {
        let guild = 'global';
        let coinsName = 'capicoins';
        if (args[1] === '-s') {
            guild = msg.guild.id;
            coinsName = 'servercoins'
        }

        const user = await Utils.userFetch(msg.author.id, guild);
        const betCoins = parseInt(args[0]);

        if (isNaN(args[0])) {
            return msg.reply(`Tienes que colocar una cantidad de ${coinsName} valida!`)
        } else if (user.coins < betCoins) {
            return msg.reply('No puedes apostar más capicoins de las que posees actualmente!');
        } else if (betCoins < 20) {
            return msg.reply('No puedes apostar menos de 20 capicoins!');
        }

        Utils.setCooldown('slot', msg.author.id)

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
        let lines = ['✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️'];

        for (let x = 0; x < 9; x++) {
            deck.push(emojis[Math.floor(Math.random() * emojis.length)]);
        }

        if (deck[0].id === deck[1].id && deck[0].id === deck[2].id) {
            multiplier += deck[0].value;
            lines[1] = '➡️';
            lines[6] = '⬅️';
        }
        if (deck[3].id === deck[4].id && deck[3].id === deck[5].id) {
            multiplier += deck[3].value;
            lines[2] = '➡️';
            lines[7] = '⬅️';
        }
        if (deck[6].id === deck[7].id && deck[6].id === deck[8].id) {
            multiplier += deck[6].value;
            lines[3] = '➡️';
            lines[8] = '⬅️';
        }
        if (deck[0].id === deck[4].id && deck[0].id === deck[8].id) {
            multiplier += deck[0].value;
            lines[0] = '↘️';
            lines[9] = '↖️';
        }
        if (deck[2].id === deck[4].id && deck[2].id === deck[6].id) {
            multiplier += deck[2].value;
            lines[4] = '↗️';
            lines[5] = '↙️';
        }

        const table = [
            `${lines[0]} ✖️ ✖️ ✖️ ${lines[5]}`,
            `${lines[1]} ${deck[0].image} ${deck[1].image} ${deck[2].image} ${lines[6]}`,
            `${lines[2]} ${deck[3].image} ${deck[4].image} ${deck[5].image} ${lines[7]}`,
            `${lines[3]} ${deck[6].image} ${deck[7].image} ${deck[8].image} ${lines[8]}`,
            `${lines[4]} ✖️ ✖️ ✖️ ${lines[9]}`
        ];
        const embed = new EmbedBuilder()
            .setAuthor({ name: `Slots`, iconURL: msg.author.avatarURL({ dynamic: true }) })
            .setDescription(table.join('\n'))

        if (multiplier === 0) {
            embed.setColor(0xff0000).addFields([{ name: 'Perdiste...', value: `Lastimosamente has perdido **${betCoins}** capicoins`}]);
            Utils.removeCoins(msg.author.id, guild, betCoins);
        } else {
            embed.setColor(0x00ff00).addFields([{ name: 'Ganaste!!', value: `Has ganado **${betCoins+(betCoins*multiplier)}** capicoins`}]);
            Utils.addCoins(msg.author.id, guild, betCoins);
        }

        msg.reply({ embeds: [embed] });
    }
}