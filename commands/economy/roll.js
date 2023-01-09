const { PermissionFlagsBits, Message, Client, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType } = require('discord.js');
const Utils = require('../../utils');
const wait = require('node:timers/promises').setTimeout;

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
    name: 'roll',
    usage: 'roll [cantidad] (oponente)',
    examples: ['roll 1k', 'roll 222', 'roll 10k @shiro'],
    aliases: ['rolls'],
    cooldown: 10000,
    category: 'economia',
    description: [
        'Lanza un dado imaginario de 100 caras.',
        'Se juega junto a otro jugador o en solitario, en donde tendran que apostar una cantidad de monedas, se lanzará varias veces, siempre como maximo el numero obtenido anteriormente',
        'Gana el primero que llegue a 1.'
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
        const oponent = msg.mentions.members.first() || msg.guild.members.cache.get(args[1]);

        if (oponent && oponent.id === msg.author.id) {
            return Utils.send(msg, 'No puedes jugar contra ti mismo!');
        } else if (oponent && oponent.user.bot) {
            return Utils.send(msg, 'No puedes jugar contra bots!');
        } else if (isNaN(betCoins)) {
            return Utils.send(msg, `Tienes que colocar una cantidad de ${guild.coin} valida!`)
        } else if (user.coins < betCoins) {
            return Utils.send(msg, `No puedes apostar **más ${guild.coin}** de las que posees actualmente!`);
        } else if (betCoins < guild.minimumBet) {
            return Utils.send(msg, `No puedes apostar menos de **${Utils.formatNumber(guild.minimumBet)} ${guild.coin}**!`);
        }

        const button = (id, disabled = false, style = ButtonStyle.Secondary) => {
            return new ButtonBuilder()
                .setCustomId(id)
                .setLabel(id)
                .setStyle(style)
                .setDisabled(disabled)
        };

        if (!oponent) {
            Utils.activedCommand(msg.author.id, 'add');

            const rowEnabled = new ActionRowBuilder()
                .addComponents(button('roll'), button('exit', false, ButtonStyle.Danger));
            const rowDisabled = new ActionRowBuilder()
                .addComponents(button('roll', true), button('exit', true, ButtonStyle.Danger));
            const alertRow = new ActionRowBuilder()
                .addComponents(button('si', false, ButtonStyle.Success), button('no', false, ButtonStyle.Danger));

            const alertEmbed = new EmbedBuilder()
                .setColor(Utils.color)
                .setDescription('Estás seguro que quieres terminar la partida?, si lo haces perderás las monedas que apostaste.')

            const embed = (turn, userTotal, botTotal) => {
                return new EmbedBuilder()
                    .setAuthor({ name: `Apuesta de ${client.user.username} y ${msg.author.username}`, iconURL: client.user.avatarURL({ dynamic: true }) })
                    .setColor(Utils.color)
                    .setDescription(`Es el turno de **${turn.id === client.user.id ? client.user.username : turn.tag}**!`)
                    .addFields([
                        { name: msg.author.tag, value: Utils.formatNumber(userTotal), inline: true },
                        { name: client.user.username, value: Utils.formatNumber(botTotal), inline: true }
                    ])
            }

            const finishEmbed = (winner) => {
                const embed = new EmbedBuilder().setColor(Utils.color);

                if (winner.id === client.user.id) {
                    embed.setAuthor({ name: `El ganador es ${client.user.username}!!`, iconURL: client.user.avatarURL() })
                        .setDescription(`lastimosamente has perdido **${Utils.formatNumber(betCoins)}** ${guild.coin}...`)
                } else {
                    embed.setAuthor({ name: `El ganador es ${msg.author.tag}!!`, iconURL: msg.author.avatarURL({ dynamic: true }) })
                        .setDescription(`Has ganado **${Utils.formatNumber(betCoins)}** ${guild.coin}!!`)
                }

                return embed;
            }

            let userTotal = 100;
            let botTotal = 100;

            const message = await Utils.send(msg, { embeds: [embed(msg.author, userTotal, botTotal)], components: [rowEnabled] });

            const filter = (interaction) => {
                if (interaction.user.id === msg.author.id) return true;
                return interaction.reply({ content: `solamente **${msg.author.tag}** puede hacer eso!`, ephemeral: true });
            };

            const exitCollector = message.createMessageComponentCollector({ filter, time: 180000, componentType: ComponentType.Button });
            const gameCollector = message.createMessageComponentCollector({ filter, time: 180000, componentType: ComponentType.Button });

            exitCollector.on('collect', async (interaction) => {
                if (interaction.customId === 'exit') {
                    if (userTotal === 100) {
                        Utils.addCoins(msg.author.id, msg.guildId, betCoins);
                        Utils.activedCommand(msg.author.id, 'remove');
                        Utils.setCooldown('roll', msg.author.id, msg.guildId);
                        exitCollector.stop('cancel');
                        gameCollector.stop('cancel');
                        await interaction.update({ content: 'La partida se ha cancelado!', embeds: [], components: [] });
                    } else {
                        exitCollector.resetTimer({ time: 30000 });
                        await interaction.update({ content: '', embeds: [alertEmbed], components: [alertRow] });
                    }
                }

                if (interaction.customId === 'si') {
                    Utils.removeCoins(msg.author.id, msg.guildId, betCoins);
                    Utils.activedCommand(msg.author.id, 'remove');
                    Utils.setCooldown('roll', msg.author.id, msg.guildId);
                    exitCollector.stop('cancel');
                    gameCollector.stop('cancel');
                    await interaction.update({ content: 'La partida se ha cancelado! como la partida estaba en juego, se han perdido las monedas apostadas.', embeds: [], components: [] });
                } else if (interaction.customId === 'no') {
                    exitCollector.resetTimer({ time: 180000 });
                    await message.edit({ content: 'Se reanuda la partida.', embeds: [embed(msg.author, userTotal, botTotal)], components: [rowEnabled] });
                }
            });

            gameCollector.on('collect', async (interaction) => {
                if (interaction.customId === 'roll') {
                    if (interaction.user.id !== msg.author.id) return interaction.reply({ content: `Solamente **${msg.author.tag}** puede hacer eso!`, ephemeral: true });

                    userTotal = Utils.random(userTotal);

                    if (userTotal === 1) {
                        Utils.addCoins(msg.author.id, msg.guildId, betCoins * 2);
                        Utils.activedCommand(msg.author.id, 'remove');
                        Utils.setCooldown('roll', msg.author.id, msg.guildId);
                        gameCollector.stop('user win');
                        exitCollector.stop('user win');
                        return await interaction.update({ content: '', embeds: [finishEmbed(msg.author)], components: [rowDisabled] });
                    }

                    await interaction.update({ content: '', embeds: [embed(client.user, userTotal, botTotal)], components: [rowDisabled] });
                    await wait(1500);

                    botTotal = Utils.random(botTotal);

                    if (botTotal === 1) {
                        Utils.removeCoins(msg.author.id, msg.guildId, betCoins);
                        Utils.activedCommand(msg.author.id, 'remove');
                        Utils.setCooldown('roll', msg.author.id, msg.guildId);
                        gameCollector.stop('bot win');
                        exitCollector.stop('bot win');
                        return await message.edit({ content: '', embeds: [finishEmbed(client.user)], components: [rowDisabled] });
                    }

                    await message.edit({ content: '', embeds: [embed(msg.author, userTotal, botTotal)], components: [rowEnabled] });
                }
            });

            exitCollector.on('end', async (collected, reason) => {
                if (reason === 'time') {
                    exitCollector.resetTimer({ time: 180000 });
                    await message.edit({ content: 'Se reanuda la partida ya que no se eligió una opción.', embeds: [embed(msg.author, userTotal, botTotal)], components: [rowEnabled] });
                }
            })

            gameCollector.on('end', async (collected, reason) => {
                if (reason === 'time') {
                    Utils.activedCommand(msg.author.id, 'remove');
                    Utils.setCooldown('roll', msg.author.id, msg.guildId);
                    exitCollector.stop('end');
                    if (userTotal === 100) {
                        Utils.addCoins(msg.author.id, msg.guildId, betCoins);
                        return await message.edit({ content: 'Se acabó la partida, como no se jugó se devolverán las monedas apostadas.', embeds: [], components: [] });
                    } else {
                        Utils.removeCoins(msg.author.id, msg.guildId, betCoins);
                        return await message.edit({ content: 'Se acabó la partida, como la partida estaba iniciada perdiste las monedas apostadas.', embeds: [], components: [] });
                    }
                }
            });
        } else {
            const oponentDB = await Utils.userFetch(oponent.id, msg.guildId);
            if (oponentDB.coins < betCoins) {
                return Utils.send(msg, `No puedes apostar **más ${guild.coin}** de las que ${oponent.user.username} posee actualmente!\nActualmente ${oponent.user.username} tiene **${Utils.formatNumber(oponentDB.coins)}** ${guild.coin}`);
            }

            Utils.activedCommand(msg.author.id, 'add');
            Utils.activedCommand(oponent.id, 'add');

            const initRow = new ActionRowBuilder()
                .addComponents(button('aceptar', false, ButtonStyle.Success), button('rechazar', false, ButtonStyle.Danger))
            const rowEnabled = new ActionRowBuilder()
                .addComponents(button('roll'))
            const rowDisabled = new ActionRowBuilder()
                .addComponents(button('roll', true))

            const requestEmbed = new EmbedBuilder()
                .setAuthor({ name: client.user.tag, iconURL: client.user.avatarURL() })
                .setColor(Utils.color)
                .setDescription(`**${msg.author.username}** te desafía a una apuesta de **${Utils.formatNumber(betCoins)}** ${guild.coin} en un juego de **dados**!\nActualmente posees **${Utils.formatNumber(oponentDB.coins)}** ${guild.coin}`);

            const finishEmbed = (winner, loser) => {
                return new EmbedBuilder()
                    .setAuthor({ name: `El ganador es ${winner.user.tag}!!`, iconURL: winner.user.avatarURL({ dynamic: true }) })
                    .setDescription(`✅ **${winner.user.username}** has ganado **${Utils.formatNumber(betCoins)}** ${guild.coin}!\n\n❌ **${loser.user.username}** has perdido **${Utils.formatNumber(betCoins)}** ${guild.coin}...`)
                    .setColor(Utils.color);
            }

            const embed = (turn, userTotal, oponentTotal) => {
                return new EmbedBuilder()
                    .setAuthor({ name: `Apuesta de ${oponent.user.username} y ${msg.author.username}`, iconURL: client.user.avatarURL({ dynamic: true }) })
                    .setColor(Utils.color)
                    .setDescription(`Es el turno de **${turn.user.tag}**!`)
                    .addFields([
                        { name: msg.author.tag, value: Utils.formatNumber(userTotal), inline: true },
                        { name: oponent.user.tag, value: Utils.formatNumber(oponentTotal), inline: true }
                    ])
            }

            const message = await Utils.send(msg, { content: oponent.toString(), embeds: [requestEmbed], components: [initRow] })

            const filter = (interaction) => {
                if (interaction.user.id === msg.author.id || interaction.user.id === oponent.id) return true;
                return interaction.reply({ content: `solamente **${msg.author.tag}** y **${oponent.user.tag}** pueden hacer eso!`, ephemeral: true });
            };

            const requestCollector = message.createMessageComponentCollector({ filter, time: 30000, componentType: ComponentType.Button });
            const gameCollector = message.createMessageComponentCollector({ filter, time: 180000, componentType: ComponentType.Button });

            let turn = Utils.random([msg.member, oponent]);
            let userTotal = 100;
            let oponentTotal = 100;

            requestCollector.on('collect', async (interaction) => {
                if (interaction.customId === 'aceptar') {
                    if (interaction.user.id !== oponent.id) return interaction.reply({ content: `Solamente **${oponent.user.tag}** puede hacer eso!`, ephemeral: true });
                    await interaction.update({ content: '', embeds: [embed(turn, 100, 100)], components: [rowEnabled] });
                    requestCollector.stop('accept');
                    gameCollector.resetTimer();
                } else if (interaction.customId === 'rechazar') {
                    if (interaction.user.id !== oponent.id) return interaction.reply({ content: `Solamente **${oponent.user.tag}** puede hacer eso!`, ephemeral: true });
                    await interaction.update({ content: 'La apuesta a sido rechazada...', embeds: [], components: [] });
                    Utils.activedCommand(msg.author.id, 'remove');
                    Utils.activedCommand(oponent.id, 'remove');
                    Utils.setCooldown('roll', msg.author.id, msg.guildId);
                    requestCollector.stop('decline');
                    gameCollector.stop('decline')
                }
            });

            gameCollector.on('collect', async (interaction) => {
                if (interaction.customId === 'roll') {
                    if (interaction.user.id !== turn.id) return interaction.reply({ content: `Solamente **${turn.user.tag}** puede hacer eso!`, ephemeral: true });
                    if (turn.id === msg.author.id) {
                        userTotal = Utils.random(userTotal);
                        turn = oponent
                    } else {
                        oponentTotal = Utils.random(oponentTotal);
                        turn = msg.member;
                    }

                    if (userTotal === 1) {
                        gameCollector.stop('user win');
                        Utils.addCoins(msg.author.id, msg.guildId, betCoins * 2);
                        Utils.removeCoins(oponent.id, msg.guildId, betCoins);
                        Utils.activedCommand(msg.author.id, 'remove');
                        Utils.activedCommand(oponent.id, 'remove');
                        Utils.setCooldown('roll', msg.author.id, msg.guildId);
                        Utils.setCooldown('roll', oponent.id, msg.guildId);
                        return await interaction.update({ embeds: [finishEmbed(msg.member, oponent)], components: [rowDisabled] });
                    }
                    if (oponentTotal === 1) {
                        gameCollector.stop('oponent win');
                        Utils.addCoins(oponent.id, msg.guildId, betCoins * 2);
                        Utils.removeCoins(msg.author.id, msg.guildId, betCoins);
                        Utils.activedCommand(msg.author.id, 'remove');
                        Utils.activedCommand(oponent.id, 'remove');
                        Utils.setCooldown('roll', msg.author.id, msg.guildId);
                        Utils.setCooldown('roll', oponent.id, msg.guildId);
                        return await interaction.update({ embeds: [finishEmbed(oponent, msg.member)], components: [rowDisabled] });
                    }

                    await interaction.update({ embeds: [embed(turn, userTotal, oponentTotal)], components: [rowEnabled] });
                }
            });

            gameCollector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    Utils.activedCommand(msg.author.id, 'remove');
                    Utils.activedCommand(oponent.id, 'remove');
                    Utils.addCoins(msg.author.id, msg.guildId, betCoins);
                    Utils.addCoins(oponent.id, msg.guildId, betCoins);
                    Utils.setCooldown('roll', msg.author.id, msg.guildId);
                    Utils.setCooldown('roll', oponent.id, msg.guildId);
                    return message.edit({ content: 'Se acabó el tiempo de juego! se le devolveran las monedas apostadas a ambos jugadores.', embeds: [], components: [] });
                }
            });

            requestCollector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    gameCollector.stop('timeout');
                    Utils.activedCommand(msg.author.id, 'remove');
                    Utils.activedCommand(oponent.id, 'remove');
                    Utils.setCooldown('roll', msg.author.id, msg.guildId);
                    return message.edit({ content: `Se canceló la apuesta ya que **${oponent.user.tag}** no respondió...`, embeds: [], components: [] });
                }
            });
        }
    }
}