require('dotenv').config();

// ————————————————————— BOT START ————————————————————— //
const { Client, Collection, Events, PermissionFlagsBits, ChannelType, ActivityType, IntentsBitField } = require('discord.js');
const http = require('http');
const handler = require('./handler'); // handler commands
const Utils = require('./utils'); // help functions
const client = new Client({ intents: 3276799 }); // bot client

client.snipes = new Collection(); // collection to save deleted messages
client.editsnipes = new Collection(); // collection to save edited messages
client.commands = new Collection(); // colecction of bot commands
handler(client); // system handler execution

process.on('unhandledRejection', (error) => {
    console.error(error);
});

// event when the bot is ready
client.once('ready', async () => {
    client.user.setActivity('Torneo de capibaras', { type: ActivityType.Competing }); // bot discord activity0
    http.createServer((req, res) => res.end('hello world')).listen(); // http server for bot maintenance
    console.log('ready');
});

// Event when a new message is generated
client.on(Events.MessageCreate, async (msg) => {
    const guild = await Utils.guildFetch(msg.guildId); // guild database

    // checker if used server coin no longer exists
    if (Utils.emoji(guild.coin, client).type === 'guild' && !Utils.emoji(guild.coin, client).existInBot) {
        guild.coin = process.env['COIN_NAME']; // add default coin
        await guild.save();
    }

    // message filter
    if (msg.author.bot) return;
    if (!msg.content.startsWith(guild.prefix)) return;
    if (msg.channel.type !== ChannelType.GuildText) return;
    if (!msg.channel.permissionsFor(client.user).has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel])) return;

    // name of the executed command and its arguments
    const args = msg.content.slice(guild.prefix.length).trim().split(/\s+/g);
    const commandName = Utils.removeAccents(args.shift().toLowerCase());

    // global user database
    const globalUser = await Utils.userFetch(msg.author.id, 'global');
    const guildUser = await Utils.userFetch(msg.author.id, msg.guildId);

    // check if the user is blocked from the bot
    if (globalUser.blacklist) return;

    // search for the command code by name or some alias
    const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases.includes(commandName));
    if (!command) return; // checker if the executed command does not exists

    // checker if command is only for bot creators
    if (command.onlyCreator) {
        if (!process.env['OWNERS'].split(' ').some(owner => msg.author.id === owner)) return;
    }

    // checker in case the user finds himself with an activated command
    if (Utils.activedCommand(msg.author.id)) {
        return Utils.send(msg, 'Primero tienes que terminar tu comando anterior!')
    }

    // channel bot permission checker
    if (!msg.channel.permissionsFor(client.user).has(command.botPermissions)) {
        const missingPermissions = msg.channel.permissionsFor(client.user).missing(command.botPermissions).map(permission => `\`${Utils.Permissions[permission]}\``);
        return Utils.send(msg, `No puedo ejecutar ese comando, me hacen falta los siguientes permisos: ${missingPermissions.join(', ')}`)
    }

    // channel user permissions checker
    if (!msg.channel.permissionsFor(msg.author).has(command.userPermissions)) {
        const missingPermissions = msg.channel.permissionsFor(msg.author).missing(command.userPermissions).map(permission => `\`${Utils.Permissions[permission]}\``);
        return Utils.send(msg, `No puedes ejecutar ese comando, te hacen falta los siguientes permisos: ${missingPermissions.join(', ')}`)
    }

    const userCooldown = guildUser.cooldowns.get(command.name); // get user cooldown

    // it is verified if it has cooldown in the command, and if the current time is less than the remaining time
    if (userCooldown && (userCooldown + command.cooldown) > Date.now()) {
        return Utils.send(msg, `Todavia no puedes ejecutar ese comando, tienes que esperar **${Utils.setTimeFormat(((userCooldown + command.cooldown) + 1000) - Date.now())}** 🕗 más.`)
    }

    // command execution
    await command.execute(msg, args, client).catch((err) => console.error(err));
});

// event when a message is deleted
client.on(Events.MessageDelete, (msg) => {
    if (msg.author.bot) return; // is returned if the author of the message is a bot
    client.snipes.set(msg.channelId, { data: msg, time: Date.now() }); // deleted message information is saved
});

// event when a message is edited
client.on(Events.MessageUpdate, (oldMessage, newMessage) => {
    if (oldMessage.author.bot) return; // is returned if the author of the message is a bot
    client.editsnipes.set(oldMessage.channel.id, { old: oldMessage, new: newMessage, time: Date.now() }); // the edited message information is saved
});

// inicio de sesión del bot
client.login(process.env['TOKEN']);