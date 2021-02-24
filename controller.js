const Discord = require('discord.js');
const fetch = require('node-fetch');

const { getRandomInteger } = require('./utils');

const roastSomeone = async (msg, client) => {
    const user = msg.mentions.users.first();

    if (user === undefined) {
        msg.reply('Mention someone idiot!');
        return;
    }


    try {
        const response = await fetch(`https://insult.mattbas.org/api/insult.txt?template=You+are+as+%3Cadjective%3E&who=${user.username}`);

        const roastText = await response.text();

        msg.channel.send(roastText);
    } catch (error) {
        console.error(error);
        msg.channel.send('Aah! Can\'t think of a phrase. Lucky him/her');
    }
};

const dailyGrind = async (msg, client) => {
    const currentUser = await fetch(`https://${process.env.FB_PROJECT_ID}.firebaseio.com/users/${msg.author.id}.json`);
    const currentUserData = await currentUser.json();

    // Check if user already being assigned
    const currentTaskResp = await fetch(`https://${process.env.FB_PROJECT_ID}.firebaseio.com/users/${msg.author.id}/currentTask.json`);
    const currentTask = await currentTaskResp.json();

    if (currentTask !== null) {
        msg.channel.send('You\'re aready in a task, go do that!');
        return;
    }

    const COOLDOWN = 300000; // 5 minutes

    if (currentUserData.lastGrindedAt) {
        const lastGrinded = new Date(currentUserData.lastGrindedAt);
        const nowDate = new Date(Date.now());


        if (lastGrinded < nowDate || lastGrinded - nowDate < COOLDOWN) {
            const remainingSeconds = (COOLDOWN / 1000) - lastGrinded.getSeconds() - nowDate.getSeconds()
            const minutes = Math.floor(remainingSeconds / 60);
            const seconds = remainingSeconds - minutes * 60;


            msg.channel.send(`Just chill, alright. Come after **${minutes}m ${seconds}s**`);
            return;
        }
    }

    // Get the list of daily grinding
    const dailyGrindResp = await fetch(`https://${process.env.FB_PROJECT_ID}.firebaseio.com/daily-grinding.json`);
    const dailyGrinding = await dailyGrindResp.json()
    dailyGrinding.shift();

    const randomTaks = dailyGrinding[getRandomInteger(0, dailyGrinding.length)];

    await fetch(`https://${process.env.FB_PROJECT_ID}.firebaseio.com/users/${msg.author.id}.json`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            currentTask: {
                data: { ...randomTaks },
                completed: false
            }
        })
    });

    // Listen for task completion
    (async () => {
        while (true) {
            const currentTaskResp = await fetch(`https://${process.env.FB_PROJECT_ID}.firebaseio.com/users/${msg.author.id}/currentTask.json`);
            const currentTaskData = await currentTaskResp.json();

            if (currentTaskData === null) break;

            if (currentTaskData.completed) {
                const currentUser = await fetch(`https://${process.env.FB_PROJECT_ID}.firebaseio.com/users/${msg.author.id}.json`);
                const currentUserData = await currentUser.json();

                const successEmbed = new Discord.MessageEmbed()
                    .setTitle(`Daily commission completed!`)
                    .setColor('GREEN')
                    .setDescription(`Keep rocking, ${msg.author.username}! +${currentUserData.xpPitty}xp`);

                msg.channel.send(successEmbed);

                // null the currentTask
                await fetch(`https://${process.env.FB_PROJECT_ID}.firebaseio.com/users/${msg.author.id}.json`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        currentTask: null,
                        lastGrindedAt: new Date(Date.now()).toISOString(),
                        xp: currentUserData.xp + currentUserData.xpPitty
                    })
                });
                break;
            }
        }
    })();

    const embed = new Discord.MessageEmbed()
        .setTitle(`${msg.author.username}, ${randomTaks.title}`)
        .setColor('BLUE')
        .setDescription(`${randomTaks.description}`)
        .setFooter(`Time limit: ${randomTaks.duration} seconds`);

    setTimeout(async () => {
        // Check if the user has completed the task
        const currentUser = await fetch(`https://${process.env.FB_PROJECT_ID}.firebaseio.com/users/${msg.author.id}.json`);
        const currentUserData = await currentUser.json();

        if (!currentUserData.currentTask.completed) {
            const failedEmbed = new Discord.MessageEmbed()
                .setTitle(`Daily commission failed!`)
                .setColor('RED')
                .setDescription(`${msg.author.username}, You suck!`);

            msg.channel.send(failedEmbed);
        }

        if (currentUserData.currentTask !== null) {
            await fetch(`https://${process.env.FB_PROJECT_ID}.firebaseio.com/users/${msg.author.id}.json`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    currentTask: null,
                    lastGrindedAt: new Date(Date.now()).toISOString()
                })
            });
        }
    }, randomTaks.duration * 1000);

    msg.channel.send(embed);
}

const bulkDeleteMessages = async (msg, client) => {
    // Check if the user can do this action
    const currentUser = await fetch(`https://${process.env.FB_PROJECT_ID}.firebaseio.com/users/${msg.author.id}.json`);
    const currentUserData = await currentUser.json();

    if (msg.member.roles.cache.has(process.env.MOD_ROLE_ID) || (currentUserData.currentTask && currentUserData.currentTask.data.id === 1)) {
        await msg.channel.bulkDelete(100);
        msg.channel.send(`:broom: \`\`${msg.author.username}\`\` cleaned messages.`)

        // if task, listen for completion
        if (currentUserData.currentTask && currentUserData.currentTask.data.id === 1) {
            const messages = await msg.channel.messages.fetch();
            const msgCount = messages.array().length;

            if (msgCount <= 1) {
                await fetch(`https://${process.env.FB_PROJECT_ID}.firebaseio.com/users/${msg.author.id}/currentTask.json`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        completed: true
                    })
                });
            }
        }
    } else {
        msg.channel.send('What are you thinking you\'re doing? You\'re now worthy to use this command.');
    }
}

module.exports = (msg, client) => {
    const actualCommand = msg.content.replace(process.env.BOT_PREFIX, '').trim();

    // Roast
    if (actualCommand.startsWith('roast')) {
        roastSomeone(msg, client);
    }

    // Daily grinding
    else if (actualCommand.startsWith('work')) {
        dailyGrind(msg, client);
    }

    // Clear messages
    else if (actualCommand.startsWith('clean')) {
        bulkDeleteMessages(msg, client);
    }
};
