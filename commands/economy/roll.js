const { PermissionFlagsBits, Message, Client, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType } = require('discord.js');
const Utils = require('../../utils');
const wait = require('node:timers/promises').setTimeout;

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
    name: 'roll',
    usage: 'roll [cantidad] (oponente)',
    aliases: ['rolls'],
    cooldown: 10000,
    category: 'economia',
    description: 'Lanza un dado imaginario de 100 caras.\nSe juega junto a otro jugador o en solitario, en donde tendran que apostar una cantidad de monedas, se lanzará varias veces, siempre como maximo el numero obtenido anteriormente\nGana el primero que llegue a 1.',
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
        const oponent = msg.mentions.members.first() || msg.guild.members.cache.get(args[1]);

        if (oponent && oponent.id === msg.author.id) {
            return msg.reply('No puedes jugar contra ti mismo!');
        } else if (oponent && oponent.user.bot) {
            return msg.reply('No puedes jugar contra bots!');
        } else if (isNaN(betCoins)) {
            return msg.reply(`Tienes que colocar una cantidad de ${guild.coin} valida!`)
        } else if (user.coins < betCoins) {
            return msg.reply(`No puedes apostar **más ${guild.coin}** de las que posees actualmente!`);
        } else if (betCoins < 20) {
            return msg.reply(`No puedes apostar menos de **20 ${guild.coin}**!`);
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
                        { name: msg.author.tag, value: String(userTotal), inline: true },
                        { name: client.user.username, value: String(botTotal), inline: true }
                    ])
            }

            const finishEmbed = (winner) => {
                const embed = new EmbedBuilder().setColor(Utils.color);

                if (winner.id === client.user.id) {
                    embed.setAuthor({ name: `El ganador es ${client.user.username}!!`, iconURL: client.user.avatarURL() })
                        .setDescription(`lastimosamente has perdido **${betCoins}** ${guild.coin}...`)
                } else {
                    embed.setAuthor({ name: `El ganador es ${msg.author.tag}!!`, iconURL: msg.author.avatarURL({ dynamic: true }) })
                        .setDescription(`Has ganado **${betCoins}** ${guild.coin}!!`)
                }

                return embed;
            }

            let userTotal = 100;
            let botTotal = 100;

            const message = await msg.channel.send({ embeds: [embed(msg.author, userTotal, botTotal)], components: [rowEnabled] });

            const filter = (interaction) => {
                if (interaction.user.id === msg.author.id) return true;
                return interaction.reply({ content: `solamente **${msg.author.tag}** puede hacer eso!`, ephemeral: true });
            };

            const exitCollector = message.createMessageComponentCollector({ filter, time: 180000, componentType: ComponentType.Button });
            const gameCollector = message.createMessageComponentCollector({ filter, time: 180000, componentType: ComponentType.Button });

            exitCollector.on('collect', async (interaction) => {
                if (interaction.customId === 'exit') {
                    if (userTotal === 100) {
                        Utils.addCoins(msg.author.id, msg.guild.id, betCoins);
                        Utils.activedCommand(msg.author.id, 'remove');
                        Utils.setCooldown('roll', msg.author.id);
                        exitCollector.stop('cancel');
                        gameCollector.stop('cancel');
                        await interaction.update({ content: 'La partida se ha cancelado!', embeds: [], components: [] });
                    } else {
                        exitCollector.resetTimer({ time: 30000 });
                        await interaction.update({ content: '', embeds: [alertEmbed], components: [alertRow] });
                    }
                }

                if (interaction.customId === 'si') {
                    Utils.removeCoins(msg.author.id, msg.guild.id, betCoins);
                    Utils.activedCommand(msg.author.id, 'remove');
                    Utils.setCooldown('roll', msg.author.id);
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
                        Utils.addCoins(msg.author.id, msg.guild.id, betCoins * 2);
                        Utils.activedCommand(msg.author.id, 'remove');
                        Utils.setCooldown('roll', msg.author.id);
                        gameCollector.stop('user win');
                        exitCollector.stop('user win');
                        return await interaction.update({ content: '', embeds: [finishEmbed(msg.author)], components: [rowDisabled] });
                    }

                    await interaction.update({ content: '', embeds: [embed(client.user, userTotal, botTotal)], components: [rowDisabled] });
                    await wait(1500);

                    botTotal = Utils.random(botTotal);

                    if (botTotal === 1) {
                        Utils.removeCoins(msg.author.id, msg.guild.id, betCoins);
                        Utils.activedCommand(msg.author.id, 'remove');
                        Utils.setCooldown('roll', msg.author.id);
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
                    Utils.setCooldown('roll', msg.author.id);
                    exitCollector.stop('end');
                    if (userTotal === 100) {
                        Utils.addCoins(msg.author.id, msg.guild.id, betCoins);
                        return await message.edit({ content: 'Se acabó la partida, como no se jugó se devolverán las monedas apostadas.', embeds: [], components: [] });
                    } else {
                        Utils.removeCoins(msg.author.id, msg.guild.id, betCoins);
                        return await message.edit({ content: 'Se acabó la partida, como la partida estaba iniciada perdiste las monedas apostadas.', embeds: [], components: [] });
                    }
                }
            });
        } else {
            const oponentDB = await Utils.userFetch(oponent.id, msg.guild.id);
            if (oponentDB.coins < betCoins) {
                return msg.reply(`No puedes apostar **más ${guild.coin}** de las que ${oponent.user.username} posee actualmente!`);
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
                .setDescription(`**${msg.author.username}** te desafía a una apuesta de **${betCoins}** ${guild.coin} en un juego de **dados**!`);

            const finishEmbed = (winner, loser) => {
                return new EmbedBuilder()
                    .setAuthor({ name: `El ganador es ${winner.user.tag}!!`, iconURL: winner.user.avatarURL({ dynamic: true }) })
                    .setDescription(`**${winner.user.username}** has ganado **${betCoins}** ${guild.coin}!\n\n**${loser.user.username}** has perdido ${betCoins} ${guild.coin}...`)
                    .setColor(Utils.color);
            }

            const embed = (turn, userTotal, oponentTotal) => {
                return new EmbedBuilder()
                    .setAuthor({ name: `Apuesta de ${oponent.user.username} y ${msg.author.username}`, iconURL: client.user.avatarURL({ dynamic: true }) })
                    .setColor(Utils.color)
                    .setDescription(`Es el turno de **${turn.user.tag}**!`)
                    .addFields([
                        { name: msg.author.tag, value: String(userTotal), inline: true },
                        { name: oponent.user.tag, value: String(oponentTotal), inline: true }
                    ])
            }

            const message = await msg.channel.send({ content: oponent.toString(), embeds: [requestEmbed], components: [initRow] })

            const filter = (interaction) => {
                if (interaction.user.id === msg.author.id || interaction.user.id === oponent.id) return true;
                return interaction.reply({ content: `solamente **${msg.author.tag}** y **${oponent.user.tag}** pueden hacer eso!`, ephemeral: true });
            };

            const requestCollector = message.createMessageComponentCollector({ filter, time: 30000, componentType: ComponentType.Button });
            const gameCollector = message.createMessageComponentCollector({ filter, time: 180000, componentType: ComponentType.Button });

            let turn = msg.member;
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
                    Utils.setCooldown('roll', msg.author.id);
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
                        Utils.addCoins(msg.author.id, msg.guild.id, betCoins * 2);
                        Utils.removeCoins(oponent.id, msg.guild.id, betCoins);
                        Utils.activedCommand(msg.author.id, 'remove');
                        Utils.activedCommand(oponent.id, 'remove');
                        Utils.setCooldown('roll', msg.author.id);
                        Utils.setCooldown('roll', oponent.id);
                        return await interaction.update({ embeds: [finishEmbed(msg.member, oponent)], components: [rowDisabled] });
                    }
                    if (oponentTotal === 1) {
                        gameCollector.stop('oponent win');
                        Utils.addCoins(oponent.id, msg.guild.id, betCoins * 2);
                        Utils.removeCoins(msg.author.id, msg.guild.id, betCoins);
                        Utils.activedCommand(msg.author.id, 'remove');
                        Utils.activedCommand(oponent.id, 'remove');
                        Utils.setCooldown('roll', msg.author.id);
                        Utils.setCooldown('roll', oponent.id);
                        return await interaction.update({ embeds: [finishEmbed(oponent, msg.member)], components: [rowDisabled] });
                    }

                    await interaction.update({ embeds: [embed(turn, userTotal, oponentTotal)], components: [rowEnabled] });
                }
            });

            gameCollector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    Utils.activedCommand(msg.author.id, 'remove');
                    Utils.activedCommand(oponent.id, 'remove');
                    Utils.addCoins(msg.author.id, msg.guild.id, betCoins);
                    Utils.addCoins(oponent.id, msg.guild.id, betCoins);
                    Utils.setCooldown('roll', msg.author.id);
                    Utils.setCooldown('roll', oponent.id);
                    return message.edit({ content: `Se acabó el tiempo de juego! se le devolveran las monedas apostadas a ambos jugadores.`, embeds: [], components: [] });
                }
            });

            requestCollector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    gameCollector.stop('timeout');
                    Utils.activedCommand(msg.author.id, 'remove');
                    Utils.activedCommand(oponent.id, 'remove');
                    Utils.setCooldown('roll', msg.author.id);
                    return message.edit({ content: `Se canceló la apuesta ya que **${oponent.user.tag}** no respondió...`, embeds: [], components: [] });
                }
            });
        }
    }
}