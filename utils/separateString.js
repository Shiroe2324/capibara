/**
 * separate a string and return an array of strings.
 * @param {number} max - max length of the strings.
 * @param {string} str - string to be separate.
 * @returns {string[]} array of strings.
 */
module.exports = (max, str) => {
    let strings = [];

    if (str.length <= max) return [str];

    /**
     * check if string length is greater than max length.
     * @param {string} s 
     */
    const checker = (s) => {
        let index = max;
        while (s[index] !== '\n') {
            index--
        }

        if (index === max) {
            while (s[index] !== ' ') {
                index--
            }
        }
    
        strings.push(s.slice(0, index));
        strings.push(s.slice(index));
    }

    checker(str);

    for (const result of strings) {
        if (result.length >= max) {
            strings.pop();
            checker(result);
        }
    }

    return strings;
}