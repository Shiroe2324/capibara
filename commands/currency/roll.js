const { PermissionFlagsBits, Message, Client, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType } = require('discord.js');
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
    name: 'roll',
    usage: 'roll [oponente] [cantidad]',
    aliases: ['rolls'],
    cooldown: 10000,
    category: 'economia',
    description: 'Lanza un dado imaginario de 100 caras.\nSe juega junto a otro jugador, el cual tendran que apostar una cantidad de monedas, se lanzará varias veces, siempre como maximo el numero obtenido anteriormente\nGana el primero que llegue a 1.',
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
        const guild = await Utils.guildFetch(msg.guild.id); // base de datos del servidor
        const user = await Utils.userFetch(msg.author.id, msg.guild.id); // base de datos del usuario en el servidor
        const formatedCoins = await Utils.setCoinsFormat(user, args[1]); // se formatean las monedas dadas
        const betCoins = Math.round(formatedCoins); // se redondean a un número entero las monedas dadas
        const oponent = msg.mentions.members.first() || msg.guild.members.cache.get(args[0]); // el oponente del juego

        /*se verifica si la cantidad de monedas dadas es numero, si el usuario tiene las monedas suficientes, o si apuesta más de 20 monedas
        tambien se verifica si colocó un oponente valido*/
        if (!oponent) {
            return msg.reply('Tienes mencionar a otro usuario para jugar!');
        } else if (oponent.id === msg.author.id) {
            return msg.reply('No puedes jugar contra ti mismo!');
        } else if (oponent.user.bot) {
            return msg.reply('No puedes jugar contra bots!');
        } else if (isNaN(betCoins)) {
            return msg.reply(`Tienes que colocar una cantidad de ${guild.coinName} valida!`)
        } else if (user.coins < betCoins) {
            return msg.reply(`No puedes apostar **más ${guild.coinName}** de las que posees actualmente!`);
        } else if (betCoins < 20) {
            return msg.reply(`No puedes apostar menos de **20 ${guild.coinName}**!`);
        }

        const oponentDB = await Utils.userFetch(oponent.id, msg.guild.id); // base de datos del oponente
        if (oponentDB.coins < betCoins) {
            return msg.reply(`No puedes apostar **más ${guild.coinName}** de las que ${oponent.user.username} posee actualmente!`);
        }

        Utils.activedCommand(msg.author.id, 'add');
        Utils.activedCommand(oponent.id, 'add');

        const button = (id, disabled = false, style = ButtonStyle.Secondary) => {
            return new ButtonBuilder()
                .setCustomId(id)
                .setLabel(id)
                .setStyle(style)
                .setDisabled(disabled)
        };

        const initRow = new ActionRowBuilder()
            .addComponents(button('aceptar', false, ButtonStyle.Success), button('rechazar', false, ButtonStyle.Danger))
        const rowEnabled = new ActionRowBuilder()
            .addComponents(button('roll'))
        const rowDisabled = new ActionRowBuilder()
            .addComponents(button('roll', true))

        const requestEmbed = new EmbedBuilder()
            .setAuthor({ name: client.user.tag, iconURL: client.user.avatarURL() })
            .setColor(Utils.color)
            .setDescription(`**${msg.author.username}** te desafía a una apuesta de ${betCoins} ${guild.coinName} en un juego de **dados**!`);

        const finishEmbed = (winner, loser) => {
            return new EmbedBuilder()
                .setAuthor({ name: `El ganador es ${winner.user.tag}!!`, iconURL: winner.user.avatarURL({ dynamic: true }) })
                .setDescription(`**${winner.user.username}** has ganado ${betCoins} ${guild.coinName}!\n\n**${loser.user.username}** has perdido ${betCoins} ${guild.coinName}...`)
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

        const rolls = (max) => {
            return Math.floor(Math.random() * max) + 1;
        };

        let turn = msg.member;
        let userTotal = 100;
        let oponentTotal = 100;

        requestCollector.on('collect', async (interaction) => {
            if (interaction.customId === 'aceptar') {
                if (interaction.user.id !== oponent.id) return interaction.reply({ content: `Solamente **${oponent.user.tag}** puede hacer eso!`, ephemeral: true });
                await interaction.update({ content: '', embeds: [embed(turn, 100, 100)], components: [rowEnabled] });
                Utils.removeCoins(msg.author.id, msg.guild.id, betCoins);
                Utils.removeCoins(oponent.id, msg.guild.id, betCoins);
                requestCollector.stop('accept');
                gameCollector.resetTimer();
            } else if (interaction.customId === 'rechazar') {
                if (interaction.user.id !== oponent.id) return interaction.reply({ content: `Solamente **${oponent.user.tag}** puede hacer eso!`, ephemeral: true });
                await interaction.update({ content: 'La apuesta a sido rechazada...', embeds: [], components: [] });
                Utils.activedCommand(msg.author.id, 'remove');
                Utils.activedCommand(oponent.id, 'remove');
                Utils.setCooldown('roll', msg.author.id);
                gameCollector.stop('decline')
            }
        });

        gameCollector.on('collect', async (interaction) => {
            if (interaction.customId === 'roll') {
                if (interaction.user.id !== turn.id) return interaction.reply({ content: `Solamente **${turn.user.tag}** puede hacer eso!`, ephemeral: true });
                if (turn.id === msg.author.id) {
                    userTotal = rolls(userTotal);
                    turn = oponent
                } else {
                    oponentTotal = rolls(oponentTotal);
                    turn = msg.member;
                }

                if (userTotal === 1) {
                    Utils.addCoins(msg.author.id, msg.guild.id, betCoins*2);
                    Utils.activedCommand(msg.author.id, 'remove');
                    Utils.activedCommand(oponent.id, 'remove');
                    Utils.setCooldown('roll', msg.author.id);
                    Utils.setCooldown('roll', oponent.id);
                    return await interaction.update({ embeds: [finishEmbed(msg.member, oponent)], components: [rowDisabled] });
                }
                if (oponentTotal === 1) {
                    Utils.addCoins(oponent.id, msg.guild.id, betCoins*2);
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