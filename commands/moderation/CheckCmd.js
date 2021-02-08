const
   Command = require("../../base/Command.js"),
   FormatUtil = require("../../utils/FormatUtil"),
   Settings = require("../../models/settings.js"),
   Infractions = require("../../models/infractions.js"),
   FinderUtil = require("../../utils/FinderUtil");

class CheckCmd extends Command {
  constructor (client) {
    super(client, {
      name: "check",
      description: "check strikes about one user",
      category: "Moderation",
      usage: "<user>",
      guildOnly: true,
      botPermissions: ["BAN_MEMBERS"],
      userPermissions: ["BAN_MEMBERS"]
    });
  }

  async run (message, args, reply) { 
    if(!args[0])
    {
      reply(`${this.client.config.emojis.success} This command is used to check a user's strikes, mute and ban. For that I need a user.`);
      return;
    }
    const settings = await Settings.findOne({ guildID: message.guild.id });
    const members = FinderUtil.findMembers(args.join(" "), message.guild);
    if(members.size!=0)
    {
    check(this.client, members.first().user);
    return;
    }
const users = FinderUtil.findUsers(args.join(" "), this.client);
if(users.size!=0)
{
  check(this.client, users.first());
  return;
}
try 
{
  const u = await this.client.users.fetch(args[0]);
  check(this.client, u)
} 
catch(e)
{
 reply(`${this.client.config.emojis.error} No users found!`);
}

function check(client, user)
{
if(message.guild.members.cache.has(user.id))
Check(client, user, null);
else 
message.guild.fetchBans().then(bans => Check(client, user, bans.has(user.id))).catch(() => Check(client, user, null));
}

function Check(client, user, ban)
{
  Infractions.findOne({
    guildID: message.guild.id,
    userID: user.id
  }, (err, u) => {
    if (err) client.logger.log(err, "error");
    if (!u) u = "ProperyNone";
  const strikes = u.infractions || 0;
  const minutesMuted = settings.tempmutes.find(m => m.memberID === user.id) ? settings.tempmutes.find(m => m.memberID === user.id).time : undefined;
  const mRole = message.guild.roles.cache.get(settings.muteRole) || message.guild.roles.cache.find(r => r.name.toLowerCase() === "muted");
  const minutesBanned = settings.tempbans.find(m => m.memberID === user.id)? settings.tempbans.find(m => m.memberID === user.id).time : undefined;
  const str = `${client.config.emojis.success} Moderation Information for ${FormatUtil.formatFullUser(user)}:
${client.getEmoji("strike")} Strikes: **${strikes}**
${client.getEmoji("mute")} Muted: **${message.guild.members.cache.has(user.id) ? (mRole && message.guild.members.cache.get(user.id).roles.cache.has(mRole.id) ? "Yes" : "No") : "Not In Server"}**
${client.getEmoji("tempmute")} Mute Time Remaining: ${message.guild.members.cache.has(user.id) ? (!minutesMuted ? "N/A" : FormatUtil.msToTime(minutesMuted-Date.now())) : "N/A"}
${client.getEmoji("ban")} Banned: **${!ban ? "No" : "Yes"}**
${client.getEmoji("tempban")} Ban Time Remaining: ${!minutesBanned ? "N/A" : FormatUtil.msToTime(minutesBanned-Date.now())}`;
message.channel.send(str, { disableMentions: "all" });
  })
}
  }
}
module.exports = CheckCmd;