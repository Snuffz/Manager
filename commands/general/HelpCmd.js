const { MessageEmbed } = require ("discord.js"),
Command = require("../../base/Command.js");

class Help extends Command {
  constructor (client) {
    super(client, {
      name: "help",
      description: "see informations regarding bot itself",
      category: "General",
      usage: "[category]",
      botPermissions: ['ADD_REACTIONS']
    });
  }

  async run (message, args, reply) { 
    const embed = new MessageEmbed();
    embed.setColor(message.guild?message.guild.me.roles.cache.filter(a=>a.color>0).sort((a,b) => a.position+b.position).map(a =>a.color)[0]||this.client.config.color:this.client.config.color);
    const links = {
        automod: "https://github.com/Snuffz/ManagerBot/wiki/📃-Command-List#-automod",
        general: "https://github.com/Snuffz/ManagerBot/wiki/📃-Command-List#-general",
        moderation: "https://github.com/Snuffz/ManagerBot/wiki/📃-Command-List#%EF%B8%8F-moderation",
        settings: "https://github.com/Snuffz/ManagerBot/wiki/📃-Command-List#-settings",
        tools: "https://github.com/Snuffz/ManagerBot/wiki/📃-Command-List#-tools"
    }
if(!args[0] || !["automod", "general", "moderation", "settings", "tools"].includes(args[0].toLowerCase())){
const categories = [... new Set(this.client.commands.filter(cmd => cmd.help.category !== 'Owner').map(cmd => cmd.help.category))];
     
for (const category of categories) {
    embed.addField("\u200B", `**[${message.guild?message.guild.settings.prefix:this.client.config.prefix}help ${category.toLowerCase()}](${links[category.toLowerCase()]})**`)
};
} else {
   this.client.commands.filter(cmd => cmd.help.category.toLowerCase() === args[0].toLowerCase() && cmd.conf.enabled && cmd.help.name !== this.help.name).forEach((cmd) => {
        embed.addField(`${message.guild?message.guild.settings.prefix:this.client.config.prefix}${cmd.help.name} ${cmd.help.usage}`.trim(), `[${cmd.help.description}](${links[cmd.help.category.toLowerCase()]})`)
    })
};

embed.addField("Additional Links",
`[🌐 Manager Wiki's](${this.client.config.wiki.LINK})
[📥 Support Server](${this.client.config.SERVER_INVITE})
`);

return await message.author.send(`${this.client.config.emojis.MANAGER_EMOJI} **Manager** commands:`, embed)
.then(() => message.react(this.client.config.emojis.help_reaction))
.catch(() => reply(`${this.client.config.emojis.warning} Your Direct Messages are closed, open for me to send my commands.`))
  }}

  module.exports = Help