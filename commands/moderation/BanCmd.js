const
Command = require("../../base/Command.js"),
ArgsUtil = require("../../utils/ArgsUtil"),
FormatUtil = require("../../utils/FormatUtil"),
{ parseTime } = require("../../utils/OtherUtil.js"),
Settings = require("../../models/settings.js"),
logHandler = require("../../handlers/serverLogger.js");

class BanCmd extends Command {
  constructor (client) {
    super(client, {
      name: "ban",
      aliases: ["hackban","forceban"],
      usage: "<@users> [time] [reason]",
      description: "bans a users",
      category: "Moderation",
      guildOnly: true,
      botPermissions: ['BAN_MEMBERS'],
      userPermissions: ['BAN_MEMBERS'],
      daysToDelete: 1
    });
  }

  async run (message, args, reply) {
    const settings = await Settings.findOne({ guildID: message.guild.id }),
    bans = await message.guild.fetchBans(),
    modrole = settings.modRole;

  var { victims, reason, time } = await ArgsUtil(message, true),
  victimmsg = [];
if(!reason) reason = "[no reason specified]";

if(!args[0] || !victims[0]) return reply(`${this.client.config.emojis.error} Please provide at least one user (@mention or ID).`);

if(time)
{
  if(parseInt(time) <= -1) return reply(`${this.client.config.emojis.error} Tempban duration cannot be negative!`)
};

    await victims.forEach(async e => {
 try
 {
    await this.client.users.fetch(e)
     }
      catch(e) { return victimmsg.push(`${this.client.config.emojis.error} Please include at least one user (@mention or ID).`) }

     const user = await this.client.users.fetch(e); 
     user.member = message.guild.members.cache.get(user.id);

     if(message.guild.members.cache.has(user.id))
     {
  if (message.member.roles.highest.position <= user.member.roles.highest.position && message.guild.ownerID !== message.author.id) return victimmsg.push(`${this.client.config.emojis.error} You do not have permission to ban ${FormatUtil.formatUser(user)}`);
  if(!user.member.bannable) return victimmsg.push(`${this.client.config.emojis.error} I do not have permission to ban ${FormatUtil.formatUser(user)}`);
  if(user.member.roles.cache.has(modrole)) return victimmsg.push(`${this.client.config.emojis.error} I won't ban ${FormatUtil.formatUser(user)} because they have the Moderator Role.`);
     };

     if(time)
     {
      message.guild.members.ban(user.id, { reason: `${message.author.tag} (${Math.floor(parseTime(time).asMinutes())}m): ${reason}`, days: this.mod.daysToDelete })
      .then(async () => {
        if(!bans.has(user.id)) {
     const j = {
       guildID: message.guild.id,
       time: Date.now()+parseTime(time).asMilliseconds(),
       memberID: user.id
     };
if(!settings.tempbans.find(m => m.memberID === user.id))
{
     settings.tempbans.push(j);
     await settings.save().catch(e => this.client.logger.log(e, "error"));
}
     if (message.guild.channels.cache.has(settings.modLogsChannel)) {
      const Logger = new logHandler({ client: this.client, case: "banTimeAdd", guild: message.guild.id, member: user, moderator: message.author, reason: reason, duration: parseTime(time).asMilliseconds() });
      Logger.send().then(() => Logger.kill());
    };
  }
    victimmsg.push(`${this.client.config.emojis.success} <@${user.id}> has been banned for ${FormatUtil.msToTimeCompact(parseTime(time).asMilliseconds())}`)
      })
.catch((e) => { console.error(e);victimmsg.push(`${this.client.config.emojis.error} Failed to ban <@${user.id}>`)})
     } else {
      message.guild.members.ban(user.id, { reason: `${message.author.tag}: ${reason}`, days: this.mod.daysToDelete })
    .then(() => {
      if (message.guild.channels.cache.has(settings.modLogsChannel) && !bans.has(user.id)) {
        const Logger = new logHandler({ client: this.client, case: "banAdd", guild: message.guild.id, member: user, moderator: message.author, reason: reason });
        Logger.send().then(t => Logger.kill());
    };
    victimmsg.push(`${this.client.config.emojis.success} <@${user.id}> has been banned.`);
    })
     }
    }); 
    var interval = setInterval(()=>{if(victims.length==victimmsg.length){ reply(victimmsg.join("\n")); clearInterval(interval)}},100);  
  }
};

module.exports = BanCmd