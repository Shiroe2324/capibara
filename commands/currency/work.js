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
    description: 'Consigues monedas haciendo trabajos junto con capibaras.\nlas monedas conseguidas se añaden tanto a las globales como a las del servidor',
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
        Utils.setCooldown('work', msg.author.id); // se establece el cooldown

        const money = Utils.random(400) + 100; // coins obtenidas (entre 100 a 500)
        const xp = Utils.random(20) + 10; // xp optenidas (enre 10 a 30)

        // lista de los posibles mensajes
        const texts = [
            `**${msg.author.username}** trabajaste bañando capibaras y ganaste **${money}** capicoins y **${xp}** de xp`,
            `**${msg.author.username}** trabajaste dandole de comer a los capibaras y ganaste **${money}** capicoins y **${xp}** de xp`,
            `**${msg.author.username}** trabajaste limpiando el parque de los carpinchos y ganaste **${money}** capicoins y **${xp}** de xp`,
            `**${msg.author.username}** jugaste con los carpinchos y el cuidador te dió **${money}** capicoins y **${xp}** de xp como agradecimiento`
        ]

        Utils.addCoins(msg.author.id, msg.guild.id, money); // se añaden las coins a la base de datos del usuario en el servidor
        Utils.addCoins(msg.author.id, 'global', money); // se añaden las coins a la base de datos global del usuario
        const hasLeveledUp = await Utils.addXp(msg.author.id, xp); // se añade la xp a la base  de datos global del usuario y se confirma si sube de xp con las constante
        const message = Utils.random(texts); // se elige un mensaje de la lista aleatoriamente

        // se confirma si el usuario sube de nivel y se manda el mensaje
        if (hasLeveledUp) {
            const user = await Utils.userFetch(msg.author.id, 'global');
            msg.channel.send(`${message}\n\nFelicidades! Has subido a nivel **${user.level}!**`)
        } else {
            msg.channel.send(message)
        }
    }
}