const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'avatar',
    usage: 'avatar (miembro)',
    aliases: ['av'],
    cooldown: 3000,
    category: 'utilidad',
    description: 'Muestra el avatar global o local de un usuario.',
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks
    ],
    userPermissions: [],
    execute: async (msg, args, client, Utils) => {
        const member = await Utils.findMember(msg, args, true); // funcion para buscar miembros en un server

        if (member.error) return msg.reply(member.messageError); // verificador si hay algun error al buscar el miembro

        if (member.user.avatarURL({ size: 2048, dynamic: true }) === null) return msg.reply('El usuario mencionado no tiene avatar') // verificador de si el miembro tiene avatar

        Utils.setCooldown('avatar', msg.author.id); // se establece el cooldown

        // funcion que genera un embed con el avatar agregado
        const embed = (avatar) => new EmbedBuilder()
            .setAuthor({ name: `Avatar de ${member.user.tag}`, iconURL: avatar })
            .addFields([{ name: 'Imagen Completa', value: `[Click aquí](${avatar})` }])
            .setImage(avatar)
            .setFooter({ text: `ID: ${member.id}` })
            .setColor(Utils.color)

        /*se verifica si el usuario tiene avatar en el servidor, si es asi se envia el embed con los botones para cambiar entre avatars
        en caso contrario solamente se envía el embed sin botones*/
        if (!member.avatarURL()) {
            msg.channel.send({ embeds: [embed(member.user.avatarURL({ size: 2048, dynamic: true }))] }) // mensaje con el embed sin botones
        } else {
            // funcion que genera una nueva linea de botones
            const row = (component) => new ActionRowBuilder()
                .addComponents(component);

            // funcion que genera un nuevo boton
            const button = (id, label, emoji) => new ButtonBuilder()
                .setCustomId(id)
                .setLabel(label)
                .setEmoji(emoji)
                .setStyle(ButtonStyle.Primary);

            // el mensaje enviado por el bot con los botones y el embed
            const message = await msg.channel.send({
                embeds: [embed(member.user.avatarURL({ size: 2048, dynamic: true }))],
                components: [row(button('local', 'ver avatar local', '🌇'))]
            });

            //el filtro para los botones
            const filter = (interaction) => {
                if (interaction.user.id === msg.author.id) return true;
                return interaction.reply({ content: `solamente **${msg.author.tag}** puede hacer eso!`, ephemeral: true });
            };

            // el collector que verificará los botones
            const collector = message.channel.createMessageCollector(filter, { time: 60000 });

            // evento cuando un boton es presionado
            collector.on('collect', async (interaction) => {
                let avatar, component; // el link del avatar y la linea de botones

                // se verifica si el usuario tiene avatar en el servidor | si el boton presionado es el global o el local
                if (member.avatarURL() === null) {
                    avatar = member.user.avatarURL({ size: 2048, dynamic: true });
                    component = [];
                } else if (interaction.customId === 'local') {
                    avatar = member.avatarURL({ size: 2048, dynamic: true });
                    component = [row(button('global', 'ver avatar global', '🌏'))];
                } else if (interaction.customId === 'global') {
                    avatar = member.user.avatarURL({ size: 2048, dynamic: true });
                    component = [row(button('local', 'ver avatar local', '🌇'))];
                }

                // se actualiza el mensaje con el avatar y su respectivo boton
                await interaction.update({ embeds: [embed(avatar)], components: component });
            });
        }
    }
}