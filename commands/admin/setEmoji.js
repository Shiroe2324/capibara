const { PermissionFlagsBits, Message, Client, emoji } = require('discord.js');
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
    name: 'setemoji',
    usage: 'setemoji [emoji|default]',
    aliases: [],
    cooldown: 10000,
    category: 'administracion',
    description: 'Especifica que emoji se debe de usar como moneda en el servidor.\nSe puede colocar "default" para reestablecer al emoji predeterminado.',
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.UseExternalEmojis
    ],
    userPermissions: [
        PermissionFlagsBits.Administrator,
    ],

    /**
     * funcion con el codigo a ejecutar del comando.
     * @param {Message} msg - El mensaje enviado por el usuario.
     * @param {string[]} args - Los argumentos del mensaje enviado por el usuario.
     * @param {Client} client - El cliente del bot.
     */
    execute: async (msg, args, client) => {
        const guild = await Utils.guildFetch(msg.guild.id);

        if (!args[0]) return msg.reply('Tienes que colocar un emoji!').catch(e => console.log(e));

        if (args[0] === 'default') {
            if (guild.coin === process.env['COIN_NAME']) return msg.reply('Ya se está usando el emoji predeterminado!');
            guild.coin = process.env['COIN_NAME'];
            await guild.save();
            return msg.reply('Se ha restablecido el emoji predeterminado.').catch(e => console.log(e));
        }

        const emoji = Utils.emoji(guild.coin, client);

        if (!emoji.isEmoji) return msg.reply('Tienes que especificar un emoji válido!').catch(e => console.log(e));
        if (emoji.type === 'guild' && !emoji.existInBot) return msg.reply('Tienes que colocar un emoji predeterminado o que esté en un servidor donde yo esté!').catch(e => console.log(e));
        if (args[0] === guild.coin) return msg.reply('Ya se está usando ese emoji!').catch(e => console.log(e));

        guild.coin = args[0];
        await guild.save();

        msg.reply(`Se ha actualizado el emoji de moneda a ${args[0]}.`).catch(e => console.log(e));
    }
}