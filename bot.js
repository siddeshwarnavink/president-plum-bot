const Discord = require('discord.js');
const dotenv = require('dotenv');

const client = new Discord.Client;
dotenv.config();

client.on('ready', () => {
	console.log('The bot is ready to go!');
});

client.login(process.env.BOT_TOKEN);
