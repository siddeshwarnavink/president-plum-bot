const Discord = require('discord.js');
const dotenv = require('dotenv');

const handleCommands = require('./controller');

const client = new Discord.Client;
dotenv.config();

client.on('ready', () => {
	console.log('The bot is ready to go!');
});

client.on('message', msg => {
	if(msg.content.startsWith(process.env.BOT_PREFIX)) {
		handleCommands(msg, client);
	}
});

client.on('guildMemberAdd', member => {
	const channel = member.guild.channels.cache.find(ch => ch.id === process.env.WELCOME_CHANNEL_ID);
  	
	if (!channel) return;	

	console.log(member);

	channel.send(`Welcome to the server, ${member}`);
	channel.send('Hope you have a great time here!');

	member.roles.set([process.env.NEWBIE_ROLE_ID]);
});

client.login(process.env.BOT_TOKEN);
