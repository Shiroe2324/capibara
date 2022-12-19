const { EmbedBuilder, PermissionFlagsBits, Embed } = require('discord.js');

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
    execute: async (msg, args, client, Utils) => {
        Utils.setCooldown('balance', msg.author.id);

        const globalUser = await Utils.userFetch(msg.author.id, 'global');
        const guildUser = await Utils.userFetch(msg.author.id, msg.guild.id);

        const embed = new EmbedBuilder()
            .setTitle('Tu balance es')
            .setDescription(`capicoins: ${globalUser.coins}\nservercoins: ${guildUser.coins}`)
            .setColor(Utils.color);

        msg.reply({ embeds: [embed] })
    }
}