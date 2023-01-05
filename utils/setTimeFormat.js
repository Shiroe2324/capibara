/**
 * formatea una fecha a un texto mas legible.
 * @param {number} time - la fecha a formatear.
 * @returns {string} un texto con la fecha formateada.
 */
module.exports = (time) => {
    let text = [];
    const date = new Date(Math.abs(time));

    const times = [
        { value: date.getUTCFullYear() - 1970, suffix: date.getUTCFullYear() - 1970 <= 1 ? 'año' : 'años' },
        { value: date.getUTCMonth(), suffix: date.getUTCMonth() <= 1 ? 'mes' : 'meses' },
        { value: date.getUTCDate() - 1, suffix: date.getUTCDate() - 1 <= 1 ? 'dia' : 'dias' },
        { value: date.getUTCHours(), suffix: date.getUTCHours() <= 1 ? 'hora' : 'horas' },
        { value: date.getUTCMinutes(), suffix: date.getUTCMinutes() <= 1 ? 'minuto' : 'minutos' },
        { value: date.getUTCSeconds(), suffix: date.getUTCSeconds() <= 1 ? 'segundo' : 'segundos' }
    ];

    for (let x = 0; x < times.length; x++) {
        if (times[x].value > 0) {
            text.push(`${times[x].value} ${times[x].suffix}`);
        }
    }

    text.forEach((t) => {
        if (text.length === 1 || text.indexOf(t) === text.length - 1) return;

        if (text.indexOf(t) === text.length - 2) {
            text[text.length - 2] = `${t} y `;
        } else {
            text[text.indexOf(t)] = `${t}, `;
        }

    });

    return text.join('').trim();
}