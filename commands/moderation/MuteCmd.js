const
Command = require("../../base/Command.js"),
ArgsUtil = require("../../utils/ArgsUtil"),
FormatUtil = require("../../utils/FormatUtil"),
TempMuteManager = require("../../models/managers/TempMuteManager"),
{ parseTime } = require("../../utils/OtherUtil.js"),
Settings = require("../../models/settings.js"),
logHandler = require("../../handlers/serverLogger.js");

class MuteCmd extends Command {
  constructor (client) {
    super(client, {
      name: "mute",
      description: "mute users",
      category: "Moderation",
      usage: "<@users> [time] [reason]",
      guildOnly: true,
      botPermissions: ['MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES']
    });
  }

  async run (message, args, reply) {
    const settings = await Settings.findOne({ guildID: message.guild.id }),
    modrole = settings.modRole;

  var { victims, reason, time } = await ArgsUtil(message, true),
  victimmsg = [];
if(!reason) reason = "[no reason specified]";

const muteRole = message.guild.roles.cache.get(settings.muteRole) || message.guild.roles.cache.find(r => r.name.toLowerCase() === "muted");
if(!muteRole) return reply(`${this.client.config.emojis.error} The 'Muted' role does not exist!`);
if(muteRole.position > message.member.roles.highest.position && message.guild.ownerID !== message.author.id) return reply(`${this.client.config.emojis.error} You do not have permissions to assign the ${muteRole.name} role.`);
if(muteRole.position > message.guild.me.roles.highest.position) return reply(`${this.client.config.emojis.error} I do not have permissions to assign the ${muteRole.name} role.`)

if(!args[0] || !victims[0]) return reply(`${this.client.config.emojis.error} Please provide at least one user (@mention or ID).`);

if(time)
{
  if(parseInt(time) <= -1) return reply(`${this.client.config.emojis.error} Tempmute duration cannot be negative!`)
};

await victims.forEach(async e => {
  try
  {
     await this.client.users.fetch(e)
      }
       catch(e) { return victimmsg.push(`${this.client.config.emojis.error} Please include at least one user (@mention or ID).`) }
 
       const user = await this.client.users.fetch(e);
       user.member = message.guild.members.cache.get(user.id);

       if(!user.member) return victimmsg.push(`${this.client.config.emojis.warning} <@${e}> is not on the server.`);

      if (message.member.roles.highest.position <= user.member.roles.highest.position && message.guild.ownerID !== message.author.id) return victimmsg.push(`${this.client.config.emojis.error} You do not have permission to mute ${FormatUtil.formatUser(user)}`);
     if(message.guild.ownerID === user.id || user.member.roles.highest.position >= message.guild.me.roles.highest.position) return victimmsg.push(`${this.client.config.emojis.error} I do not have permission to mute ${FormatUtil.formatUser(user)}`);
     if(user.member.roles.cache.has(muteRole.id)) return victimmsg.push(`${this.client.config.emojis.error} ${FormatUtil.formatUser(user)} it's already muted.`)
     if(user.member.roles.cache.has(modrole)) return victimmsg.push(`${this.client.config.emojis.error} I won't mute ${FormatUtil.formatUser(user)} because they have the Moderator Role.`);

     if(time)
     {
       user.member.roles.add(muteRole.id, `${message.author.tag} (${Math.floor(parseTime(time).asMinutes())}m): ${reason}`)
      .then(async () => {
     TempMuteManager.setMute(message.guild, user.id, parseTime(time).asMilliseconds());
     if (message.guild.channels.cache.has(settings.modLogsChannel)) {
        const Logger = new logHandler({ client: this.client, case: "muteTimeAdd", guild: message.guild.id, member: user, moderator: message.author, reason: reason, duration: parseTime(time).asMilliseconds() });
        Logger.send().then(() => Logger.kill());
      } 
  
    victimmsg.push(`${this.client.config.emojis.success} ${FormatUtil.formatUser(user)} has been muted for ${FormatUtil.msToTimeCompact(parseTime(time).asMilliseconds())}`)
      })
.catch(async () => victimmsg.push(`${this.client.config.emojis.error} Failed to mute ${FormatUtil.formatUser(user)}`))
     } else {
      user.member.roles.add(muteRole.id, `${message.author.tag}: ${reason}`)
      .then(async () => {
        TempMuteManager.setMute(message.guild, user.id, null);
        if (message.guild.channels.cache.has(settings.modLogsChannel)) {
          const Logger = new logHandler({ client: this.client, case: "muteAdd", guild: message.guild.id, member: user, moderator: message.author, reason: reason });
          Logger.send().then(() => Logger.kill());
        };

        victimmsg.push(`${this.client.config.emojis.success} ${FormatUtil.formatUser(user)} has been muted.`)
      })
      .catch(async () => victimmsg.push(`${this.client.config.emojis.error} Failed to mute ${FormatUtil.formatUser(user)}`))
     }
    })
    var interval = setInterval(()=>{if(victims.length==victimmsg.length){ reply(victimmsg.join("\n")); clearInterval(interval)}},100);  
  }
};

module.exports = MuteCmd