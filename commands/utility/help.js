const { codeBlock, EmbedBuilder, PermissionFlagsBits, Message, Client, PermissionsBitField, ComponentType, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
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
     * funcion con el codigo a ejecutar del comando.
     * @param {Message} msg - El mensaje enviado por el usuario.
     * @param {string[]} args - Los argumentos del mensaje enviado por el usuario.
     * @param {Client} client - El cliente del bot.
     */
    execute: async (msg, args, client) => {
        const guild = await Utils.guildFetch(msg.guild.id);
        const categorys = ['economia', 'utilidad', 'administracion'];
        const utilCommands = client.commands.filter(c => c.category === 'utilidad').map(x => x.name);
        const economyCommands = client.commands.filter(c => c.category === 'economia').map(x => x.name);
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

        if (args[0] && !categorys.some(c => c === args[0])) {
            const command = client.commands.get(Utils.removeAccents(args[0])) || client.commands.find((cmd) => cmd.aliases.includes(Utils.removeAccents(args[0])));
            if (!command) return msg.reply('No existe ese comando.');

            let fields = [{ name: 'Uso', value: `\`${guild.prefix}${command.usage}\`` }];

            if (command.aliases.length !== 0) fields.push({ name: 'Aliases', value: command.aliases.join(', ') });
            if (command.cooldown !== 0) fields.push({ name: 'Cooldown', value: Utils.setTimeFormat(Date.now() + command.cooldown + 700) });

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

            return msg.channel.send({ embeds: [commandEmbed] });
        }

        const allEmbed = new EmbedBuilder()
            .setAuthor({ name: client.user.username })
            .setThumbnail(client.user.avatarURL({ size: 2048 }))
            .setDescription(`Actualmente el bot cuenta con unas \`3\` categorias.\n\nPara mas información sobre una categoria o comando puedes colocar los siguientes comandos:`)
            .setColor(Utils.color)
            .addFields([
                { name: 'Categorías', value: `\`${guild.prefix}help (categoria)\``, inline: true },
                { name: 'Comandos', value: `\`${guild.prefix}help (comando)\``, inline: true },
                { name: '\u200b', value: setBlockFormat(categorys) }
            ]);

        const utilEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Utilidad', iconURL: client.user.avatarURL() })
            .setDescription(`Estos son los comandos de \`Utilidad\`.\nSirven para variedad de cosas como ver el avatar o emojis de un server.\n\nPuedes ver información mas detallada de un comando con \`${guild.prefix}help (comando)\``)
            .setColor(Utils.color)
            .addFields([{ name: 'Comandos', value: setBlockFormat(utilCommands) }]);

        const economyEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Economía', iconURL: client.user.avatarURL() })
            .setDescription(`Estos son los comandos de \`Economia\`.\nPuedes usarlos para ganar o administrar tus **${guild.coin}**.\n\nPuedes ver información mas detallada de un comando con \`${guild.prefix}help (comando)\``)
            .setColor(Utils.color)
            .addFields([{ name: 'Comandos', value: setBlockFormat(economyCommands) }]);

        const adminEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Administración', iconURL: client.user.avatarURL() })
            .setDescription(`Estos son los comandos de \`Administración\`.\nSirven para administrar, moderar o configurar el servidor.\n\nPuedes ver información mas detallada de un comando con \`${guild.prefix}help (comando)\``)
            .setColor(Utils.color)
            .addFields([{ name: 'Comandos', value: setBlockFormat(adminCommands) }]);

        let embed = allEmbed;
        switch (Utils.removeAccents(args[0]?.toLowerCase())) {
            case 'utilidad': embed = utilEmbed; break;
            case 'economia': embed = economyEmbed; break;
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
                            label: 'Administración',
                            description: 'Panel con comandos de administracion',
                            value: 'fourth',
                        }
                    )
            );

        const message = await msg.channel.send({ embeds: [embed], components: [row] });

        const filter = (interaction) => {
            if (interaction.user.id === msg.author.id) return true;
            return interaction.reply({ content: `solamente **${msg.author.tag}** puede hacer eso!`, ephemeral: true });
        };

        const collector = message.createMessageComponentCollector({ filter, time: 120000, componentType: ComponentType.StringSelect });

        collector.on('collect', async (interaction) => {
            switch (interaction.values[0]) {
                case 'first': await interaction.update({ embeds: [allEmbed] }); break;
                case 'second': await interaction.update({ embeds: [economyEmbed] }); break;
                case 'third': await interaction.update({ embeds: [utilEmbed] }); break;
                case 'fourth': await interaction.update({ embeds: [adminEmbed] }); break;
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                const quoteEmbed = EmbedBuilder.from(message.embeds[0]);
                message.edit({ embeds: [quoteEmbed], components: [] });
            }
        })
    }
}