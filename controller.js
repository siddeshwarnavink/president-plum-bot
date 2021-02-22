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

    const embed = new Discord.MessageEmbed()
        .setTitle(`${msg.author.username}, ${randomTaks.title}`)
        .setColor('BLUE')
        .setDescription(`${randomTaks.description}`)
        .setFooter(`Time limit: ${randomTaks.duration} seconds`);

    const taskMessage = await msg.channel.send(embed);

    setTimeout(async () => {
        // Check if the user has completed the task
        const updatedTask = await fetch(`https://${process.env.FB_PROJECT_ID}.firebaseio.com/users/${msg.author.id}.json`);
        const updatedTaskData = await updatedTask.json();

        if (!updatedTaskData.currentTask.completed) {
            const failedEmbed = new Discord.MessageEmbed()
                .setTitle(`Daily commission failed!`)
                .setColor('RED')
                .setDescription(`${msg.author.username}, You suck!`);

            taskMessage.edit(failedEmbed);
        } else {
            const successEmbed = new Discord.MessageEmbed()
                .setTitle(`Daily commission completed!`)
                .setColor('GREEN')
                .setDescription(`Keep rocking, ${msg.author.username}! +120xp`);

            taskMessage.edit(successEmbed);
        }

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
    }, randomTaks.duration * 1000);
}

module.exports = (msg, client) => {
    const actualCommand = msg.content.replace(process.env.BOT_PREFIX, '').trim();

    // Roast
    if (actualCommand.startsWith('roast')) {
        roastSomeone(msg, client);
    }

    // Daily grinding
    else if (actualCommand.startsWith('daily')) {
        dailyGrind(msg, client);
    }
};
