const
PunishmentManager = require("../../models/managers/PunishmentManager"),
Settings = require("../../models/settings.js"),
Command = require("../../base/Command.js");

class AntiinviteCmd extends Command {
  constructor (client) {
    super(client, {
      name: "antiinvite",
      description: "set the anti-invite strikes",
      category: "Automod",
      usage: "<strikes>",
      guildOnly: true,
      aliases: ["antinvite","anti-invite"],
      userPermissions: ['MANAGE_GUILD']
    });
  }

  async run (message, args, reply) { 
    if(!args[0]) return reply(`${this.client.config.emojis.error} Please provide the number of strikes!`);
    Settings.findOne({
      guildID: message.guild.id
    }, async (err, settings) => {
      if (err) this.client.logger.log(err, "error");
let numstrikes;
if(args[0].toLowerCase() == "off" || args[0].toLowerCase() == "none")
{
  numstrikes = 0;
} else if(!isNaN(args[0]))
numstrikes = parseInt(args[0]);
else return message.channel.send(`${this.client.config.emojis.error} \`${args[0]}\` is not a valid number!`, { disableMentions: "all" });
if(numstrikes<0 || numstrikes>PunishmentManager.MAX_STRIKES)
{
  reply(`${this.client.config.emojis.error} The number of strikes cannot be less than 0 or greater than ${PunishmentManager.MAX_STRIKES}!`);
  return;
}
          settings.antiInvite = numstrikes;
          await settings.save().catch(e => this.client.logger.log(e, "error"));
          const also = PunishmentManager.useDefaultSettings(message.guild);
          return reply(`${this.client.config.emojis.success} Users will now receive \`${numstrikes}\` strikes for posting invite links.${also ? PunishmentManager.DEFAULT_SETUP_MESSAGE : ""}`);
      })
  }
}

  module.exports = AntiinviteCmd