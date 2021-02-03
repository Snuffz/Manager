const 
Command = require("../../base/Command.js"),
PunishmentManager = require("../../models/managers/PunishmentManager"),
Settings = require("../../models/settings.js");

class MaxLinesCmd extends Command {
  constructor (client) {
    super(client, {
      name: "maxlines",
      description: "define a maximun number of lines",
      category: "Automod",
      usage: "<number | OFF>",
      guildOnly: true,
      aliases: ['maxnewlines'],
      userPermissions: ['MANAGE_GUILD']
    });
  }

  async run (message, args, reply) { 
    if(!args[0])
     return reply(`${this.client.config.emojis.error} Provide the maximum number of lines.`);

    Settings.findOne({
      guildID: message.guild.id
    }, async (err, settings) => {
      if (err) this.client.logger.log(err, "error");

      let maxlines;
      if(!parseInt(args[0]))
      {
        if(args[0].toLowerCase() === "none" || args[0].toLowerCase() == "off")
        maxlines = 0
      else 
      {
    message.channel.send(`${this.client.config.emojis.error} \`${args[0]}\` it is not a valid number!`, { disableMentions: "all" });
    return;
      }
      }
      else 
      maxlines = parseInt(args[0]);
      if(maxlines<0)
      {
        reply(`${this.client.config.emojis.error} The maximum number of lines cannot be negative!`);
        return;
      }
      settings.maxLines = maxlines;
      await settings.save().catch(e => this.client.logger.log(e, "error"));
      const also = PunishmentManager.useDefaultSettings(message.guild);
      if(maxlines==0)
        return reply(`${this.client.config.emojis.success} There is now no maximum line limit.`)
        else
        reply(`${this.client.config.emojis.success} Messages longer than \`${maxlines}\` lines will now be automatically deleted, and users will receive strikes for every additional multiple of up to \`${maxlines}\` lines.${also ? PunishmentManager.DEFAULT_SETUP_MESSAGE : ""}`);
});
  }
}

module.exports = MaxLinesCmd;