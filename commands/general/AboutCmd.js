const { MessageEmbed } = require('discord.js'),
Command = require("../../base/Command.js"),
FormatUtil = require("../../utils/FormatUtil");

class AboutCmd extends Command {
  constructor (client) {
    super(client, {
      name: "about",
      description: "informations about me",
      category: "General",
      aliases: ['info'],
      botPermissions: ['EMBED_LINKS']
    });
  }

  async run (message, args, reply) {
    reply(`${this.client.config.emojis.MANAGER_EMOJI} All information about **Manager** ${this.client.config.emojis.MANAGER_EMOJI}`,
    new MessageEmbed()
    .setDescription(`Hello. I'am **Manager**, was created in the language [JavaScript](https://g.co/kgs/wMo6gi) using the library [Discord.js](https://discord.js.org/#/) to moderate the servers on Discord. I was developed by **Snuff**#8305.
If you want to know about my commands use \`${message.guild?message.guild.settings.prefix:this.client.config.prefix}help\`.

${FormatUtil.helpLinks(this.client)}
`)
.addField("Status",
`
${this.client.guilds.cache.size} Servers
${this.client.users.cache.size} Users
${Date.now() - message.createdAt}ms Average Ping
${this.client.channels.cache.filter(a => a.type === 'text').size} Text Channels
${this.client.channels.cache.filter(a => a.type === 'voice').size} Voice Channels
`, true)
.addField("Links", 
`[Invite](${this.client.config.bot_invite})
[Donate](${this.client.config.donation_link})
`, true)
.setColor(message.guild?message.guild.me.roles.cache.filter(a=>a.color>0).sort((a,b) => a.position-b.position).map(a =>a.color).reverse()[0]||this.client.config.color:this.client.config.color)
.setFooter("Last restart")
.setTimestamp(Date.now()-this.client.uptime)
)
  }}

module.exports = AboutCmd;
