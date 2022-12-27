const { Message, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ComponentType } = require('discord.js') // estructuras de algunos datos

/**
 * Funcion que genera un embed con paginas.
 * @param {Message} msg - El mensaje enviado.
 * @param {EmbedBuilder} embed - el embed con las paginas.
 * @param {number} size - el tamaño de los elementos totales.
 * @param {number} time - el tiempo en milisegundos de vida util de los botones.
 * @param {boolean} [disabled] - el verificador de si los botones son desactivados o no.
 * @returns {Message} el mensaje del embed enviado.
 */
module.exports = async (msg, embed, size, time, disabled = false) => {
    // funcion que genera una nueva linea de botones
    const row = (...components) => {
        return new ActionRowBuilder()
            .addComponents(components);
    };

    // función que genera un nuevo boton
    const button = (emoji, id, disable = false) => {
        return new ButtonBuilder()
            .setStyle(ButtonStyle.Secondary)
            .setLabel('\u200b')
            .setEmoji(emoji)
            .setCustomId(id)
            .setDisabled(disable);
    };

    const backOff = button('⬅️', 'back', true); // boton de retroceso desactivado
    const forwardOff = button('➡️', 'forward', true); // boton de siguiente desactivado
    const back = button('⬅️', 'back'); // boton de retroceso
    const forward = button('➡️', 'forward'); // boton de siguiente

    // mensaje con el embed
    const message = await msg.channel.send({
        embeds: [embed(0)],
        components: size <= 10 ? [] : [row(backOff, forward)],
    })

    if (size <= 10) return message; // se verifica si la cantidad de objetos dentro del embed es menor o igual a 10

    // filtro de los botones
    const filter = (interaction) => {
        if (interaction.user.id === msg.author.id) return true;
        return interaction.reply({ content: `solamente **${msg.author.tag}** puede hacer eso!`, ephemeral: true });
    };

    // el recolector de los botones
    const collector = message.channel.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        time: time
    });

    let index = 0; // index actual de la lista

    // funcion por cada vez que se preiona un boton
    collector.on('collect', async (interaction) => {
        if (interaction.customId === 'forward') index += 10; // se verifica si se presionó el boton de siguiente y se suman 10 al index
        if (interaction.customId === 'back') index -= 10; // se verifica si se presionó el boton de retroceso y se restan 10 al index

        // se actualiza el mensaje con el embed en el index actual
        await interaction.update({
            embeds: [embed(index)],
            components: [row((index === 0 ? backOff : back), (index + 10 > size ? forwardOff : forward))]
        })
    });

    // funcion para cuando se acaba la vida util de los botones
    collector.on('end', (collected) => {
        // se verifica si se activa la funcion de desactivar los botones, si es así se desactivan con el embed en el que quedó
        if (disabled) {
            const quoteEmbed = message.embeds[0] ? [EmbedBuilder.from(message.embeds[0])] : [];
            const disabledButton = message.components[0] ? [row(backOff, forwardOff)] : [];
            message.edit({ embeds: quoteEmbed, components: disabledButton });
        }
    })

    return message; // se retorna el mensaje con el embed
}