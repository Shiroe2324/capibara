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
    description: 'Lanza un dado de 6 caras.\nSe gana si la cara en la que cae es 4, 5 o 6.\nSi la cara es 4 se ganar la mitad de lo apostado, si la cara es 5 se gana lo apostado, si la cara es 6 se gana el doble de lo apostado.',
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

        Utils.setCooldown('dice', msg.author.id);

        const dice = Utils.random(6)
        const diceResult = [];
        let multiplier = 0;
        for (let i = 0; i < dice; i++) {
            diceResult.push(guild.coin);
        }

        switch (dice) {
            case 6: multiplier = 2; break;
            case 5: multiplier = 1; break;
            case 4: multiplier = 0.5; break;
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
            Utils.addCoins(msg.author.id, msg.guild.id, parseInt(betCoins * multiplier));
            msg.channel.send({ embeds: [winnerEmbed] });
        } else {
            Utils.removeCoins(msg.author.id, msg.guild.id, betCoins);
            msg.channel.send({ embeds: [loserEmbed] });
        }
    }
}