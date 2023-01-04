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
    name: 'blacklist',
    usage: 'blacklist [usuario]',
    aliases: ['bl'],
    cooldown: 0,
    category: 'privada',
    description: 'Coloca en blacklist a un usuario',
    onlyCreator: true,
    botPermissions: [],
    userPermissions: [],

    /**
     * funcion con el codigo a ejecutar del comando.
     * @param {Message} msg - El mensaje enviado por el usuario.
     * @param {string[]} args - Los argumentos del mensaje enviado por el usuario.
     * @param {Client} client - El cliente del bot.
     */
    execute: async (msg, args, client) => {
        const user = client.users.fetch(args[0]);
        if (!user) return msg.reply('El usuario no existe.').catch(e => console.log(e));
     
        const userdb = await Utils.user(args[0], 'global');

        userdb.blacklist = true;
        await userdb.save();
        msg.reply('El usuario se ha añadido a la blacklist.').catch(e => console.log(e));
    }
}