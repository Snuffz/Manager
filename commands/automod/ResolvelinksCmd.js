const Command = require("../../base/Command.js");
const Settings = require("../../models/settings.js");

const 
PremiumManager = require("../../models/managers/PremiumManager");

class ResolvelinksCmd extends Command {
  constructor (client) {
    super(client, {
      name: "resolvelinks",
      description: "resolve redirect urls",
      category: "Automod",
      usage: "<ON|OFF>",
      guildOnly: true,
      userPermissions: ['MANAGE_GUILD']
    });
  }

  async run (message, args, reply) {
    if((await PremiumManager.getPremiumInfo(message.guild)) === "No Premium")
    {
      reply(`${this.client.config.emojis.warning} This command can only be used on premium servers.`);
      return;
    }
    if(!args[0] || !["on","off"].includes(args[0].toLowerCase()))
    {
      reply(`${this.client.config.emojis.warning} Choose one of the following options: \`ON\`, \`OFF\``);
      return;
    }
    Settings.findOne({
      guildID: message.guild.id
    }, async (err, settings) => {
      if (err) this.client.logger.log(err, "error");
      settings.redirectLinks = args[0].toLowerCase();
      await settings.save().catch(e => this.client.logger.log(e, "error"));
      await reply(`${this.client.config.emojis.success} The link resolving system is currently \`${settings.redirectLinks.toUpperCase()}\``);
    });
  }
}

module.exports = ResolvelinksCmd;