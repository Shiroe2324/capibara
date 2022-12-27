/**
 * formatea una fecha a un texto mas legible.
 * @param {number} time - la fecha a formatear.
 * @returns {string} un texto con la fecha formateada.
 */
module.exports = (time) => {
    let text = ''; // texto de la fecha formateada
    const date = new Date(Math.abs(Date.now() - time)); // fecha formateada

    // tiempos de la fecha dada (años, meses, dias, horas, minutos, segundos)
    const times = [
        { value: date.getUTCFullYear() - 1970, suffix: date.getUTCFullYear() - 1970 <= 1 ? 'año' : 'años' },
        { value: date.getUTCMonth(), suffix: date.getUTCMonth() <= 1 ? 'mes' : 'meses' },
        { value: date.getUTCDate() - 1, suffix: date.getUTCDate() - 1 <= 1 ? 'dia' : 'dias' },
        { value: date.getUTCHours(), suffix: date.getUTCHours() <= 1 ? 'hora' : 'horas' },
        { value: date.getUTCMinutes(), suffix: date.getUTCMinutes() <= 1 ? 'minuto' : 'minutos' },
        { value: date.getUTCSeconds(), suffix: date.getUTCSeconds() <= 1 ? 'segundo' : 'segundos' }
    ];

    // un ciclo que itera cada tiempo de la fecha dada, si es mayor que 0, agrega el tiempo al texto
    for (let x = 0; x < times.length; x++) {
        if (times[x].value > 0) {
            text += `${times[x].value} ${times[x].suffix} `;
        }
    }

    return text.trim(); // se devuelve la fecha formateada sin espacios al final
}