const { codeBlock, EmbedBuilder, PermissionFlagsBits, Message, Client, PermissionsBitField, ComponentType, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const Utils = require('../../utils');

/**
 * @property name - The name of the command.
 * @property usage - The syntax in which the command is used.
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
    aliases: ['h'],
    cooldown: 5000,
    category: 'utilidad',
    description: 'Muestra infomación sobre un comando o categoria en especifico.',
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
        const categorys = ['economia', 'utilidad', 'roleplay', 'administracion'];
        const economyCommands = client.commands.filter(c => c.category === 'economia').map(x => x.name);
        const utilCommands = client.commands.filter(c => c.category === 'utilidad').map(x => x.name);
        const roleplayCommands = client.commands.filter(c => c.category === 'roleplay').map(x => x.name);
        const adminCommands = client.commands.filter(c => c.category === 'administracion').map(x => x.name);
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

        if (args[0] && !categorys.some(c => c === Utils.removeAccents(args[0]))) {
            const command = client.commands.get(Utils.removeAccents(args[0])) || client.commands.find((cmd) => cmd.aliases.includes(Utils.removeAccents(args[0])));
            if (!command) return Utils.send(msg, 'No existe ese comando.');

            Utils.setCooldown('help', msg.author.id, msg.guildId);
            
            let fields = [{ name: 'Uso', value: `\`${guild.prefix}${command.usage}\`` }];
            
            if (command.onlyCreator) fields.push({ name: 'Comando Privado', value: 'Este comando solo puede ser ejecutado por el creador del bot.' });
            if (command.aliases.length !== 0) fields.push({ name: 'Aliases', value: command.aliases.join(', ') });
            if (command.cooldown !== 0) fields.push({ name: 'Cooldown', value: Utils.setTimeFormat(command.cooldown) });

            const botPermissions = new PermissionsBitField(command.botPermissions).toArray().map(permission => Utils.Permissions[permission]);
            const userPermissions = new PermissionsBitField(command.userPermissions).toArray().map(permission => Utils.Permissions[permission]);

            fields.push({ name: 'Permisos del bot', value: command.botPermissions.length !== 0 ? botPermissions.join('\n') : 'Ninguno', inline: true });
            fields.push({ name: 'Permisos del usuario', value: command.userPermissions.length !== 0 ? userPermissions.join('\n') : 'Ninguno', inline: true });

            const commandEmbed = new EmbedBuilder()
                .setAuthor({ name: command.name, iconURL: client.user.avatarURL() })
                .setDescription(command.description.split('{coins}').join(guild.coin))
                .addFields(fields)
                .setFooter({ text: 'Sintaxis: (opcional) [requerido]' })
                .setColor(Utils.color)

            return Utils.send(msg, { embeds: [commandEmbed] })
        }
        
        Utils.setCooldown('help', msg.author.id, msg.guildId);

        const allEmbed = new EmbedBuilder()
            .setAuthor({ name: client.user.username })
            .setThumbnail(client.user.avatarURL({ size: 2048 }))
            .setDescription(`Actualmente el bot cuenta con unas \`${categorys.length}\` categorias.\n\nPara mas información sobre una categoria o comando puedes colocar los siguientes comandos:`)
            .setColor(Utils.color)
            .addFields([
                { name: 'Categorías', value: `\`${guild.prefix}help (categoria)\``, inline: true },
                { name: 'Comandos', value: `\`${guild.prefix}help (comando)\``, inline: true },
                { name: '\u200b', value: setBlockFormat(categorys) }
            ]);

        const economyEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Economía', iconURL: client.user.avatarURL() })
            .setDescription(`Estos son los comandos de \`Economia\`.\nPuedes usarlos para ganar o administrar tus **${guild.coin}**.\n\nPuedes ver información mas detallada de un comando con \`${guild.prefix}help (comando)\``)
            .setColor(Utils.color)
            .addFields([{ name: 'Comandos', value: setBlockFormat(economyCommands) }]);

        const utilEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Utilidad', iconURL: client.user.avatarURL() })
            .setDescription(`Estos son los comandos de \`Utilidad\`.\nSirven para variedad de cosas como ver el avatar o emojis de un server.\n\nPuedes ver información mas detallada de un comando con \`${guild.prefix}help (comando)\``)
            .setColor(Utils.color)
            .addFields([{ name: 'Comandos', value: setBlockFormat(utilCommands) }]);

        const roleplayEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Roleplay', iconURL: client.user.avatarURL() })
            .setDescription(`Estos son los comandos \`Roleplay\`.\nSon comandos con los cuales puedes interactuar con otros usuarios.\n\nPuedes ver información mas detallada de un comando con \`${guild.prefix}help (comando)\``)
            .setColor(Utils.color)
            .addFields([{ name: 'Comandos', value: setBlockFormat(roleplayCommands) }]);

        const adminEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Administración', iconURL: client.user.avatarURL() })
            .setDescription(`Estos son los comandos de \`Administración\`.\nSirven para administrar, moderar o configurar el servidor.\n\nPuedes ver información mas detallada de un comando con \`${guild.prefix}help (comando)\``)
            .setColor(Utils.color)
            .addFields([{ name: 'Comandos', value: setBlockFormat(adminCommands) }]);

        let embed = allEmbed;
        switch (Utils.removeAccents(args[0]?.toLowerCase())) {
            case 'economia': embed = economyEmbed; break;
            case 'utilidad': embed = utilEmbed; break;
            case 'roleplay': embed = roleplayEmbed; break;
            case 'administracion': embed = adminEmbed; break;
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
                            value: 'first',
                        },
                        {
                            label: 'Economía',
                            description: 'Panel con comandos de economía',
                            value: 'second',
                        },
                        {
                            label: 'Utilidad',
                            description: 'Panel con comandos de utilidad',
                            value: 'third',
                        },
                        {
                            label: 'Roleplay',
                            description: 'Panel con comandos roleplay',
                            value: 'fourth',
                        },
                        {
                            label: 'Administración',
                            description: 'Panel con comandos de administracion',
                            value: 'five',
                        }
                    )
            );

        const message = await Utils.send(msg, { embeds: [embed], components: [row] });

        const filter = (interaction) => {
            if (interaction.user.id === msg.author.id) return true;
            return interaction.reply({ content: `solamente **${msg.author.tag}** puede hacer eso!`, ephemeral: true })
        };

        const collector = message.createMessageComponentCollector({ filter, time: 120000, componentType: ComponentType.StringSelect });

        collector.on('collect', async (interaction) => {
            switch (interaction.values[0]) {
                case 'first': await interaction.update({ embeds: [allEmbed] }); break;
                case 'second': await interaction.update({ embeds: [economyEmbed] }); break;
                case 'third': await interaction.update({ embeds: [utilEmbed] }); break;
                case 'fourth': await interaction.update({ embeds: [roleplayEmbed] }); break;
                case 'five': await interaction.update({ embeds: [adminEmbed] }); break;
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                const quoteEmbed = EmbedBuilder.from(message.embeds[0]);
                message.edit({ embeds: [quoteEmbed], components: [] })
            }
        })
    }
}
