const { PermissionFlagsBits, Message, Client, EmbedBuilder } = require('discord.js');
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
    name: 'dice',
    usage: 'dice [cantidad]',
    aliases: [],
    cooldown: 10000,
    category: 'economia',
    description: 'Lanza un dado de 6 caras.\nSe gana si la cara en la que cae es 4, 5 o 6.\nSi la cara es 4 se ganar un cuarto de lo apostado, si la cara es 5 se gana la mitad de lo apostado, si la cara es 6 se gana todo lo apostado.',
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

        Utils.setCooldown('dice', msg.author.id); // se establece el cooldown

        const dice = Math.floor(Math.random() * 6) + 1; // se genera un dado aleatorio de 6 caras
        const diceResult = [];
        let multiplier = 0;
        for (let i = 0; i < dice; i++) {
            diceResult.push(guild.coinName);
        }

        switch (dice) {
            case 6: multiplier = 1; break;
            case 5: multiplier = 0.5; break;
            case 4: multiplier = 0.25; break;
        }

        const winnerEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setAuthor({ name: `Dado de ${msg.author.tag}`, iconURL: msg.author.avatarURL({ dynamic: true }) })
            .setDescription(`${diceResult.join(' ')}`)
            .addFields([{ name: `🎲 - ${dice}`, value: `Has ganado ${betCoins * multiplier} ${guild.coinName}` }]);

        const loserEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setAuthor({ name: `Dado de ${msg.author.tag}`, iconURL: msg.author.avatarURL({ dynamic: true }) })
            .setDescription(`${diceResult.join(' ')}`)
            .addFields([{ name: `🎲 - ${dice}`, value: `Has Perdido ${betCoins} ${guild.coinName} ...` }]);

        if (multiplier !== 0) {
            Utils.addCoins(msg.author.id, msg.guild, betCoins * multiplier);
            msg.channel.send({ embeds: [winnerEmbed] });
        } else {
            Utils.removeCoins(msg.author.id, msg.guild, betCoins);
            msg.channel.send({ embeds: [loserEmbed] });
        }
    }
}