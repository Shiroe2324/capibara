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
    cooldown: 5000,
    category: 'economia',
    description: 'Un tragamonedas el cual se gana si hay una linea vertical, diagonal u horizontal de tres emojis iguales.\nCada emoji tiene su valor, van de 0.5, 1.0 y 2.0 de multiplicador.',
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
        const guild = await Utils.guildFetch(msg.guild.id); // base de datos del servidor
        const user = await Utils.userFetch(msg.author.id, msg.guild.id); // base de datos del usuario en el servidor
        const formatedCoins = await Utils.setCoinsFormat(user, args[0]); // se formatean las monedas dadas
        const betCoins = Math.round(formatedCoins); // las se redondean a un número entero las monedas dadas

        // se verifica si la cantidad de monedas dadas es numero, si el usuario tiene las monedas suficientes, o si apuesta más de 20 monedas
        if (isNaN(betCoins)) {
            return msg.reply(`Tienes que colocar una cantidad de ${guild.coinName} valida!`)
        } else if (user.coins < betCoins) {
            return msg.reply(`No puedes apostar **más ${guild.coinName}** de las que posees actualmente!`);
        } else if (betCoins < 20) {
            return msg.reply(`No puedes apostar menos de **20 ${guild.coinName}**!`);
        }

        Utils.setCooldown('slot', msg.author.id); // se establece el cooldown

        let multiplier = 0; // el multiplicador de monedas
        const deck = []; // la baraja aleatoria

        // los bordes de la tabla
        let border = ['✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️', '✖️'];
        
        // los emojis usados junto con su id, valor, e imagen
        const emojis = [
            { id: 1, image: '🍒', value: 0.5 },
            { id: 2, image: '🍊', value: 0.5 },
            { id: 3, image: '🍋', value: 0.5 },
            { id: 4, image: '🍉', value: 1 },
            { id: 5, image: '🍇', value: 1 },
            { id: 6, image: '🍓', value: 1 },
            { id: 7, image: '🎰', value: 2 }
        ];

        // se itera 9 veces aleatoriamente los emojis con sus propabilidades dadas 
        for (let x = 0; x < 9; x++) {
            deck.push(emojis[Utils.weightedRandom({ 0: 0.2, 1: 0.2, 2: 0.2, 3: 0.11, 4: 0.11, 5: 0.11, 6: 0.07  })]);
        }

        /*función para chequear si una linea gana, si es asi, se le agrega al multiplicador el valor de los emojis 
        de esa linea y se colocan en los bordes los emojis para avisar que ganó*/
        const checkWin = (card1, card2, card3, line1, line2, emoji1, emoji2) => {
            if (deck[card1].id === deck[card2].id && deck[card1].id === deck[card3].id) {
                multiplier += deck[card1].value;
                border[line1] = emoji1; 
                border[line2] = emoji2;
            }
        }

        // se chequea cada linea, tanto horizontalmente, verticalmente y diagonalmente
        checkWin(0, 1, 2, 1, 11, '➡️', '⬅️');
        checkWin(3, 4, 5, 2, 10, '➡️', '⬅️');
        checkWin(6, 7, 8, 3, 9, '➡️', '⬅️');
        checkWin(0, 3, 6, 15, 5, '⬇️', '⬆️');
        checkWin(1, 4, 7, 14, 6, '⬇️', '⬆️');
        checkWin(2, 5, 8, 13, 7, '⬇️', '⬆️');
        checkWin(2, 4, 6, 4, 12, '↗️', '↙️');
        checkWin(0, 4, 8, 0, 8, '↘️', '↖️');

        // la tabla jugada con sus bordes y emojis
        const table = [
            `${border[0]} ${border[15]} ${border[14]} ${border[13]} ${border[12]}`,
            `${border[1]} ${deck[0].image} ${deck[1].image} ${deck[2].image} ${border[11]}`,
            `${border[2]} ${deck[3].image} ${deck[4].image} ${deck[5].image} ${border[10]}`,
            `${border[3]} ${deck[6].image} ${deck[7].image} ${deck[8].image} ${border[9]}`,
            `${border[4]} ${border[5]} ${border[6]} ${border[7]} ${border[8]}`
        ];

        // el embed que contendrá la tabla
        const embed = new EmbedBuilder()
            .setAuthor({ name: `Slots`, iconURL: msg.author.avatarURL({ dynamic: true }) })
            .setDescription(table.join('\n'))

        /*se verifica si ganó como minimo en una linea, si es asi se coloca que ganó junto con la cantidad ganada y el embed de color verde y se le agregan las monedas
        en caso contrario, se le coloca que perdió junto con la cantidad de monedas perdidas y se le quitan las monedas apostadas*/
        if (multiplier === 0) {
            embed.setColor(0xff0000).addFields([{ name: 'Perdiste...', value: `Lastimosamente has perdido **${betCoins}** ${guild.coinName}` }]);
            Utils.removeCoins(msg.author.id, msg.guild.id, betCoins);
        } else {
            embed.setColor(0x00ff00).addFields([{ name: 'Ganaste!!', value: `Has ganado **${Math.floor(betCoins * multiplier)}** ${guild.coinName}` }]);
            Utils.addCoins(msg.author.id, msg.guild.id, Math.floor(betCoins * multiplier));
        }

        msg.reply({ embeds: [embed] }); // se envía el embed
    }
}