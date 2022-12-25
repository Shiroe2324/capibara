const { Message, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ComponentType } = require('discord.js') // estructuras de algunos datos

/**
* Funcion que genera un embed con paginas
* @param {Message} msg - El mensaje enviado
* @param {EmbedBuilder} embed - el embed con las paginas
* @param {number} size - el tamaño de los elementos totales
* @param {number} time - el tiempo en milisegundos de vida util de los botones
* @returns {Message} el mensaje del embed enviado
*/
module.exports = async (msg, embed, size, time) => {
    const row = (components) => {
        return new ActionRowBuilder()
            .addComponents(...components);
    };

    const button = (emoji, id, disable = false) => {
        return new ButtonBuilder()
            .setStyle(ButtonStyle.Primary)
            .setLabel(' ')
            .setEmoji(emoji)
            .setCustomId(id)
            .setDisabled(disable);
    };

    const backOff = button('⬅️', 'back', true);
    const forwardOff = button('➡️', 'forward', true);
    const back = button('⬅️', 'back');
    const forward = button('➡️', 'forward');

    const message = await msg.channel.send({
        embeds: [embed(0)],
        components: size <= 10 ? [] : [row(backOff, forward)],
    })

    if (size <= 10) return message;

    const filter = (interaction) => {
        if (interaction.user.id === msg.author.id) return true;
        return interaction.reply({ content: `solamente **${msg.author.tag}** puede hacer eso!`, ephemeral: true });
    };

    const collector = message.channel.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        time: time - 1000
    });

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
        message.edit({ embeds: [embed(index)], components: [row(backOff, forwardOff)] });
    })

    return message;
}