const { codeBlock, EmbedBuilder, PermissionFlagsBits, Message, Client, PermissionsBitField, ComponentType, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
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
    name: 'help',
    usage: 'help (comando | categoria)',
    examples: ['help', 'help utilidad', 'help blackjack'],
    aliases: ['h'],
    cooldown: 5000,
    category: 'utilidad',
    description: ['Muestra infomación sobre un comando o categoria en especifico.'],
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
        const guild = await Utils.guildFetch(msg.guildId);
        const setBlockFormat = (list) => {
            let formatedList = '';
            for (let i of list) {
                formatedList += `${i}`;
                for (let x = 0; x < 16 - i.length; x++) {
                    formatedList += ' ';
                }
            }
            return codeBlock(formatedList);
        }
        const formatters = [
            { name: 'coins', value: guild.coin },
            { name: 'dailyValue', value: Utils.formatNumber(guild.dailyValue) },
            { name: 'minimumBet', value: Utils.formatNumber(guild.minimumBet) },
            { name: 'minWorkValue', value: Utils.formatNumber(guild.workValue.min) },
            { name: 'maxWorkValue', value: Utils.formatNumber(guild.workValue.max) },
            { name: 'minCrimeValue', value: Utils.formatNumber(guild.crimeValue.min) },
            { name: 'maxCrimeValue', value: Utils.formatNumber(guild.crimeValue.max) },
            { name: 'crimeFail', value: guild.crimeValue.fail * 100 },
            { name: 'levelSystem', value: guild.levelSystem ? 'Activado' : 'Desactivado'},
            { name: 'levelChannel', value: guild.levelChannel === 'none' ? 'Default' : msg.guild.channels.cache.get(guild.levelChannel).toString() },
            { name: 'levelMessage', value: guild.levelMessage },
            { name: 'minXp', value: Utils.formatNumber(guild.xp.min) },
            { name: 'maxXp', value: Utils.formatNumber(guild.xp.max) },
            { name: 'prefix', value: guild.prefix }
        ];

        if (args[0] && !client.categorys.some(category => category.id === Utils.removeAccents(args[0]))) {
            const command = client.commands.get(Utils.removeAccents(args[0]).toLowerCase()) || client.commands.find((cmd) => cmd.aliases.includes(Utils.removeAccents(args[0]).toLowerCase()));
            if (!command) return Utils.send(msg, 'No existe ese comando.');

            Utils.setCooldown('help', msg.author.id, msg.guildId);

            let description = command.description.join('\n');

            for (const format of formatters) {
                description = description.split(`{${format.name}}`).join(format.value);
            }

            let fields = [
                { name: 'Uso', value: `\`${guild.prefix}${command.usage}\``, inline: true },
                { name: command.examples.length === 1 ? 'Ejemplo' : 'Ejemplos', value: command.examples.map(example => `${guild.prefix}${example}`).join('\n'), inline: true },
            ];

            if (command.onlyCreator) fields.push({ name: 'Comando Privado', value: 'Este comando solo puede ser ejecutado por el creador del bot.' });
            if (command.aliases.length !== 0) fields.push({ name: 'Aliases', value: command.aliases.join(', ') });
            if (command.cooldown !== 0) fields.push({ name: 'Cooldown', value: Utils.setTimeFormat(command.cooldown) });

            const botPermissions = new PermissionsBitField(command.botPermissions).toArray().map(permission => Utils.Permissions[permission]);
            const userPermissions = new PermissionsBitField(command.userPermissions).toArray().map(permission => Utils.Permissions[permission]);

            fields.push({ name: 'Permisos del bot', value: command.botPermissions.length !== 0 ? botPermissions.join('\n') : 'Ninguno', inline: true });
            fields.push({ name: 'Permisos del usuario', value: command.userPermissions.length !== 0 ? userPermissions.join('\n') : 'Ninguno', inline: true });

            const commandEmbed = new EmbedBuilder()
                .setAuthor({ name: command.name, iconURL: client.user.avatarURL() })
                .setDescription(description)
                .addFields(fields)
                .setFooter({ text: 'Sintaxis: (opcional) [requerido]' })
                .setColor(Utils.color)

            return Utils.send(msg, { embeds: [commandEmbed] })
        }

        Utils.setCooldown('help', msg.author.id, msg.guildId);

        const allEmbed = new EmbedBuilder()
            .setAuthor({ name: client.user.username })
            .setThumbnail(client.user.avatarURL({ size: 2048 }))
            .setDescription(`Actualmente el bot cuenta con unas \`${client.categorys.size}\` categorias y \`${client.commands.size}\` comandos.\n\nPara mas información sobre una categoria o comando puedes colocar los siguientes comandos:`)
            .setColor(Utils.color)
            .addFields([
                { name: 'Categorías', value: `\`${guild.prefix}help (categoria)\``, inline: true },
                { name: 'Comandos', value: `\`${guild.prefix}help (comando)\``, inline: true },
                { name: '\u200b', value: setBlockFormat(client.categorys.map(category => category.id)) }
            ]);

        const categoryEmbed = (category) => {
            let description = category.description;
            for (const format of formatters) {
                description = description.split(`{${format.name}}`).join(format.value);
            }
            return new EmbedBuilder()
                .setAuthor({ name: category.name, iconURL: client.user.avatarURL() })
                .setDescription(`Estos son los comandos de \`${category.name}\`.\n${description}\n\nPuedes ver información mas detallada de un comando con \`${guild.prefix}help (comando)\``)
                .setColor(Utils.color)
                .addFields([{ name: 'Comandos', value: setBlockFormat(category.commands) }]);
        }

        let embed = allEmbed;
        if (client.categorys.some(category => category.id === Utils.removeAccents(args[0]))) {
            embed = categoryEmbed(client.categorys.get(Utils.removeAccents(args[0])));
        }

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('categorys')
                    .setPlaceholder('Selecciona una categoria para ver')
                    .addOptions(
                        {
                            label: 'Inicio',
                            description: 'Panel principal con todas las categorías',
                            value: 'init',
                        },
                        ...(client.categorys.map(category => {
                            return {
                                label: category.name,
                                description: `Panel con comandos de ${category.name}`,
                                value: category.id
                            }
                        }))
                    )
            );

        const message = await Utils.send(msg, { embeds: [embed], components: [row] });

        const filter = (interaction) => {
            if (interaction.user.id === msg.author.id) return true;
            return interaction.reply({ content: `solamente **${msg.author.tag}** puede hacer eso!`, ephemeral: true });
        };

        const collector = message.createMessageComponentCollector({ filter, time: 120000, componentType: ComponentType.StringSelect });

        collector.on('collect', async (interaction) => {
            if (interaction.values[0] === 'init') {
                await interaction.update({ embeds: [allEmbed] });
            } else {
                const category = client.categorys.get(interaction.values[0]);
                await interaction.update({ embeds: [categoryEmbed(category)] });
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                const quoteEmbed = EmbedBuilder.from(message.embeds[0]);
                message.edit({ embeds: [quoteEmbed], components: [] })
            }
        });
    }
}