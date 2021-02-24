exports.getRandomInteger = (minLimit, maxLimit) => {
    return Math.floor(Math.random() * (maxLimit - minLimit)) + minLimit;
};

exports.millisecondsToString = (milliseconds, cooldown) => {
    let minutes = Math.floor(milliseconds / 60000);
    let seconds = ((milliseconds % 60000) / 1000).toFixed(0);

    minutes = (Math.round(cooldown / 60000) - 1) - minutes;
    seconds = 60 - seconds;

    return `${minutes}m ${(seconds < 10 ? '0' : '') + seconds}s`;
}