const { PermissionFlagsBits, Message, Client, EmbedBuilder } = require('discord.js');
const Utils = require('../../utils');

/**
 * @property name - The name of the command.
 * @property usage - The syntax in which the command is used.
 * @property examples - Examples of how to use the command.
 * @property aliases - The aliases of the command.
 * @property cooldown - the cooldown time of the command
 * @property category - The name of the command category.
 * @property description - The description of the command.
 * @property onlyCreator - Check if the command is only for the creator of the bot.
 * @property botPermissions - List of bot permissions for the command.
 * @property userPermissions - List of user permissions for the command.
 */
module.exports = {
    name: 'leaderboard',
    usage: 'leaderboard',
    examples: ['leaderboard'],
    aliases: ['lb', 'levels'],
    cooldown: 10000,
    category: 'utilidad',
    description: ['Muestra la lista de los usuarios con más xp del servidor.'],
    onlyCreator: false,
    botPermissions: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.UseExternalEmojis
    ],
    userPermissions: [],

    /**
     * function with the code to execute the command.
     * @param {Message} msg - The message sent by the user.
     * @param {string[]} args - The arguments of the message sent by the user.
     * @param {Client} client - The bot's client.
     */
    execute: async (msg, args, client) => {
        const users = await Utils.schemas.guildUser.find({ guild: msg.guildId }).sort([['xp', 'descending']]).exec();
        const rawLeaderboard = users.slice(0, 1000).filter(u => u.user !== client.user.id && u.xp !== 0);

        if (rawLeaderboard.length === 0) return Utils.send(msg, 'Aún no hay nadie en la tabla de clasificación.');

        const leaderboard = [];

        for (const key of rawLeaderboard) {
            let user;
            try {
                user = await client.users.fetch(key.user);
            } catch (err) {
                user = { username: "Unknown", discriminator: "0000" };
            }

            leaderboard.push({
                guild: key.guild,
                user: key.user,
                xp: key.xp,
                level: key.level,
                position: (rawLeaderboard.findIndex(i => i.guild === key.guild && i.user === key.user) + 1),
                username: user.username,
                discriminator: user.discriminator
            });
        }

        const embed = async (index) => {
            const current = leaderboard.slice(index, index + 10);

            const thumbnail = client.users.cache.get(leaderboard[0].user);
            let description = '';

            for (let user of current) {
                let position;

                switch (user.position) {
                    case 1: position = ":first_place:"; break;
                    case 2: position = ":second_place:"; break;
                    case 3: position = ":third_place:"; break;
                    default: position = `${user.position} |`;
                };

                description += `**${position} ❥╏${user.username}#${user.discriminator}**\n`;
                description += `Nivel ${user.level} - Total: ${Utils.formatNumber(user.xp)} XP\n\n`;
            };

            return new EmbedBuilder()
                .setTitle('<a:Star:1062098680246718589> Level Ranking <a:Star:1062098680246718589>')
                .setDescription(description)
                .setThumbnail(thumbnail.avatarURL({ dynamic: true }) || client.user.avatarURL())
                .setColor(Utils.color)
                .setFooter({ text: `Pedido por ${msg.author.username}`, iconURL: msg.author.avatarURL({ dynamic: true }) })
                .setTimestamp();
        };

        Utils.pageSystem(msg, embed, leaderboard.length, 300000, true);
    }
}
