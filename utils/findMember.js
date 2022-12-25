const { Message, GuildMember, EmbedBuilder } = require('discord.js') // estructuras de algunos datos
const pageSystem = require('./pageSystem');

/**
* Funcion que ejecuta una busqueda de los miembros de un server con los datos dados
* @param {Message} msg - El mensaje enviado
* @param {string[]} args - Los argumentos del mensaje
* @param {Boolean} allowedAuthor - Boolean para verificar si se incluye al autor del mensaje en la busqueda
* @returns {GuildMember|object} la informacion del miembro encontrado o un object si hubo algun error
*/
module.exports = async (msg, args, allowedAuthor = false) => {
    let member = msg.mentions.members.first() || msg.guild.members.cache.get(args[0]); // busqueda del miembro por medio de mención o de id

    // verificador si se incluye el autor en la busqueda, si está activado y no coloca ningún argumento, devuelve al autor del mensaje
    if (allowedAuthor && !args[0]) {
        return { member: msg.member, message: false };
    }

    // verificador si no encuentra miembro con mención o id
    if (member) {
        return { member: member, message: false }; // la información del miembro encontrado
    } else {
        const name = args.join(' ')?.toLowerCase(); // nombre, tag o apodo de la persona a buscar
        if (!name) {
            return { error: true, messageError: 'Tienes que mencionar a una persona', message: false }; // verificador si no coloca ningun nombre
        }

        const members = msg.guild.members.cache.filter(m => {
            return m.user.tag?.toLowerCase().includes(name) || m.nickname?.toLowerCase().includes(name)
        }).map(m => m);

        if (members.length === 0) {
            return { error: true, messageError: 'No se encontró a ningún usuario con ese nombre', message: false } // verificador por si no se encuentra a nadie en la busqueda
        }

        if (members.length === 1) {
            return { member: members[0], message: false };
        } else {
            const embed = (index) => {
                const current = members.map((m, i) => `**${i + 1}.** ${m.user.tag} (${m.id})`).slice(index, index + 10);
                return new EmbedBuilder()
                    .setAuthor({ name: msg.author.tag, iconURL: msg.author.avatarURL({ dynamic: true }) })
                    .setDescription(current.join('\n'))
                    .setFooter({ text: 'Coloca el numero que está al lado del nombre para elegir a esa persona\nTambien puedes colocar cancel para cancelar' });
            }

            const filter = (interaction) => {
                const selected = parseInt(interaction.content);
                if (interaction.content === 'cancel') return true;
                if (interaction.author.id === msg.author.id && !isNaN(selected) && selected > 0 && selected <= members.length) return true;
            }

            const embedPages = await pageSystem(msg, embed, members.length, 30000);

            try {
                const collected = await msg.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
                const selected = parseInt(collected.first().content);

                if (collected.first().content === 'cancel') {
                    return { error: true, messageError: 'Se canceló la elección de usuario', message: false };
                }

                return { member: members[selected - 1], message: embedPages };
            } catch (error) {
                return { error: true, messageError: 'No se eligió ninguna opción...', message: embedPages }
            }
        }
    }
}