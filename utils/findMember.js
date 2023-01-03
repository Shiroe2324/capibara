const { Message, GuildMember, EmbedBuilder,  } = require('discord.js') // estructuras de algunos datos
const pageSystem = require('./pageSystem'); // sistema de paginas

/**
 * funcion que verifica que mensaje se está usando.
 * @param {Message} message - El mensaje usado.
 * @param {string} type - El tipo de actualización a hacer.
 * @returns {function(MessageCreateOptions)} Edita o envia el mensaje usado.
 */
const updateMessage = (message, type) => {
    switch (type) {
        case 'edit': return (data) => message.edit(data);
        case 'send': return (data) => message.channel.send(data);
    }
}

/**
 * Funcion que ejecuta una busqueda de los miembros de un server con los datos dados.
 * @param {Message} msg - El mensaje enviado.
 * @param {string[]} args - Los argumentos del mensaje.
 * @param {Boolean} allowedAuthor - Boolean para verificar si se incluye al autor del mensaje en la busqueda.
 * @returns {{member: GuildMember, message: updateMessage, error: boolean, messageError: string}} la informacion del miembro encontrado o un object si hubo algun error.
 */
module.exports = async (msg, args, allowedAuthor = false, includeBots = false) => {
    let member = msg.mentions.members.first() || msg.guild.members.cache.get(args[0]); // busqueda del miembro por medio de mención o de id
    let message = updateMessage(msg, 'send');
    let error = false;
    let messageError = '';

    // verificador si se incluye el autor en la busqueda, si está activado y no coloca ningún argumento, devuelve al autor del mensaje
    if (allowedAuthor && !args[0]) {
        member = msg.member;
    }

    // se verifica si no hay mención
    if (!member) {
        const name = args.join(' ')?.toLowerCase(); // nombre, tag o apodo de la persona a buscar

        // lista de miembros con ese nombre en su apodo o tag
        let members = msg.guild.members.cache.filter(member => {
            return member.user.tag?.toLowerCase().includes(name) || member.nickname?.toLowerCase().includes(name)
        }).map(x => x);

        if (includeBots) {
            member = members.filter(member => member.id !== process.env['BOT_ID'] && !member.bot)
        }

        // se verifica si no hay nombre, miembros con ese nombre o tag o si hay mas de un miembro con el
        if (!name) {
            error = true;
            messageError = 'Tienes que mencionar a una persona';
        } else if (members.length === 0) {
            error = true;
            messageError = 'No se encontró a ningún usuario con ese nombre';
        } else if (members.length === 1) {
            member = members[0];
        } else {
            // embed interactivo con paginas
            const embed = (index) => {
                const current = members.map((m, i) => `**${i + 1}.** ${m.user.tag} --- **[**${m.id}**]**`).slice(index, index + 10); // la lista de miembros con ese nombre
                return new EmbedBuilder()
                    .setAuthor({ name: msg.author.tag, iconURL: msg.author.avatarURL({ dynamic: true }) })
                    .setTitle('Lista de miembros encontrados')
                    .setDescription(current.join('\n'))
                    .setColor(process.env['COLOR'])
                    .setFooter({ text: 'Coloca el numero que está al lado del nombre para elegir a esa persona\nTambien puedes colocar cancel para cancelar' });
            }

            // filtro de mensajes
            const filter = (interaction) => {
                const selected = parseInt(interaction.content);
                return interaction.content === 'cancel' || interaction.author.id === msg.author.id && !isNaN(selected) && selected > 0 && selected <= members.length;
            }

            // embed con las paginas
            const pages = await pageSystem(msg, embed, members.length, 40000);

            try {
                const collected = await msg.channel.awaitMessages({ filter, max: 1, time: 40000, errors: ['time'] }); // recolector de mensajes
                const selected = parseInt(collected.first().content) - 1; // el mensaje convertido en entero

                // se verifica si se canceló la busqueda o se selecciona el usuario en dicha posición
                if (collected.first().content === 'cancel') {
                    error = true;
                    messageError = 'Se canceló la elección de usuario';
                    message = updateMessage(pages, 'edit');
                } else {
                    member = members[selected];
                    message = updateMessage(pages, 'edit');
                }
            } catch (err) { // si no se selecciona nada
                error = true;
                messageError = 'No se eligió ninguna opción...';
                message = updateMessage(pages, 'edit');
            }
        }
    }

    // se retorna un object con el miembro, el mensaje, si hay error y el mensaje de error
    return { member, message, error, messageError }
}