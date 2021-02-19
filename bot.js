const Discord = require('discord.js');
const dotenv = require('dotenv');

const { BOT_PREFIX } = require('./config');
const handleCommands = require('./controller');

const client = new Discord.Client;
dotenv.config();

client.on('ready', () => {
	console.log('The bot is ready to go!');
});

client.on('message', msg => {
	if(msg.content.startsWith(BOT_PREFIX)) {
		handleCommands(msg, client);
	}
});

client.login(process.env.BOT_TOKEN);
