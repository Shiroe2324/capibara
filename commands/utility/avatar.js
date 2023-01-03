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
        const search = await Utils.findMember(msg, args, true);
        Utils.activedCommand(msg.author.id, 'remove');

        if (search.error) return search.message({ content: search.messageError, embeds: [], components: [] });

        if (search.member.id === msg.author.id && !search.member.user.avatarURL()) return search.message({ content: 'No tienes avatar!', embeds: [], components: [] });
        if (!search.member.user.avatarURL()) return search.message({ content: 'El usuario mencionado no tiene avatar!', embeds: [], components: [] });
        
        Utils.setCooldown('avatar', msg.author.id);

        const embed = (avatar) => new EmbedBuilder()
            .setAuthor({ name: `Avatar de ${search.member.user.tag}`, iconURL: avatar })
            .addFields([{ name: 'Imagen Completa', value: `[Click aquí](${avatar})` }])
            .setImage(avatar)
            .setFooter({ text: `ID: ${search.member.id}` })
            .setColor(Utils.color)

        if (!search.member.avatarURL()) {
            search.message({ embeds: [embed(search.member.user.avatarURL({ size: 2048, dynamic: true }))], components: [] });
        } else {
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

            const localButton = button('local', 'ver avatar local', '🌇');
            const globalButton = button('global', 'ver avatar global', '🌏'); 

            let avatar = search.member.user.avatarURL({ size: 2048, dynamic: true });
            let component = [localButton];

            const buttonMessage = await search.message({ embeds: [embed(avatar)], components: component });

            const filter = (interaction) => {
                if (interaction.user.id === msg.author.id) return true;
                return interaction.reply({ content: `solamente **${msg.author.tag}** puede hacer eso!`, ephemeral: true });
            };

            const collector = buttonMessage.createMessageComponentCollector({ filter, time: 60000, componentType: ComponentType.Button });

            collector.on('collect', async (interaction) => {
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

                await interaction.update({ embeds: [embed(avatar)], components: component });
            });

            collector.on('end', async (collected) => {
                const quoteEmbed = EmbedBuilder.from(buttonMessage.embeds[0]);
                const disabledButton = buttonMessage.components[0].components[0].data.custom_id === 'global' ?
                    button('global', 'ver avatar global', '🌏', true) :
                    button('local', 'ver avatar local', '🌇', true);

                buttonMessage.edit({ embeds: [quoteEmbed], components: [disabledButton] }); 
            })
        }
    }
}