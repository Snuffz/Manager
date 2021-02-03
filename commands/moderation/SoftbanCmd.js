const logHandler = require("../../handlers/serverLogger.js"),
Command = require("../../base/Command.js"),
FormatUtil = require("../../utils/FormatUtil"),
Settings = require("../../models/settings.js");

class SoftbanCmd extends Command {
  constructor (client) {
    super(client, {
      name: "softban",
      description: "fast ban and unban",
      category: "Moderation",
      usage: "<@users> [reason]",
      guildOnly: true,
      botPermissions: ['BAN_MEMBERS'],
      userPermissions: ['BAN_MEMBERS']
    });
  }

  async run (message, args, reply) {
    const settings = await Settings.findOne({ guildID: message.guild.id }),
    modrole = settings.modRole;

  let { victims, reason } = message.context,
  victimmsg = [];
if(!reason) reason = "[no reason specified]";

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

   if (message.member.roles.highest.position <= user.member.roles.highest.position && message.guild.ownerID !== message.author.id) return victimmsg.push(`${this.client.config.emojis.error} You do not have permission to softban ${FormatUtil.formatUser(user)}`);

  if(!user.member.bannable) return victimmsg.push(`${this.client.config.emojis.error} I do not have permission to softban ${FormatUtil.formatUser(user)}`)

  if(user.member.roles.cache.has(modrole)) return victimmsg.push(`${this.client.config.emojis.error} I won't softban ${FormatUtil.formatUser(user)} because they have the Moderator Role.`);

  message.guild.members.ban(user.id, { reason: `${message.author.tag}: ${reason}`, days: 1 })
  .then(async () => {
    if (message.guild.channels.cache.has(message.guild.settings.modLogsChannel)) {
      const Logger = new logHandler({ client: this.client, case: "softbanAdd", guild: message.guild.id, member: user, moderator: message.author, reason: reason });
      Logger.send().then(() => Logger.kill());
  }

  victimmsg.push(`${this.client.config.emojis.success} ${FormatUtil.formatUser(user)} has been softbanned.`);
try
{
  message.guild.members.unban(user.id, {reason: `${message.author.tag}: Softban and Unban`});
}
catch(e){
  return;
};
  })
  .catch(async e => {
    victimmsg.push(`${this.client.config.emojis.error} Failed to softban ${FormatUtil.formatUser(user)}`)
  })
    });
    var interval = setInterval(()=>{if(victims.length==victimmsg.length){ reply(victimmsg.join("\n")); clearInterval(interval)}},100);
  }
};

module.exports = SoftbanCmd