const { ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

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
        const { member, error, messageError, message } = await Utils.findMember(msg, args, true); // funcion para buscar miembros en un server

        if (error) return message ? message.edit({ content: messageError, embeds: [] }) : msg.reply(messageError); // verificador si hay algun error al buscar el miembro

        // verificador de si el miembro tiene avatar
        if (!member.user.avatarURL()) {
            if (message) {
                return message.edit({ content: 'El usuario mencionado no tiene avatar', embeds: [] });
            } else {
                msg.reply('el usuario mencionado no tiene avatar');
            }
        }

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
            // mensaje con el embed sin botones
            if (message) {
                message.edit({ embeds: [embed(member.user.avatarURL({ size: 2048, dynamic: true }))] })
            } else {
                msg.channel.send({ embeds: [embed(member.user.avatarURL({ size: 2048, dynamic: true }))] })
            }
        } else {
            // funcion que genera un nuevo boton
            const button = (id, label, emoji, disable = false) => {
                return new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(id)
                        .setLabel(label)
                        .setEmoji(emoji)
                        .setDisabled(disable)
                        .setStyle(ButtonStyle.Primary)
                );
            }

            const localButton = button('local', 'ver avatar local', '🌇'); // boton para ver el avatar local
            const globalButton = button('global', 'ver avatar global', '🌏'); // boton para ver el avatar global

            let avatar = member.user.avatarURL({ size: 2048, dynamic: true }); // URL del avatar del usuario
            let component = [localButton] // componente del mensaje

            // el mensaje enviado por el bot con los botones y el embed
            const bMessage = message ? await message.edit({ embeds: [embed(avatar)], components: component }) : await msg.channel.send({ embeds: [embed(avatar)], components: component });

            //el filtro para los botones, solo permite que el autor pueda usar el boton
            const filter = (interaction) => {
                if (interaction.user.id === msg.author.id) return true;
                return interaction.reply({ content: `solamente **${msg.author.tag}** puede hacer eso!`, ephemeral: true });
            };

            // el collector que verificará los botones
            const collector = bMessage.channel.createMessageComponentCollector({ filter, time: 60000, componentType: ComponentType.Button });

            // evento cuando un boton es presionado
            collector.on('collect', async (interaction) => {
                /*se verifica si el usuario tiene avatar en el servidor | si el boton presionado es el global o el local
                dependiendo del boton seleccionado, se envía el avatar global o local, si no tiene avatar local, solo se envía el global sin botones*/
                if (!member.avatarURL()) {
                    avatar = member.user.avatarURL({ size: 2048, dynamic: true });
                    component = []
                } else if (interaction.customId === 'local') {
                    avatar = member.avatarURL({ size: 2048, dynamic: true });
                    component = [globalButton]
                } else if (interaction.customId === 'global') {
                    avatar = member.user.avatarURL({ size: 2048, dynamic: true });
                    component = [localButton]
                }

                await interaction.update({ embeds: [embed(avatar)], components: component }); // se envia el avatar seleccionado
            });

            collector.on('end', async (collected) => {
                const quoteEmbed = EmbedBuilder.from(bMessage.embeds[0]);
                const disabledButton = bMessage.components[0].components[0].data.custom_id === 'global' ?
                    button('global', 'ver avatar global', '🌏', true) :
                    button('local', 'ver avatar local', '🌇', true);

                bMessage.edit({ embeds: [quoteEmbed], components: [disabledButton] });
            })
        }
    }
}