const superagent = require('superagent'); // se importa superagent para la busqueda de la API
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'hexcolor',
    aliases: ['hex'],
    cooldown: 3000,
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks
    ],
    userPermissions: [],
    execute: async (msg, args, client, Utils) => {
        // se verifica por medio de una RegExp si el color dado es correcto, ejemplos: ['#D9022B', 'FF00FF', '#abcdef']
        if (!/^#?[0-9a-f]{6}$/i.test(args[0])) return msg.reply('Tienes que colocar un color en formato hex válido!');

        Utils.setCooldown('hexcolor', msg.author.id); // se establece el cooldown

        try {
            const color = args[0].toLowerCase().replace('#', ''); // se quita el # y las letras se pasan a minusculas
            const { body } = await superagent.get(`https://api.alexflipnote.dev/color/${color}`) // se busca por medio de una API el color dado

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