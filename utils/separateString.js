module.exports = (max, str) => {
    let strings = [];

    if (str.length <= max) return [str];

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

        if (index === max) {
            index--
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