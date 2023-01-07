const Discord = require('discord.js');
const { PermissionFlagsBits, Message, Client, codeBlock } = Discord;
const { inspect } = require('util');
const Utils = require('../../utils');

/**
 * @property name - The name of the command.
 * @property usage - The syntax in which the command is used.
 * @property examples - Examples of how to use the command.
 * @property aliases - The aliases of the command.
 * @property cooldown - the cooldown time of the command
 * @property category - The name of the command category.
 * @property description - The description of the command.
 * @property onlyCreator - Check if the command is only for the creator of the bot.
 * @property botPermissions - List of bot permissions for the command.
 * @property userPermissions - List of user permissions for the command.
 */
module.exports = {
    name: 'eval',
    usage: 'eval [code]',
    examples: ['eval ["a", "e", "i"].length'],
    aliases: ['e'],
    cooldown: 0,
    category: 'privada',
    description: ['Evalua un codigo colocado y retorna dicho codigo'],
    onlyCreator: true,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages
    ],
    userPermissions: [],

    /**
     * function with the code to execute the command.
     * @param {Message} msg - The message sent by the user.
     * @param {string[]} args - The arguments of the message sent by the user.
     * @param {Client} client - The bot's client.
     */
    execute: async (msg, args, client) => {
        const code = args.join(" ");
        if (!code) return Utils.send(msg, "???");

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
                Utils.send(msg, codeBlock('js', x));
            }
            
        } catch (err) {
            Utils.send(msg, codeBlock('js', err));
        }
    }
}