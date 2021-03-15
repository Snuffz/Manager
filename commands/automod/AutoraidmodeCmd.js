const
automod = require("../../models/managers/AutomodManager"),
Command = require("../../base/Command.js");

const Constants = require("../../config.js");

class AutoraidmodeCmd extends Command {
  constructor (client) {
    super(client, {
      name: "autoraidmode",
      description: "enables/disables auto-raidmode",
      aliases: ["autoraid","autoantiraid","autoantiraidmode"],
      category: "Automod",
      usage: "<ON | OFF | joins/seconds>",
      guildOnly: true,
      botPermissions: ['MANAGE_GUILD'],
      userPermissions: ['MANAGE_GUILD']
    });
  }

  async run (message, args, reply) { 
      if(args.join(" ").toLowerCase()=="off")
      {
         await automod.setAutoRaidMode(message.guild, 0, 0);
          reply(`${this.client.config.emojis.success} Auto-Anti-Raid mode has been disabled.`);
          return;
      }
      var joins;
      var seconds;
      if(args.join(" ").toLowerCase()=="on")
      {
          joins = 10;
          seconds = 10;
      }
      else if(!args.join(" ").match(/\d{1,8}\s*\/\s*\d{1,8}/gm))
      {
        reply(`${this.client.config.emojis.error} Valid options are \`OFF\`, \`ON\`, or \`<joins>/<seconds>\`
\`OFF\` - Disables automatic anti-raid
\`ON\` - Enables automatic anti-raid
\`<joins>/<seconds>\` - Defines how many joins and the time between them
Read more at <${Constants.wiki.RAID_MODE}>`);
        return;
      }
      else 
      {
          const parts = args.join(" ").split(/\s*\/\s*/gm);
          joins = parseInt(parts[0]);
          seconds = parseInt(parts[1]);
      }
      await automod.setAutoRaidMode(message.guild, joins, seconds);
      reply(`${this.client.config.emojis.success} Anti-Raid mode will be enabled automatically when there are \`${joins}\` joins in \`${seconds}\` seconds.`)

  }
}
module.exports = AutoraidmodeCmd