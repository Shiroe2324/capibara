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
    name: 'setprefix',
    usage: 'setprefix [prefix]',
    aliases: ['prefix'],
    cooldown: 10000,
    category: 'administracion',
    description: 'Actualiza el prefix del bot en el servidor.',
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks
    ],
    userPermissions: [PermissionFlagsBits.Administrator],

    /**
     * funcion con el codigo a ejecutar del comando.
     * @param {Message} msg - El mensaje enviado por el usuario.
     * @param {string[]} args - Los argumentos del mensaje enviado por el usuario.
     * @param {Client} client - El cliente del bot.
     */
    execute: async (msg, args, client) => {
        const guild = await Utils.guildFetch(msg.guild.id);

        if (!args[0]) {
            return msg.channel.send('El prefix debe tener al menos 1 caracter.');    
        } else if (args[0].length > 16) {
            return msg.channel.send('El prefix debe tener menos de 16 caracteres.');    
        } else if (guild.prefix === args[0]) {
            return msg.channel.send('El prefix colocado es el actual prefix del servidor.'); 
        }
        
        Utils.setCooldown('emojis', msg.author.id);

        guild.prefix = args[0];
        await guild.save(); 

        msg.reply(`El prefix se ha actualizado correctamente a \`${args[0]}\`.`);
    }
}