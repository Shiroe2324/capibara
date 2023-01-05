const { Client } = require('discord.js');
const fs = require('fs');
const commandsPath = fs.readdirSync('./commands');

/**
 * Iterates through each file with commands and adds them in a Discord Collection.
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
}