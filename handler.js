// ————————————————————— SISTEMA HANDLER ————————————————————— //
const fs = require('fs');
const commandsPath = fs.readdirSync('./commands'); // carpeta de las categorias de comandos

// funcion con bucles for of que filtran cada categoria y sus comandos respectivos
module.exports = (client) => {
    for (const commandsCategory of commandsPath) {
        const commandsCategoryPath = fs.readdirSync(`./commands/${commandsCategory}`); // carpeta de los comandos por categoria
        for (let commandFile of commandsCategoryPath) {
            const command = require(`./commands/${commandsCategory}/${commandFile}`); // informacion del comando
            client.commands.set(command.name, command); // importacion del comando al client para guardarlo
        }
    }    
}