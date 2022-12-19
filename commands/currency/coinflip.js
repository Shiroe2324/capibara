const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'coinflip',
    usage: 'coinflip [head|tails] [cantidad] (-s)',
    aliases: ['cf'],
    cooldown: 5000,
    category: 'economia',
    description: 'Tira una moneda imaginaria, la cual puede caer en cara o cruz (head o tails).\nPuedes colocar **-s** al final para apostar monedas del servidor.',
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.UseExternalEmojis
    ],
    userPermissions: [],
    execute: async (msg, args, client, Utils) => {
        let guild = 'global'; // base de datos donde se guardarán las monedas
        let coinsName = 'capicoins'; // el tipo de moneda usada

        // se verifica si se usarán monedas del servidor o globales
        if (args[2] === '-s') {
            guild = msg.guild.id;
            coinsName = 'servercoins'
        }

        const userSide = args[1]?.replace(/^h|head$/i, 'head').replace(/^t|tails$/i, 'tails'); // el lado escogido por el usuario ['head', 'tails']
        const user = await Utils.userFetch(msg.author.id, guild); // base de datos del usuario
        const formatedCoins = await Utils.setCoinsFormat(user, args[0]); // se formatean las monedas dadas
        const betCoins = Math.round(formatedCoins); // las se redondean a un número entero las monedas dadas

        // se verifica si la cantidad de monedas dadas es numero, si el usuario tiene las monedas suficientes, o si apuesta más de 20 monedas
        if (isNaN(betCoins)) {
            return msg.reply(`Tienes que colocar una cantidad de ${coinsName} valida!`)
        } else if (user.coins < betCoins) {
            return msg.reply(`No puedes apostar **más ${coinsName}** de las que posees actualmente!`);
        } else if (betCoins < 20) {
            return msg.reply(`No puedes apostar menos de **20 ${coinsName}**!`);
        } else if (userSide !== 'head' && userSide !== 'tail') {
            return msg.reply(`Tienes que colocar uno de los dos lados de la moneda **[h/t]** o **[head/tails]**!`);
        }

        Utils.setCooldown('coinflip', msg.author.id); // se establece el cooldown

        const side = Utils.random(['head', 'tails']); // el lado escogido por el sistema

        // embed del resultado
        const embed = new EmbedBuilder()
            .setAuthor({ name: msg.author.tag, iconURL: msg.author.avatarURL({ dynamic: true }) })
            .setDescription(`en la moneda Salió **${side}**`)

        /*se verifica si el lado escogido por el usuario es el mismo escogido por el sistema, si es asi se le añaden las coins apostadas
        en caso contrario se le retiran las coins apostadas*/
        if (side === userSide) {
            embed.setColor(0x00ff00).addFields([{ name: 'Ganaste!!', value: `Has ganado **${betCoins}** ${coinsName}` }]);
            Utils.addCoins(msg.author.id, guild, betCoins);
        } else {
            embed.setColor(0xff0000).addFields([{ name: 'Perdiste...', value: `Lastimosamente has perdido **${betCoins}** ${coinsName}` }]);
            Utils.removeCoins(msg.author.id, guild, betCoins);
        }

        msg.reply({ embeds: [embed] }); // se envía el embed
    }
}