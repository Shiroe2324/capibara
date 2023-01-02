const { ComponentType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, Message, Client } = require('discord.js');
const Utils = require('../../utils');

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

    /**
     * funcion con el codigo a ejecutar del comando.
     * @param {Message} msg - El mensaje enviado por el usuario.
     * @param {string[]} args - Los argumentos del mensaje enviado por el usuario.
     * @param {Client} client - El cliente del bot.
     */
    execute: async (msg, args, client) => {
        Utils.activedCommand(msg.author.id, 'add');
        const search = await Utils.findMember(msg, args, true); // funcion para buscar miembros en un server
        Utils.activedCommand(msg.author.id, 'remove');

        if (search.error) return search.message({ content: search.messageError, embeds: [], components: [] }); // verificador si hay algun error al buscar el miembro

        // verificador de si el miembro tiene avatar
        if (!search.member.user.avatarURL()) return search.message({ content: 'El usuario mencionado no tiene avatar', embeds: [], components: [] });
        
        Utils.setCooldown('avatar', msg.author.id); // se establece el cooldown

        // funcion que genera un embed con el avatar agregado
        const embed = (avatar) => new EmbedBuilder()
            .setAuthor({ name: `Avatar de ${search.member.user.tag}`, iconURL: avatar })
            .addFields([{ name: 'Imagen Completa', value: `[Click aquí](${avatar})` }])
            .setImage(avatar)
            .setFooter({ text: `ID: ${search.member.id}` })
            .setColor(Utils.color)

        /*se verifica si el usuario tiene avatar en el servidor, si es asi se envia el embed con los botones para cambiar entre avatars
        en caso contrario solamente se envía el embed sin botones*/
        if (!search.member.avatarURL()) {
            // mensaje con el embed sin botones
            search.message({ embeds: [embed(search.member.user.avatarURL({ size: 2048, dynamic: true }))], components: [] });
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

            let avatar = search.member.user.avatarURL({ size: 2048, dynamic: true }); // URL del avatar del usuario
            let component = [localButton] // componente del mensaje

            // el mensaje enviado por el bot con los botones y el embed
            const buttonMessage = await search.message({ embeds: [embed(avatar)], components: component });

            //el filtro para los botones, solo permite que el autor pueda usar el boton
            const filter = (interaction) => {
                if (interaction.user.id === msg.author.id) return true;
                return interaction.reply({ content: `solamente **${msg.author.tag}** puede hacer eso!`, ephemeral: true });
            };

            // el collector que verificará los botones
            const collector = buttonMessage.createMessageComponentCollector({ filter, time: 60000, componentType: ComponentType.Button });

            // evento cuando un boton es presionado
            collector.on('collect', async (interaction) => {
                /*se verifica si el usuario tiene avatar en el servidor | si el boton presionado es el global o el local
                dependiendo del boton seleccionado, se envía el avatar global o local, si no tiene avatar local, solo se envía el global sin botones*/
                if (!search.member.avatarURL()) {
                    avatar = search.member.user.avatarURL({ size: 2048, dynamic: true });
                    component = []
                } else if (interaction.customId === 'local') {
                    avatar = search.member.avatarURL({ size: 2048, dynamic: true });
                    component = [globalButton]
                } else if (interaction.customId === 'global') {
                    avatar = search.member.user.avatarURL({ size: 2048, dynamic: true });
                    component = [localButton]
                }

                await interaction.update({ embeds: [embed(avatar)], components: component }); // se envia el avatar seleccionado
            });

            // evento cuando los botones terminan su vida util
            collector.on('end', async (collected) => {
                const quoteEmbed = EmbedBuilder.from(buttonMessage.embeds[0]); // embed en el que quedó el mensaje
                const disabledButton = buttonMessage.components[0].components[0].data.custom_id === 'global' ? // botón en el que quedó el mensaje
                    button('global', 'ver avatar global', '🌏', true) :
                    button('local', 'ver avatar local', '🌇', true);

                buttonMessage.edit({ embeds: [quoteEmbed], components: [disabledButton] }); // se edita el embed con el botón desabilitado
            })
        }
    }
}