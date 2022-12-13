const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'avatar',
    aliases: ['av'],
    cooldown: 3000,
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks
    ],
    userPermissions: [],
    execute: async (msg, args, client, color, Utils) => {
        const helper = new Utils(msg, args, client);
        const member = await helper.findMember(true); // funcion para buscar miembros en un server

        if (member.error) return msg.reply(member.messageError); // verificador si hay algun error al buscar el miembro

        const avatar = member.user.avatarURL({ size: 2048, dynamic: true }) // url del avatar del miembro

        if (avatar === null) return msg.reply('El usuario mencionado no tiene avatar') // verificador de si el miembro tiene avatar

        Utils.setCooldown('avatar', msg.author.id); // se establece el cooldown

        // embed con el avatar del miembro
        const embed = new EmbedBuilder()
            .setAuthor({ name: `Avatar de ${member.user.tag}`, iconURL: avatar })
            .addFields([{ name: 'Imagen Completa', value: `[Click aquí](${avatar})` }])
            .setImage(avatar)
            .setFooter({ text: `ID: ${member.id}` })
            .setColor(color)

        msg.channel.send({ embeds: [embed] }) // mensaje con el embed
    }
}