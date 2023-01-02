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
    name: 'coinflip',
    usage: 'coinflip [head|tails] [cantidad]',
    aliases: ['cf'],
    cooldown: 5000,
    category: 'economia',
    description: 'Tira una moneda imaginaria, la cual puede caer en cara o cruz (head o tails).',
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
        const userSide = args[0]?.replace(/^(h|head)$/i, 'head').replace(/^(t|tails)$/i, 'tails');
        const user = await Utils.userFetch(msg.author.id, msg.guild.id);
        const formatedCoins = await Utils.setCoinsFormat(user, args[1]); 
        const betCoins = Math.round(formatedCoins);

        if (isNaN(betCoins)) {
            return msg.reply(`Tienes que colocar una cantidad de ${guild.coinName} valida!`)
        } else if (user.coins < betCoins) {
            return msg.reply(`No puedes apostar **más ${guild.coinName}** de las que posees actualmente!`);
        } else if (betCoins < 20) {
            return msg.reply(`No puedes apostar menos de **20 ${guild.coinName}**!`);
        } else if (userSide !== 'head' && userSide !== 'tails') {
            return msg.reply(`Tienes que colocar uno de los dos lados de la moneda **[h/t]** o **[head/tails]**!`);
        }

        Utils.setCooldown('coinflip', msg.author.id);

        const side = Utils.random(['head', 'tails']);


        const embed = new EmbedBuilder()
            .setAuthor({ name: msg.author.tag, iconURL: msg.author.avatarURL({ dynamic: true }) })
            .setDescription(`en la moneda Salió **${side}**`)

        if (side === userSide) {
            embed.setColor(0x00ff00).addFields([{ name: 'Ganaste!!', value: `Has ganado **${betCoins}** ${guild.coinName}` }]);
            Utils.addCoins(msg.author.id, msg.guild.id, betCoins);
        } else {
            embed.setColor(0xff0000).addFields([{ name: 'Perdiste...', value: `Lastimosamente has perdido **${betCoins}** ${guild.coinName}` }]);
            Utils.removeCoins(msg.author.id, msg.guild.id, betCoins);
        }

        msg.reply({ embeds: [embed] });
    }
}