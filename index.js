require('dotenv').config()
// ————————————————————— INICIO DEL BOT ————————————————————— //

const { Client, Collection, Events } = require('discord.js');
const handler = require('./handler'); // archivo de los comandos handler
const Utils = require('./utils'); // funciones de ayuda para programar
const client = new Client({ intents: 3276799 }); // client del bot (usuario de discord del bot)

client.commands = new Collection(); // lista de comandos para el handler
handler(client) // ejecución del sistema handler

// evento cuando el bot está listo
client.once('ready', async () => {
    console.log('ready')
});

// evento cuando se genera un nuevo mensaje
client.on(Events.MessageCreate, async (msg) => {
    const guild = await Utils.guildFetch(msg.guild.id); // base de datos del servidor
    const prefix = guild.prefix; // prefix del bot

    // filtro de mensajes
    if (msg.author.bot) return;
    if (!msg.content.startsWith(prefix)) return;

    // nombre del comando ejecutado y sus argumentos
    const args = msg.content.slice(prefix.length).trim().split(/\s+/g);
    const commandName = Utils.removeAccents(args.shift().toLowerCase());

    // bases de datos del usuario global
    const globalUser = await Utils.userFetch(msg.author.id, 'global');

    // se verifica si el usuario está bloqueado del bot
    if (globalUser.blacklist) return;

    // busqueda del codigo del comando por medio de su nombre o de algun alias
    const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases.includes(commandName));
    if (!command) return; // verificador si el comando ejecutado existe

    // verificador si el comando es solo para el creador del bot
    if (command.onlyCreator) {
        if (msg.author.id != process.env['OWNER']) return;
    }

    // verificador de los permisos del bot en el canal
    if (!msg.channel.permissionsFor(client.user).has(command.botPermissions)) {
        const missingPermissions = msg.channel.permissionsFor(client.user).missing(command.botPermissions).map(permission => `\`${Utils.Permissions[permission]}\``);
        return msg.reply(`No puedo ejecutar ese comando, me hacen falta los siguientes permisos: ${missingPermissions.join(', ')}`)
    }

    // verificador de los permisos del usuario en el canal
    if (!msg.channel.permissionsFor(msg.author).has(command.userPermissions)) {
        const missingPermissions = msg.channel.permissionsFor(msg.author).missing(command.userPermissions).map(permission => `\`${Utils.Permissions[permission]}\``);
        return msg.reply(`No puedes ejecutar ese comando, te hacen falta los siguientes permisos: ${missingPermissions.join(', ')}`)
    }

    const userCooldown = globalUser.cooldowns.get(command.name); // se obtiene el cooldown del usuario

    // se verifica si tiene cooldown en el comando, y si el tiempo actual es menor al tiempo restante
    if (userCooldown && (userCooldown + command.cooldown) > Date.now()) {
        return msg.reply(`Todavia no puedes ejecutar ese comando, tienes que esperar **${Utils.setTimeFormat((userCooldown + command.cooldown) + 1000)}** 🕗 más.`)
    }

    // ejecución del comando
    command.execute(msg, args, client).catch((err) => console.error(err));
});

// inicio de sesión del bot
client.login(process.env.TOKEN);