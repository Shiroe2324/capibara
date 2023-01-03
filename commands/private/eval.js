const Discord = require('discord.js');
const { PermissionFlagsBits, Message, Client, codeBlock } = Discord;
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

        const command = async (name, arg) => {
            const cmd = client.commands.get(name) || client.commands.find((c) => c.aliases.includes(name));
            if (!cmd) return 'no se encontró ningún comando con ese nombre.';
            return await cmd.execute(msg, arg, client);
        };

        try {
            const evaled = await eval(code);
            const result = inspect(evaled, { depth: 0 });

            const results = Utils.separateString(1990, result);
            for (const x of results) {
                msg.channel.send(codeBlock('js', x));
            }
            
        } catch (err) {
            msg.channel.send(codeBlock('js', err));
        }
    }
}