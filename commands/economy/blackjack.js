const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, PermissionFlagsBits, Message, Client } = require('discord.js');
const Utils = require('../../utils');
const Blackjack = require('../../classes/blackjack');

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
    name: 'blackjack',
    usage: 'blackjack [cantidad]',
    examples: ['blackjack 1k', 'blackjack 200'],
    aliases: ['bj'],
    cooldown: 10000,
    category: 'economia',
    description: [
        'Un juego de Blackjack en solitario contra la maquina!',
        'las partidas tienen una duración de 2 minutos como maximo.',
        'Para mas información sobre como jugar blackjack, puedes visitar **[Wikipedia](https://es.wikipedia.org/wiki/Blackjack)**'
    ],
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
        const formatedCoins = await Utils.setCoinsFormat(args[0], user);
        const betCoins = Math.round(formatedCoins);

        if (isNaN(betCoins)) {
            return Utils.send(msg, `Tienes que colocar una cantidad de ${guild.coin} valida!`)
        } else if (user.coins < betCoins) {
            return Utils.send(msg, `No puedes apostar **más ${guild.coin}** de las que posees actualmente!`)
        } else if (betCoins < guild.minimumBet) {
            return Utils.send(msg, `No puedes apostar menos de **${Utils.formatNumber(guild.minimumBet)} ${guild.coin}**!`)
        }

        Utils.activedCommand(msg.author.id, 'add');

        const game = new Blackjack(msg, client, betCoins, guild);

        game.deal()

        const button = (id, disabled = false) => {
            return new ButtonBuilder()
                .setCustomId(id)
                .setLabel(id)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled);
        };

        const rowEnabled = new ActionRowBuilder()
            .addComponents(button('hit'), button('stand'));
        const rowDisabled = new ActionRowBuilder()
            .addComponents(button('hit', true), button('stand', true));

        if (game.playerTotal === 21 && game.dealerTotal === 21) {
            Utils.setCooldown('blackjack', msg.author.id, msg.guildId);
            Utils.activedCommand(msg.author.id, 'remove');
            return Utils.send(msg, { embeds: [game.embed('tie')], components: [rowDisabled] });
        }

        const message = await Utils.send(msg, { embeds: [game.embed()], components: [rowEnabled] });

        const messagefilter = (m) => m.author.id === msg.author.id;
        const componentfilter = (interaction) => {
            if (interaction.user.id === msg.author.id) {
                return true;
            } else {
                interaction.reply({ content: `solamente **${msg.author.tag}** puede hacer eso!`, ephemeral: true });
                return false;
            }
        };

        const messageCollector = message.channel.createMessageCollector({ filter: messagefilter, time: 120000 });
        const componentCollector = message.createMessageComponentCollector({ filter: componentfilter, time: 120000, componentType: ComponentType.Button });

        const collectorOn = async (content) => {
            if (content === 'hit') {
                game.playerPush();

                if (game.playerTotal < 21) {
                    await message.edit({ embeds: [game.embed()] });
                } else if (game.playerTotal === 21) {
                    await message.edit({ embeds: [game.embed('blackjack')], components: [rowDisabled] });
                    game.stop(messageCollector, componentCollector);
                } else {
                    await message.edit({ embeds: [game.embed('lose')], components: [rowDisabled] });
                    Utils.removeCoins(msg.author.id, msg.guildId, betCoins);
                    game.stop(messageCollector, componentCollector);
                }
            } else if (content === 'stand') {
                game.stop(messageCollector, componentCollector);

                while (game.dealerTotal < 17) {
                    game.dealerPush();
                }

                if (game.dealerTotal > 21 || game.dealerTotal < game.playerTotal) {
                    await message.edit({ embeds: [game.embed('win')], components: [rowDisabled] });
                    Utils.addCoins(msg.author.id, msg.guildId, betCoins);
                } else if (game.dealerTotal > game.playerTotal) {
                    await message.edit({ embeds: [game.embed('lose')], components: [rowDisabled] });
                    Utils.removeCoins(msg.author.id, msg.guildId, betCoins);
                } else {
                    await message.edit({ embeds: [game.embed('tie')], components: [rowDisabled] });
                }
            }
        }

        const collectorEnd = (collected, reason) => {
            if (reason === 'time') {
                message.edit({ embeds: [embed('time')], components: [rowDisabled] });
                Utils.removeCoins(msg.author.id, msg.guildId, betCoins);
                Utils.setCooldown('blackjack', msg.author.id, msg.guildId);
                Utils.activedCommand(msg.author.id, 'remove');
            }
        }

        messageCollector.on('collect', (m) => collectorOn(m.content.toLowerCase()));
        componentCollector.on('collect', (interaction) => {
            collectorOn(interaction.customId);
            interaction.deferUpdate();
        });

        messageCollector.on('end', collectorEnd);
        componentCollector.on('end', collectorEnd);
    }
}