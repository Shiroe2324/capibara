require('dotenv').config()
// ————————————————————— INICIO DEL BOT ————————————————————— //

const { Client, Collection, Events, PermissionFlagsBits, Message } = require('discord.js');
const handler = require('./handler'); // archivo de los comandos handler
const Utils = require('./utils'); // funciones de ayuda para programar
const client = new Client({ intents: 3276799 }); // client del bot (usuario de discord del bot)

client.snipes = new Collection(); // lista para guardar los mensajes eliminados
client.editsnipes = new Collection(); // lista para guardar los mensajes editados
client.commands = new Collection(); // lista de comandos para el handler
handler(client) // ejecución del sistema handler

// evento cuando el bot está listo
client.once('ready', async () => {
    console.log('ready')
});

// Evento cuando se genera un nuevo mensaje
client.on(Events.MessageCreate, async (msg) => {
    const guild = await Utils.guildFetch(msg.guild.id); // base de datos del servidor

    // filtro de mensajes
    if (msg.author.bot) return;
    if (!msg.content.startsWith(guild.prefix)) return;
    if (!msg.channel.permissionsFor(client.user).has(PermissionFlagsBits.SendMessages)) return;

    // nombre del comando ejecutado y sus argumentos
    const args = msg.content.slice(guild.prefix.length).trim().split(/\s+/g);
    const commandName = Utils.removeAccents(args.shift().toLowerCase());

    // bases de datos del usuario global
    const user = await Utils.userFetch(msg.author.id, 'global');

    // se verifica si el usuario está bloqueado del bot
    if (user.blacklist) return;

    // busqueda del codigo del comando por medio de su nombre o de algun alias
    const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases.includes(commandName));
    if (!command) return; // verificador si el comando ejecutado existe

    // verificador si el comando es solo para el creador del bot
    if (command.onlyCreator) {
        if (msg.author.id != process.env['OWNER']) return;
    }

    // verificador por si el usuario se encuentra con un comando activado
    if (Utils.activedCommand(msg.author.id)) {
        return msg.reply('Primero tienes que terminar tu comando anterior!');
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

    const userCooldown = user.cooldowns.get(command.name); // se obtiene el cooldown del usuario

    // se verifica si tiene cooldown en el comando, y si el tiempo actual es menor al tiempo restante
    if (userCooldown && (userCooldown + command.cooldown) > Date.now()) {
        return msg.reply(`Todavia no puedes ejecutar ese comando, tienes que esperar **${Utils.setTimeFormat((userCooldown + command.cooldown) + 1000)}** 🕗 más.`)
    }

    // ejecución del comando
    await command.execute(msg, args, client).catch((err) => console.error(err));
});

// evento cuando se elimina un mensaje
client.on(Events.MessageDelete, (msg) => {
    if (msg.author.bot) return; // se retorna si el author del mensaje es un bot
    client.snipes.set(msg.channel.id, { data: msg, time: Date.now() }); // se guarda la información del mensaje eliminado
});

// evento cuando se edita un mensaje
client.on(Events.MessageUpdate, (oldMessage, newMessage) => {
    if (oldMessage.author.bot) return; // se retorna si el autor del mensaje es un bot
    client.editsnipes.set(oldMessage.channel.id, { old: oldMessage, new: newMessage, time: Date.now() }); // se guarda la información del mensaje editado
});


// inicio de sesión del bot
client.login(process.env['TOKEN']);