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
    cooldown: 5000,
    category: 'economia',
    description: 'Muestra la cantidad de {coins} que tienes en el servidor.',
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
        Utils.activedCommand(msg.author.id, 'add');
        const search = await Utils.findMember(msg, args, true); // funcion para buscar miembros en un server
        Utils.activedCommand(msg.author.id, 'remove');

        if (search.error) return search.message({ content: search.messageError, embeds: [], components: [] }); // verificador si hay algun error al buscar el miembro

        Utils.setCooldown('balance', msg.author.id);

        const user = await Utils.userFetch(search.member.id, msg.guild.id);
        const guild = await Utils.guildFetch(search.member.id);

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Balance de ${search.member.user.tag}`, iconURL: search.member.user.avatarURL({ dynamic: true }) }, msg.author.displayName)
            .setTitle(`**${user.coins}** ${guild.coinName}`)
            .setColor(Utils.color);

        msg.reply({ embeds: [embed] })
    }
}