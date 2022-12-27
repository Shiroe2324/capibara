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
    name: 'balance',
    usage: 'balance',
    aliases: ['bal'],
    cooldown: 1000,
    category: 'economia',
    description: 'Muestra tu balance (global y del servidor).',
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
        Utils.setCooldown('balance', msg.author.id);

        const globalUser = await Utils.userFetch(msg.author.id, 'global');
        const guildUser = await Utils.userFetch(msg.author.id, msg.guild.id);
        const guild = await Utils.guildFetch(msg.guild.id);

        const embed = new EmbedBuilder()
            .setTitle('Tu balance es')
            .setDescription(`**${Utils.coin}**: ${globalUser.coins}\n**${guild.coinName}**: ${guildUser.coins}`)
            .setColor(Utils.color);

        msg.reply({ embeds: [embed] })
    }
}