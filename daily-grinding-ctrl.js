const fetch = require('node-fetch');

const cringeCommision = async (msg, client) => {
    // Check if the user can do this action
    const currentUser = await fetch(`https://${process.env.FB_PROJECT_ID}.firebaseio.com/users/${msg.author.id}.json`);
    const currentUserData = await currentUser.json();

    if (currentUserData.currentTask && currentUserData.currentTask.data.id === 2) {
        const msgContent = `:grimacing: \`\`${msg.author.username}\`\` cringing`;
        msg.channel.send(msgContent);

        // Check if the task is completed
        const messages = await msg.channel.messages.fetch({ limit: 100 });
        const userCringMessage = messages.filter(m => m.author.id === msg.author.id && m.content === 'cringe');

        if (userCringMessage.array().length >= 10) {
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
}

module.exports = (msg, client) => {
    if (msg.content === 'cringe') {
        cringeCommision(msg, client)
    }
}

