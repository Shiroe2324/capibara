const { PermissionFlagsBits, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'help',
    usage: 'help (comando|categoria)',
    aliases: ['h'],
    cooldown: 5000,
    category: 'utilidad',
    description: 'Muestra infomación sobre un comando o categoria en especifico.',
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,  
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.UseExternalEmojis
    ],
    userPermissions: [],
    execute: async (msg, args, client, Utils) => {
        
    }
}