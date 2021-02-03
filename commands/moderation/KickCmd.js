const 
Command = require("../../base/Command.js"),
logHandler = require("../../handlers/serverLogger.js"),
Settings = require("../../models/settings.js"),
FormatUtil = require("../../utils/FormatUtil");

class KickCmd extends Command {
  constructor (client) {
    super(client, {
      name: "kick",
      description: "kicks a users",
      category: "Moderation",
      usage: "<@users> [reason]",
      guildOnly: true,
      botPermissions: ['KICK_MEMBERS'],
      userPermissions: ['KICK_MEMBERS']
    });
  }

  async run (message, args, reply) { 
    const settings = await Settings.findOne({ guildID: message.guild.id }),
    victims = message.context.victims,
    reason = message.context.reason || "[no reason specified]",
    modrole = settings.modRole,
    victimmsg = [];

    if(!args[0] || !victims[0]) return reply(`${this.client.config.emojis.error} Please provide at least one user (@mention or ID).`);
   
    await victims.forEach(async e => {
 try
 { 
   await this.client.users.fetch(e)
     }
      catch(e) { return victimmsg.push(`${this.client.config.emojis.error} Please include at least one user (@mention or ID).`) }
  
      const user = await this.client.users.fetch(e); 
  user.member = message.guild.members.cache.get(user.id);

  if(!message.guild.members.cache.has(user.id)) return victimmsg.push(`${this.client.config.emojis.warning} <@${e}> is not on the server.`);

  if (message.member.roles.highest.position <= user.member.roles.highest.position && message.guild.ownerID !== message.author.id) return victimmsg.push(`${this.client.config.emojis.error} You do not have permission to kick ${FormatUtil.formatUser(user)}`);

  if(!user.member.kickable) return victimmsg.push(`${this.client.config.emojis.error} I do not have permission to kick ${FormatUtil.formatUser(user)}`)

  if(user.member.roles.cache.has(modrole)) return victimmsg.push(`${this.client.config.emojis.error} I won't kick ${FormatUtil.formatUser(user)} because they have the Moderator Role.`);

  user.member.kick(`${message.author.tag}: ${reason}`)
.then(async () => {
    if(message.guild.channels.cache.has(message.guild.settings.modLogChannel)){
        const Logger = new logHandler({ client: this.client, case: "kickAdd", guild: message.guild.id, member: user, moderator: message.author, reason: reason });
        Logger.send().then(t => Logger.kill());
    };
    victimmsg.push(`${this.client.config.emojis.success} ${FormatUtil.formatUser(user)} has been kicked.`);
})
.catch(async (e) => {
    console.error(e);
    victimmsg.push(`${this.client.config.emojis.error} Failed to kick ${FormatUtil.formatUser(user)}`)
})
});

 var interval = setInterval(()=>{if(victims.length==victimmsg.length){ reply(victimmsg.join("\n")); clearInterval(interval)}},100);

  }
};

module.exports = KickCmd