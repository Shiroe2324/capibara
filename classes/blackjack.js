const shuffle = require('../utils/shuffle');
const { EmbedBuilder, Message, Client } = require('discord.js');
const setCooldown = require('../utils/setCooldown');
const activedCommand = require('../utils/activedCommand');
const { formatNumber } = require('../utils');
const { guild } = require('../utils/schemas');

/**
 * Discord blackjack game
 * @class blackjack
 */
class Blackjack {
    /**
     * Create a new Blackjack game.
     * @param {Message} msg - the message sent.
     * @param {Client} client - the bot client.
     * @param {number} betCoins - number of bet coins.
     * @param {guild} guild - guild database.
     */
    constructor(msg, client, betCoins, guild) {
        this.msg = msg;
        this.client = client;
        this.betCoins = betCoins;
        this.guild = guild;
    };

    /** shuffle and deal cards to player and dealer.*/
    deal() {
        const suits = ['♠', '♥', '♣', '♦'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const deck = [];

        for (const suit of suits) {
            for (const value of values) {
                deck.push({ suit, value, string: value + suit });
            }
        }

        this.randomDeck = shuffle(deck);

        this.playerHand = [];
        this.dealerHand = [];
        this.playerString = [];
        this.dealerString = [];

        for (let x = 0; x < 2; x++) {
            this.playerHand.push(this.randomDeck.pop());
            this.dealerHand.push(this.randomDeck.pop());
            this.playerString.push(this.playerHand[x].string);
            this.dealerString.push(this.dealerHand[x].string);
        }

        this.playerTotal = this.getHandValue(this.playerHand);
        this.dealerTotal = this.getHandValue(this.dealerHand);
    }

    /**
     * get value of a blackjack hand.
     * @param {{value: string}[]} hand - the hand to get the value.
     * @returns {number} value of a blackjack hand.
     */
    getHandValue(hand) {
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
     * Generate a embed with a specific description.
     * @param {string} type - description of the embed.
     * @returns {EmbedBuilder} the embed with the specified description.
     */
    embed(type = 'another') {
        let description = 'Escribe `hit` para agarrar otra carta o `stand` para pasar.';
        let color = '#000000';

        switch (type) {
            case 'win': {
                description = `Ganaste! has ganado ${formatNumber(this.betCoins)} ${this.guild.coin}`;
                color = '#00ff00';
            }; break;
            case 'blackjack': {
                description = `Blackjack! has ganado ${formatNumber(this.betCoins)} ${this.guild.coin}`;
                color = '#00ff00';
            }; break;
            case 'lose': {
                description = `Fracasaste! has perdido ${formatNumber(this.betCoins)} ${this.guild.coin}`;
                color = '#ff0000';
            } break;
            case 'tie': {
                description = 'Es un empate! No has ganado ni perdido monedas';
                color = '#aaaaaa';
            }
            case 'time': {
                description = `Se acabó el tiempo! has perdido ${formatNumber(this.betCoins)} ${this.guild.coin}`;
                color = '#aaaaaa';
            }; break;
        }

        return new EmbedBuilder()
            .setAuthor({ name: this.client.user.username, iconURL: this.client.user.avatarURL() })
            .addFields([{ name: description, value: `${this.msg.author.username}: **${this.playerTotal}**\n${this.playerString.join(' | ')}\n\n${this.client.user.username}: **${this.dealerTotal}**\n${this.dealerString.join(' | ')}` }])
            .setColor(color);
    }

    /** stop the blackjack game*/
    stop(messageCollector, componentCollector) {
        setCooldown('blackjack', this.msg.author.id, this.msg.guildId);
        activedCommand(this.msg.author.id, 'remove');
        messageCollector.stop();
        componentCollector.stop();
    }

    /** give a card to the dealer*/
    dealerPush() {
        let newCard = this.randomDeck.pop();
        this.dealerHand.push(newCard);
        this.dealerString.push(newCard.string);
        this.dealerTotal = this.getHandValue(this.dealerHand);
    }

    /** give a card to the player*/
    playerPush() {
        let newCard = this.randomDeck.pop();
        this.playerHand.push(newCard);
        this.playerString.push(newCard.string);
        this.playerTotal = this.getHandValue(this.playerHand);
    }
}

module.exports = Blackjack