const fs = require('fs');
const commandsPath = fs.readdirSync('./commands');

module.exports = (client) => {
    for (const commandsCategory of commandsPath) {
        const commandsCategoryPath = fs.readdirSync(`./commands/${commandsCategory}`);
        for (let commandFile of commandsCategoryPath) {
            const command = require(`./commands/${commandsCategory}/${commandFile}`);
            client.commands.set(command.name, command);
        }
    }    
}