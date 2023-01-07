const { PermissionFlagsBits, Message, Client, EmbedBuilder } = require('discord.js');
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
    name: 'editsnipe',
    usage: 'editsnipe (canal)',
    examples: ['editsnipe', 'editsnipe #general'],
    aliases: [],
    cooldown: 10000,
    category: 'utilidad',
    description: [
        'Muestra el ultimo mensaje editado de un canal especifico o al canal donde se ejecutó el comando.',
        'Se puede seleccionar un canal con mencion, id, o simplemente no colocar nada y se selecciona automáticamente el canal actual.'
    ],
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks
    ],
    userPermissions: [],

    /**
     * function with the code to execute the command.
     * @param {Message} msg - The message sent by the user.
     * @param {string[]} args - The arguments of the message sent by the user.
     * @param {Client} client - The bot's client.
     */
    execute: async (msg, args, client) => {
        const channel = msg.mentions.channels.first() || msg.guild.channels.cache.get(args[0]) || msg.channel;
        const message = client.editsnipes.get(channel.id);

        if (!message) return Utils.send(msg, `No se ha editado ningún mensaje recientemente en ${channel}.`)

        Utils.setCooldown('editsnipe', msg.author.id, msg.guildId);

        const oldMessageEmbed = new EmbedBuilder()
            .setAuthor({ name: message.old.author.tag, iconURL: message.old.author.avatarURL({ dynamic: true }) })
            .setTitle('Antiguo mensaje')
            .setDescription(message.old.content)
            .setTimestamp(message.old.createdAt)
            .setColor(Utils.color);

        const newMessageEmbed = new EmbedBuilder()
            .setAuthor({ name: message.new.author.tag, iconURL: message.old.author.avatarURL({ dynamic: true }) })
            .setTitle('Nuevo mensaje')
            .setDescription(message.new.content)
            .setTimestamp(message.time)
            .setColor(Utils.color);

        Utils.send(msg, { embeds: [oldMessageEmbed, newMessageEmbed] })
    }
}
