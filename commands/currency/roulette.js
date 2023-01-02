const { PermissionFlagsBits, Message, Client, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
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
     * funcion con el codigo a ejecutar del comando.
     * @param {Message} msg - El mensaje enviado por el usuario.
     * @param {string[]} args - Los argumentos del mensaje enviado por el usuario.
     * @param {Client} client - El cliente del bot.
     */
    execute: async (msg, args, client) => {
        const guild = await Utils.guildFetch(msg.guild.id);
        const user = await Utils.userFetch(msg.author.id, msg.guild.id);
        const formatedCoins = await Utils.setCoinsFormat(user, args[0]);
        const betCoins = Math.round(formatedCoins);

        if (isNaN(betCoins)) {
            return msg.reply(`Tienes que colocar una cantidad de ${guild.coinName} valida!`)
        } else if (user.coins < betCoins) {
            return msg.reply(`No puedes apostar **más ${guild.coinName}** de las que posees actualmente!`);
        } else if (betCoins < 20) {
            return msg.reply(`No puedes apostar menos de **20 ${guild.coinName}**!`);
        }

        let boxes = [{ number: 0, color: 'green' }];
        for (let i = 1; i < 37; i++) {
            boxes.push({ number: i, color: i % 2 === 0 ? 'black' : 'red' });
        }

        const selectedBox = Utils.random(boxes);

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