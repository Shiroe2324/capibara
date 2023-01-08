const { Client } = require('discord.js');
const fs = require('fs');
const commandsPath = fs.readdirSync('./commands');

/**
 * Iterates through each file with commands and categorys and adds them in a Discord Collection.
 * @param {Client} client - the Discord client.
 * @returns {void}
 */
module.exports = (client) => {
    for (const commandsCategory of commandsPath) {
        const commandsCategoryPath = fs.readdirSync(`./commands/${commandsCategory}`);
        for (let commandFile of commandsCategoryPath) {
            const command = require(`./commands/${commandsCategory}/${commandFile}`);
            client.commands.set(command.name, command);
        }
    }

    const categorys = [
        {
            id: 'economia',
            name: 'Economía',
            description: 'Puedes usarlos para ganar o administrar tus **{coins}**.',
            commands: client.commands.filter(c => c.category === 'economia').map(x => x.name)
        },
        {
            id: 'utilidad',
            name: 'Utilidad',
            description: 'Sirven para variedad de cosas como ver el avatar o emojis de un server.',
            commands: client.commands.filter(c => c.category === 'utilidad').map(x => x.name)
        },
        {
            id: 'roleplay',
            name: 'Roleplay',
            description: 'Son comandos con los cuales puedes interactuar con otros usuarios.',
            commands: client.commands.filter(c => c.category === 'roleplay').map(x => x.name)
        },
        {
            id: 'administracion',
            name: 'Administración',
            description: 'Sirven para configurar al bot en el servidor.',
            commands: client.commands.filter(c => c.category === 'administracion').map(x => x.name)
        },
    ];

    for (const category of categorys) {
        client.categorys.set(category.id, category);
    }
}