const
Command = require("../../base/Command.js"),
FormatUtil = require("../../utils/FormatUtil"),
logHandler = require("../../handlers/serverLogger.js");

class UnbanCmd extends Command {
  constructor (client) {
    super(client, {
      name: "unban",
      description: "unbans users",
      category: "Moderation",
      usage: "<@users> [reason]",
      guildOnly: true,
      botPermissions: ['BAN_MEMBERS'],
      userPermissions: ['BAN_MEMBERS']
    });
  }

  async run (message, args, reply) {
  let { victims, reason } = message.context;
if(!reason) reason = "[no reason specified]";

if(!args[0] || !victims[0]) return reply(`${this.client.config.emojis.error} Please provide at least one user (@mention or ID).`);

const bans = await message.guild.fetchBans(),
victimmsg = [];

await victims.forEach(async e => {
  try
  { 
    await this.client.users.fetch(e)
      }
       catch(e) { return victimmsg.push(`${this.client.config.emojis.error} Please include at least one user (@mention or ID).`) }
   
       const user = await this.client.users.fetch(e); 

       if(!bans.has(user.id)) return victimmsg.push(`${this.client.config.emojis.error} ${message.guild.members.cache.has(user.id)?FormatUtil.formatUser(user):`<@${user.id}>`} is not banned!`);

       message.guild.members.unban(user.id, {reason: `${message.author.tag}: ${reason}`})
      .then(async () => {
        if (message.guild.channels.cache.has(message.guild.settings.modLogsChannel)) {
          const Logger = new logHandler({ client: this.client, case: "unban", guild: message.guild.id, member: user, moderator: message.author, reason: reason });
          Logger.send().then(() => Logger.kill());
        }
        victimmsg.push(`${this.client.config.emojis.success} ${FormatUtil.formatUser(user)} has been unbanned.`);
      })
      .catch(async () => {
        victimmsg.push(`${this.client.config.emojis.error} Failed to unban ${FormatUtil.formatUser(user)}`)
      });
    });
    var interval = setInterval(()=>{if(victims.length==victimmsg.length){ reply(victimmsg.join("\n")); clearInterval(interval)}},100);
  }
};

module.exports = UnbanCmd