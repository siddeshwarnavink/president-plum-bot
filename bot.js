const Discord = require('discord.js');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

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

client.on('guildMemberAdd', async member => {
	const publicChannel = member.guild.channels.cache.find(ch => ch.id === process.env.WELCOME_CHANNEL_ID);
  	const logChannel = member.guild.channels.cache.find(ch => ch.id === process.env.LOG_CHANNEL_ID);
 

	if (!publicChannel) return;	
	
	const embed = new Discord.MessageEmbed()
			.setTitle(`Welcome ${member.displayName}!`)
			.setColor('YELLOW')
			.setDescription('Hope you stay here')
			.setThumbnail(member.user.displayAvatarURL());

	publicChannel.send(embed);
	
	logChannel.send(`${member} has just joined the server`);

	// Check for existing record
	const userExistResp = await fetch(`https://${process.env.FB_PROJECT_ID}.firebaseio.com/users/${member.user.id}.json`);
	const userExitData = await userExistResp.json();

	if(userExitData === null) {
		// Create a record
		await fetch(`https://${process.env.FB_PROJECT_ID}.firebaseio.com/users/${member.user.id}.json`, {
			method: 'PUT',
			headers: {
      				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				level: 1,
				pingCount: 0,
			})
		});
	}

	member.roles.set([process.env.NEWBIE_ROLE_ID]);
});

client.login(process.env.BOT_TOKEN);
