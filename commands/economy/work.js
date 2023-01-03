const { PermissionFlagsBits, Message, Client } = require('discord.js');
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
    name: 'work',
    usage: 'work',
    aliases: [],
    cooldown: 300000,
    category: 'economia',
    description: 'Consigues {coins} haciendo trabajos junto con capibaras.',
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks
    ],
    userPermissions: [],

    /**
     * funcion con el codigo a ejecutar del comando.
     * @param {Message} msg - El mensaje enviado por el usuario.
     * @param {string[]} args - Los argumentos del mensaje enviado por el usuario.
     * @param {Client} client - El cliente del bot.
     */
    execute: async (msg, args, client) => {
        Utils.setCooldown('work', msg.author.id);

        const guild = await Utils.guildFetch(msg.guild.id);
        const money = Utils.random(400) + 100;

        const texts = [
            `**${msg.author.username}** trabajaste bañando capibaras y ganaste **${money}** ${guild.coin}`,
            `**${msg.author.username}** trabajaste dandole de comer a los capibaras y ganaste **${money}** ${guild.coin}`,
            `**${msg.author.username}** trabajaste limpiando el parque de los carpinchos y ganaste **${money}** ${guild.coin}`,
            `**${msg.author.username}** jugaste con los carpinchos y el cuidador te dió **${money}** ${guild.coin} como agradecimiento`
        ];

        Utils.addCoins(msg.author.id, msg.guild.id, money); 
        const message = Utils.random(texts);

        msg.channel.send(message)
    }
}