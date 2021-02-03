const 
Command = require("../../base/Command.js"),
OtherUtil = require("../../utils/OtherUtil"),
FormatUtil = require("../../utils/FormatUtil"),
PremiumManager = require("../../models/managers/PremiumManager");

class PremiumCmd extends Command {
  constructor (client) {
    super(client, {
      name: "premium",
      description: "gives premium",
      category: "Owner",
      usage: "<guildId> <time>",
      ownerOnly: true
    });
  }

  async run (message, args, reply) {
if(args.length < 2)
{
    reply(`${this.client.config.emojis.error} Less than two arguments.`);
    return;
}
let time;
if(args[1].toLowerCase() != "null" && OtherUtil.parseTime(args.slice(1).join(" ")).asMilliseconds()===0)
{
reply(`${this.client.config.emojis.error} Invalid time`);
return;
}
else time = args[1].toLowerCase()!="null" ? OtherUtil.parseTime(args.slice(1).join(" ")).asMilliseconds() : null;
const guild = this.client.guilds.cache.get(args[0]);
if(!guild) 
{
    reply(`${this.client.config.emojis.error} Guild not found with ID \`${args[0]}\``);
    return;
}
await PremiumManager.addPremium(guild, time!=null ? time : null);
await reply(`${this.client.config.emojis.success} Premium added to guild id \`${args[0]}\` for ${time!=null ? FormatUtil.msToTimeCompact(time) : "**forever**"}`)
  }
}
module.exports = PremiumCmd