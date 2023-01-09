const { Message, GuildMember, EmbedBuilder, GuildChannel } = require('discord.js');
const pageSystem = require('./pageSystem');
const removeAccents = require('./removeAccents');
const send = require('./send');

/**
 * function that checks which message is being used.
 * @param {Message} message - The message used.
 * @param {string} type - The type of update to do.
 * @returns {Message} Edit or send the used message.
 */
const updateMessage = (message, type) => {
    switch (type) {
        case 'edit': return (data) => message.edit(data);
        case 'send': return (data) => send(message, data);
    }
}

/**
 * Ffunction that performs a search for the members of a server with the given data.
 * @param {Message} msg - The message sent.
 * @param {string[]} args - The message arguments.
 * @param {Boolean} allowedAuthor - Boolean to check if the author of the message is included in the search.
 * @returns {{member: GuildMember, message: updateMessage, error: boolean, messageError: string}} the information of the member found or an object if there was an error.
 */
module.exports = async (msg, args, allowedAuthor = false, excludeBots = false) => {
    let member = msg.mentions.members.first() || msg.guild.members.cache.get(args[0]);
    let message = updateMessage(msg, 'send');
    let error = false;
    let messageError = '';

    if (allowedAuthor && !args[0]) {
        member = msg.member;
    }

    if (!member) {
        const name = removeAccents(args.join(' ')).toLowerCase(); 

        let members = msg.guild.members.cache.filter(member => {
            return removeAccents(member.user.tag).toLowerCase().includes(name) || removeAccents(member.nickname).toLowerCase().includes(name);
        }).map(x => x);

        if (excludeBots) {
            member = members.filter(member => member.id === msg.client.user.id || !member.user.bot)
        }

        if (!name) {
            error = true;
            messageError = 'Tienes que mencionar a una persona';
        } else if (members.length === 0) {
            error = true;
            messageError = 'No se encontró a ningún usuario con ese nombre';
        } else if (members.length === 1) {
            member = members[0];
        } else {
            const embed = (index) => {
                const current = members.map((m, i) => `**${i + 1}.** ${m.user.tag} --- **[**${m.id}**]**`).slice(index, index + 10); // la lista de miembros con ese nombre
                return new EmbedBuilder()
                    .setAuthor({ name: msg.author.tag, iconURL: msg.author.avatarURL({ dynamic: true }) })
                    .setTitle('Lista de miembros encontrados')
                    .setDescription(current.join('\n'))
                    .setColor(process.env['COLOR'])
                    .setFooter({ text: 'Coloca el numero que está al lado del nombre para elegir a esa persona\nTambien puedes colocar cancel para cancelar' });
            }

            const filter = (interaction) => {
                const selected = parseInt(interaction.content);
                return interaction.content.toLowerCase() === 'cancel' || interaction.author.id === msg.author.id && !isNaN(selected) && selected > 0 && selected <= members.length;
            }

            const pages = await pageSystem(msg, embed, members.length, 40000);

            try {
                const collected = await msg.channel.awaitMessages({ filter, max: 1, time: 40000, errors: ['time'] }); 
                const selected = parseInt(collected.first().content) - 1; 

                if (collected.first().content.toLowerCase() === 'cancel') {
                    error = true;
                    messageError = 'Se canceló la elección de usuario';
                    message = updateMessage(pages, 'edit');
                } else {
                    member = members[selected];
                    message = updateMessage(pages, 'edit');
                }
            } catch (err) {
                error = true;
                messageError = 'No se eligió ninguna opción...';
                message = updateMessage(pages, 'edit');
            }
        }
    }

    return { member, message, error, messageError }
}
