const { PermissionFlagsBits, Message, Client, ActionRowBuilder, StringSelectMenuBuilder, ComponentType, EmbedBuilder } = require('discord.js');
const Utils = require('../../utils');

/**
 * @property name - The name of the command.
 * @property usage - The syntax in which the command is used.
 * @property aliases - The aliases of the command.
 * @property cooldown - the cooldown time of the command
 * @property category - The name of the command category.
 * @property description - The description of the command.
 * @property onlyCreator - Check if the command is only for the creator of the bot.
 * @property botPermissions - List of bot permissions for the command.
 * @property userPermissions - List of user permissions for the command.
 */
module.exports = {
    name: 'roulette',
    usage: 'roulette [cantidad] [casilla]',
    aliases: ['wheel'],
    cooldown: 10000,
    category: 'economia',
    description: '',
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.UseExternalEmojis
    ],
    userPermissions: [],

    /**
     * function with the code to execute the command.
     * @param {Message} msg - The message sent by the user.
     * @param {string[]} args - The arguments of the message sent by the user.
     * @param {Client} client - The bot's client.
     */
    execute: async (msg, args, client) => {
        const guild = await Utils.guildFetch(msg.guildId);
        const user = await Utils.userFetch(msg.author.id, msg.guildId);
        const formatedCoins = await Utils.setCoinsFormat(user, args[0]);
        const betCoins = Math.round(formatedCoins);

        if (isNaN(betCoins)) {
            return Utils.send(msg, `Tienes que colocar una cantidad de ${guild.coin} valida!`)
        } else if (user.coins < betCoins) {
            return Utils.send(msg, `No puedes apostar **más ${guild.coin}** de las que posees actualmente!`)
        } else if (betCoins < 20) {
            return Utils.send(msg, `No puedes apostar menos de **20 ${guild.coin}**!`)
        }

        let boxes = [{ number: 0, color: 'green' }];
        for (let i = 1; i < 37; i++) {
            boxes.push({ number: i, color: i % 2 === 0 ? 'black' : 'red' });
        }

        const selectedBox = Utils.random(boxes);

        const selectEmbed = new EmbedBuilder()
            .setColor(Utils.color)
            .setAuthor({ name: client.user.username, iconURL: client.user.avatarURL() })

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('selections')
                    .setPlaceholder('Elige que tipo de jugada quieres hacer')
                    .addOptions(
                        {
                            label: 'Inicio',
                            description: 'Panel principal con todas las categorías',
                            value: 'first',
                        },
                        {
                            label: 'Economía',
                            description: 'Panel con comandos de economía',
                            value: 'second',
                        },
                        {
                            label: 'Utilidad',
                            description: 'Panel con comandos de utilidad',
                            value: 'third',
                        },
                        {
                            label: 'Administración',
                            description: 'Panel con comandos de administracion',
                            value: 'fourth',
                        }
                    )
            );
    }
}