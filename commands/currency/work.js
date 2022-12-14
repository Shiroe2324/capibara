const { PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'work',
    aliases: [],
    cooldown: 300000,
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks
    ],
    userPermissions: [],
    execute: async (msg, args, client, Utils) => {
        Utils.setCooldown('work', msg.author.id); // se establece el cooldown

        const money = Math.floor(Math.random() * 401) + 100; // coins obtenidas (entre 100 a 500)
        const xp = Math.floor(Math.random() * 21) + 10; // xp optenidas (enre 10 a 30)

        // lista de los posibles mensajes
        const texts = [
            `**${msg.author.username}** trabajaste bañando capibaras y ganaste **${money}** capicoins y ${xp} de xp`,
            `**${msg.author.username}** trabajaste dandole de comer a los capibaras y ganaste **${money}** capicoins y ${xp} de xp`,
            `**${msg.author.username}** trabajaste limpiando el parque de los carpinchos y ganaste **${money}** capicoins y ${xp} de xp`,
            `**${msg.author.username}** jugaste con los carpinchos y el cuidador te dió **${money}** capicoins y ${xp} de xp como agradecimiento`
        ]

        Utils.addCoins(msg.author.id, msg.guild.id, money); // se añaden las coins a la base de datos del usuario en el servidor
        Utils.addCoins(msg.author.id, 'global', money); // se añaden las coins a la base de datos global del usuario
        const hasLeveledUp = await Utils.addXp(msg.author.id, xp); // se añade la xp a la base  de datos global del usuario y se confirma si sube de xp con las constante
        const message = texts[Math.floor(Math.random() * texts.length)] // se elige un mensaje de la lista aleatoriamente

        // se confirma si el usuario sube de nivel y se manda el mensaje
        if (hasLeveledUp) {
            const user = await Utils.userFetch(msg.author.id, 'global');
            msg.channel.send(`${message}\n\nFelicidades! Has subido a nivel **${user.level}!**`)
        } else {
            msg.channel.send(message)
        }
    }
}