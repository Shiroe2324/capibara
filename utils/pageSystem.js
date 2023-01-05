const { Message, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ComponentType } = require('discord.js');
const send = require('./send');

/**
 * Function that generates an embed with pages.
 * @param {Message} msg - The message sent.
 * @param {EmbedBuilder} embed - the embed with the pages.
 * @param {number} size - the size of the total elements.
 * @param {number} time - the time in milliseconds of useful life of the buttons.
 * @param {boolean} [disabled] - boolean whether the buttons are disabled or not.
 * @returns {Message} the embed message sent.
 */
module.exports = async (msg, embed, size, time, disabled = false) => {
    const row = (...components) => {
        return new ActionRowBuilder()
            .addComponents(components);
    };

    const button = (emoji, id, disable = false) => {
        return new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel('\u200b')
            .setEmoji(emoji)
            .setCustomId(id)
            .setDisabled(disable);
    };

    const backOff = button('⬅️', 'back', true);
    const forwardOff = button('➡️', 'forward', true);
    const back = button('⬅️', 'back');
    const forward = button('➡️', 'forward');

    // mensaje con el embed
    const message = await send(msg, {
        embeds: [embed(0)],
        components: size <= 10 ? [] : [row(backOff, forward)],
    })

    if (size <= 10) return message;

    const filter = (interaction) => {
        if (interaction.user.id === msg.author.id) return true;
        return interaction.reply({ content: `solamente **${msg.author.tag}** puede hacer eso!`, ephemeral: true });
    };

    const collector = message.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: time });

    let index = 0;

    collector.on('collect', async (interaction) => {
        if (interaction.customId === 'forward') index += 10;
        if (interaction.customId === 'back') index -= 10; 

        await interaction.update({
            embeds: [embed(index)],
            components: [row((index === 0 ? backOff : back), (index + 10 > size ? forwardOff : forward))]
        })
    });

    collector.on('end', (collected) => {
        if (disabled) {
            const quoteEmbed = message.embeds[0] ? [EmbedBuilder.from(message.embeds[0])] : [];
            const disabledButton = message.components[0] ? [row(backOff, forwardOff)] : [];
            message.edit({ embeds: quoteEmbed, components: disabledButton });
        }
    })

    return message;
}