const { PermissionFlagsBits, Message, Client, EmbedBuilder } = require('discord.js');
const Utils = require('../../utils');
const nekoClient = require('nekos.life');
const neko = new nekoClient();

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
    name: 'pat',
    usage: 'pat [usuario]',
    aliases: [],
    cooldown: 4000,
    category: 'roleplay',
    description: 'Acaricia la cabeza de un usuario.',
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
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
        const search = await Utils.findMember(msg, args);
        Utils.activedCommand(msg.author.id, 'remove');

        if (search.error) return search.message({ content: search.messageError, embeds: [], components: [] }).catch(e => console.log(e));
        if (search.member.id === msg.author.id) return search.message({ content: 'No te puedes acariciar a ti mismo!', embeds: [], components: [] }).catch(e => console.log(e));

        Utils.setCooldown('pat', msg.author.id);

        const image = await neko.pat();

        if (search.member.user.bot) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: `${msg.author.username} acarició la cabeza de ${search.member.user.username}.` })
                .setImage(image.url)
                .setColor(Utils.color);

            return search.message({ embeds: [embed], components: [] }).catch(e => console.log(e));
        }

        const user = await Utils.userFetch(search.member.id, 'global');

        user.pats += 1;
        user.save();

        const patAmount = user.pats === 1 ? 'caricia' : 'caricias';

        const embed = new EmbedBuilder()
            .setAuthor({ name: `${msg.author.username} acarició la cabeza de ${search.member.user.username}.` })
            .setDescription(`**${search.member.user.username}** ha recibido **${user.pats}** ${patAmount} en total.`)
            .setImage(image.url)
            .setColor(Utils.color);

        return search.message({ embeds: [embed], components: [] }).catch(e => console.log(e));
    }
}