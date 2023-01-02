const Discord = require('discord.js');
const { PermissionFlagsBits, Message, Client } = Discord;
const { inspect } = require('util');
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
    name: 'eval',
    usage: 'eval [code]',
    aliases: ['e'],
    cooldown: 0,
    category: 'privada',
    description: 'Evalua un codigo colocado y retorna dicho codigo',
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
        const code = args.join(" ");
        if (!code) return msg.channel.send("???");

        try {
            const evaled = await eval(code);
            const result = inspect(evaled, { depth: 0 });

            if (result.length <= 2000) {
                msg.channel.send(Discord.codeBlock('js', result));
            } else {
                msg.channel.send(Discord.codeBlock('yaml', 'el resultado es muy largo'));
            }
        } catch (err) {
            msg.channel.send(Discord.codeBlock('js', err));
        }
    }
}