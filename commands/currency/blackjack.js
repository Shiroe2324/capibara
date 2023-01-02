const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, PermissionFlagsBits, Message, Client } = require('discord.js');
const Utils = require('../../utils');

const getHandValue = (hand) => {
    let value = 0;
    let aces = 0;

    for (const card of hand) {
        if (card.value === 'A') {
            aces++;
            value += 11;
        } else if (card.value === 'J' || card.value === 'Q' || card.value === 'K') {
            value += 10;
        } else {
            value += Number(card.value);
        }
    }

    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }

    return value;
}

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
    name: 'blackjack',
    usage: 'blackjack [cantidad]',
    aliases: ['bj'],
    cooldown: 10000,
    category: 'economia',
    description: 'Un juego de Blackjack en solitario contra la maquina!\nlas partidas tienen una duración de 2 minutos como maximo.\nPara mas información sobre como jugar blackjack, puedes visitar [Wikipedia](https://es.wikipedia.org/wiki/Blackjack)',
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

        Utils.activedCommand(msg.author.id, 'add');

        const suits = ['♠', '♥', '♣', '♦'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const deck = [];

        for (const suit of suits) {
            for (const value of values) {
                deck.push({ suit, value, string: value + suit });
            }
        }

        const randomDeck = Utils.shuffle(deck);
        
        let playerHand = [];
        let dealerHand = [];
        let playerHandString = [];
        let dealerHandString = [];
        for (let x = 0; x < 2; x++) {
            playerHand.push(randomDeck.pop());
            dealerHand.push(randomDeck.pop());
            playerHandString.push(playerHand[x].string);
            dealerHandString.push(dealerHand[x].string);
        }

        let playerTotal = getHandValue(playerHand);
        let dealerTotal = getHandValue(dealerHand);

        const button = (id, disabled = false) => {
            return new ButtonBuilder()
                .setCustomId(id)
                .setLabel(id)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled)
        };

        const rowEnabled = new ActionRowBuilder()
            .addComponents(button('hit'), button('stand'))
        const rowDisabled = new ActionRowBuilder()
            .addComponents(button('hit', true), button('stand', true))

        const embed = (name, playerTotal, playerHandString, dealerTotal, dealerHandString, color = '#000000') => {
            return new EmbedBuilder()
                .setAuthor({ name: `${msg.author.tag} - Blackjack`, iconURL: msg.author.avatarURL({ dynamic: true }) })
                .addFields([{ name: name, value: `${msg.author.username}: **${playerTotal}**\n${playerHandString.join(' | ')}\n\nDealer: **${dealerTotal}**\n${dealerHandString.join(' | ')}` }])
                .setColor(color);
        };

        if (playerTotal === 21) {
            Utils.setCooldown('blackjack', msg.author.id);
            Utils.activedCommand(msg.author.id, 'remove');
            Utils.addCoins(msg.author.id, msg.guild.id, betCoins);
            return msg.channel.send({
                embeds: [embed(`Blackjack! has ganado ${betCoins}${guild.coinName}`, playerTotal, playerHandString, dealerTotal, dealerHandString, '#00ff00')],
                components: [rowDisabled]
            });
        }

        const message = await msg.channel.send({
            embeds: [embed('Escribe `hit` para agarrar otra carta o `stand` para pasar.', playerTotal, playerHandString, dealerTotal, dealerHandString)],
            components: [rowEnabled]
        });

        let filter = (m) => m.author.id === msg.author.id;
        const messageCollector = message.channel.createMessageCollector({ filter, time: 120000 })

        filter = (interaction) => {
            if (interaction.user.id === msg.author.id) return true;
            return interaction.reply({ content: `solamente **${msg.author.tag}** puede hacer eso!`, ephemeral: true });
        };
        const componentCollector = message.createMessageComponentCollector({ filter, time: 120000, componentType: ComponentType.Button });

        const gameStop = () => {
            Utils.setCooldown('blackjack', msg.author.id);
            Utils.activedCommand(msg.author.id, 'remove');
            messageCollector.stop();
            componentCollector.stop();
        }

        const collectorOn = async (content) => {
            if (content === 'hit') {
                let newCard = randomDeck.pop();
                playerHand.push(newCard);
                playerHandString.push(newCard.string);
                playerTotal = getHandValue(playerHand);
                if (playerTotal < 21) {
                    await message.edit({
                        embeds: [embed('Escribe `hit` para agarrar otra carta o `stand` para pasar.', playerTotal, playerHandString, dealerTotal, dealerHandString)]
                    });
                } else if (playerTotal === 21) {
                    await message.edit({
                        embeds: [embed(`Blackjack! has ganado ${betCoins}${guild.coinName}`, playerTotal, playerHandString, dealerTotal, dealerHandString, '#00ff00')],
                        components: [rowDisabled]
                    });

                    Utils.addCoins(msg.author.id, msg.guild.id, betCoins);
                    gameStop()
                } else {
                    await message.edit({
                        embeds: [embed(`Fracasaste! has perdido ${betCoins}${guild.coinName}`, playerTotal, playerHandString, dealerTotal, dealerHandString, '#ff0000')],
                        components: [rowDisabled]
                    });

                    Utils.removeCoins(msg.author.id, msg.guild.id, betCoins);
                    gameStop()
                }
            } else if (content === 'stand') {
                gameStop()

                while (dealerTotal < 17) {
                    let newCard = randomDeck.pop();
                    dealerHand.push(newCard);
                    dealerHandString.push(newCard.string);
                    dealerTotal = getHandValue(dealerHand);
                }

                if (dealerTotal > 21 || dealerTotal < playerTotal) {
                    await message.edit({
                        embeds: [embed(`Ganaste! has ganado ${betCoins}${guild.coinName}`, playerTotal, playerHandString, dealerTotal, dealerHandString, '#00ff00')],
                        components: [rowDisabled]
                    });
                    Utils.addCoins(msg.author.id, msg.guild.id, betCoins);
                } else if (dealerTotal > playerTotal) {
                    await message.edit({
                        embeds: [embed(`Fracasaste! has perdido ${betCoins}${guild.coinName}`, playerTotal, playerHandString, dealerTotal, dealerHandString, '#ff0000')],
                        components: [rowDisabled]
                    });
                    Utils.removeCoins(msg.author.id, msg.guild.id, betCoins);
                } else {
                    await message.edit({
                        embeds: [embed('Es un empate! No has ganado ni perdido monedas', playerTotal, playerHandString, dealerTotal, dealerHandString, '#ffffff')],
                        components: [rowDisabled]
                    });
                }
            }
        }

        const collectorEnd = (collected, reason) => {
            if (reason === 'time') {
                message.edit({
                    embeds: [embed(`Se acabó el tiempo! has perdido ${betCoins}${guild.coinName}`, playerTotal, playerHandString, dealerTotal, dealerHandString, '#ff0000')],
                    components: [rowDisabled]
                });
                Utils.removeCoins(msg.author.id, msg.guild.id, betCoins);
                Utils.setCooldown('blackjack', msg.author.id);
                Utils.activedCommand(msg.author.id, 'remove');
            }
        }

        messageCollector.on('collect', (m) => collectorOn(m.content.toLowerCase()));
        componentCollector.on('collect', (interaction) => {
            collectorOn(interaction.customId)
            interaction.deferUpdate();
        });

        messageCollector.on('end', collectorEnd);
        componentCollector.on('end', collectorEnd);
    }
}