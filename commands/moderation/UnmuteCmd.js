const
Command = require("../../base/Command.js"),
logHandler = require("../../handlers/serverLogger.js"),
FormatUtil = require("../../utils/FormatUtil"),
Settings = require("../../models/settings.js");

class UnmuteCmd extends Command {
  constructor (client) {
    super(client, {
      name: "unmute",
      description: "unmute users",
      category: "Moderation",
      usage: "<@users> [reason]",
      guildOnly: true,
      botPermissions: ['MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES']
    });
  }

  async run (message, args, reply) {
    const settings = await Settings.findOne({ guildID: message.guild.id }),
    victimmsg = [];

    let { victims, reason } = message.context;

   if(!reason) reason = "[no reason specified]";
   
   const muteRole = message.guild.roles.cache.get(settings.muteRole) || message.guild.roles.cache.find(r => r.name.toLowerCase() === "muted");
   if(!muteRole) return reply(`${this.client.config.emojis.error} The 'Muted' role does not exist!`);
   if(muteRole.position > message.member.roles.highest.position && message.guild.ownerID !== message.author.id) return reply(`${this.client.config.emojis.error} You do not have permissions to assign the ${muteRole.name} role.`);
   if(muteRole.position > message.guild.me.roles.highest.position) return reply(`${this.client.config.emojis.error} I do not have permissions to assign the ${muteRole.name} role.`)

   if(!args[0] || !victims[0]) return reply(`${this.client.config.emojis.error} Please provide at least one user (@mention or ID).`);

await victims.forEach(async e => {
  try
  {
     await this.client.users.fetch(e)
      }
       catch(e) { return victimmsg.push(`${this.client.config.emojis.error} Please include at least one user (@mention or ID).`) }
 
       const user = await this.client.users.fetch(e);
       user.member = message.guild.members.cache.get(user.id);

       if(!user.member) return victimmsg.push(`${this.client.config.emojis.warning} <@${e}> is not on the server.`);

       if (message.member.roles.highest.position <= user.member.roles.highest.position && message.guild.ownerID !== message.author.id) return victimmsg.push(`${this.client.config.emojis.error} You do not have permission to unmute ${FormatUtil.formatUser(user)}`);
     if(message.guild.ownerID === user.id || user.member.roles.highest.position >= message.guild.me.roles.highest.position) return victimmsg.push(`${this.client.config.emojis.error} I do not have permission to unmute ${FormatUtil.formatUser(user)}`);
     if(!user.member.roles.cache.has(muteRole.id)) return victimmsg.push(`${this.client.config.emojis.error} ${FormatUtil.formatUser(user)} is not muted!`);

     user.member.roles.remove(muteRole.id, `${message.author.tag}: ${reason}`)
     .then(async () => {
       if(settings.tempmutes.find(m => m.memberID === user.id))
       {
        const index = settings.tempmutes.findIndex(m => m.memberID === user.id);
        settings.tempmutes.splice(index, 1);
        await settings.save().catch(e => this.client.logger.log(e, "error"));
       }

       if (message.guild.channels.cache.has(settings.modLogsChannel)) {
        const Logger = new logHandler({ client: this.client, case: "muteRemove", guild: message.guild.id, member: user, moderator: message.author, reason: reason });
        Logger.send().then(() => Logger.kill());
      } 

      victimmsg.push(`${this.client.config.emojis.success} ${FormatUtil.formatUser(user)} has been unmuted.`)
     })
     .catch(async() => victimmsg.push(`${this.client.config.emojis.error} Failed to unmute ${FormatUtil.formatUser(user)}`));
    });
    var interval = setInterval(()=>{if(victims.length==victimmsg.length){ reply(victimmsg.join("\n")); clearInterval(interval)}},100); 
  }
};

module.exports = UnmuteCmd