const superagent = require('superagent'); // se importa superagent para la busqueda de la API
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'randomcolor',
    usage: 'randomcolor',
    aliases: ['randcolor'],
    cooldown: 3000,
    category: 'utilidad',
    description: 'Genera un color aleatorio en formato.',
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks
    ],
    userPermissions: [],
    execute: async (msg, args, client, Utils) => {
        Utils.setCooldown('randomcolor', msg.author.id); // se establece el cooldown

        try {
            let color = '';
            for (let x = 0; x < 6; x++) {
                color += `${Utils.random(16).toString(16)}`;
            };

            const { body } = await superagent.get(`https://api.alexflipnote.dev/color/${color}`) // se busca por medio de una API el color

            // embed con los datos del color
            const embed = new EmbedBuilder()
                .setColor(`#${color}`)
                .setTitle(body.name)
                .setImage(body.images.square)
                .addFields([
                    { name: '**Hex**', value: body.hex.string.toUpperCase(), inline: true },
                    { name: '**RGB**', value: `${body.rgb.values[0]}, ${body.rgb.values[1]}, ${body.rgb.values[2]}`, inline: true }
                ]);

            msg.reply({ embeds: [embed] }); // se envía el embed
        } catch (e) {
            msg.reply(`Sucedió un error al buscar el color: ${e}`) // si hay un error al buscar el color, se le informa al usuario
        }

    }
}