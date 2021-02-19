const fetch = require('node-fetch');

const { BOT_PREFIX } = require('./config');

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
	} catch(error) {
		console.error(error);
		msg.channel.send('Aah! Can\'t think of a phrase. Lucky him/her');
	}
};

module.exports = (msg, client) => {
	const actualCommand = msg.content.replace(BOT_PREFIX, '').trim();

	// Roast
	if(actualCommand.startsWith('roast')) {
		roastSomeone(msg, client);
	}
};
