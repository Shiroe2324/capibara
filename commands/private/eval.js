const Discord = require('discord.js');
const { inspect } = require('util');

module.exports = {
    name: 'eval',
    aliases: ['e'],
    cooldown: 0,
    onlyCreator: true,
    botPermissions: [],
    userPermissions: [],
    execute: async (msg, args, client, color, Utils) => {
        const helper = new Utils(msg, args, client); // clase inciada con funciones de ayuda

        const code = args.join(" "); // codigo a evaluar 
        if (!code) return msg.channel.send("???"); // verificador si se colocó el codigo

        try {
            const evaled = await eval(code); // codigo evaluado
            const result = inspect(evaled, { depth: 0 }); // resultado del codigo evaluado

            // verificador si el mensaje no se pasa del limite de caracteres
            if (result.length <= 2000) {
                msg.channel.send(Discord.codeBlock('js', result))
            } else {
                msg.channel.send(Discord.codeBlock('yaml', 'el resultado es muy largo'))
            }
        } catch (err) {
            msg.channel.send(Discord.codeBlock('js', err)) // mensaje cuando el codigo evaluado tiene un error
        }
    }
}