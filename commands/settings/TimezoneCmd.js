const 
Command = require("../../base/Command.js"),
Settings = require("../../models/settings.js"),
moment = require('moment');

class TimezoneCmd extends Command {
  constructor (client) {
    super(client, {
      name: "timezone",
      description: "sets the time stamp for server-log, mod-log and member-log records",
      category: "Settings",
      usage: "<zone>",
      guildOnly: true,
      userPermissions: ['MANAGE_GUILD']
    });
  }

  async run (message, args, reply) {
    if(!args[0]) 
    {
      reply(`${this.client.config.emojis.error} Please provide the time zone.`);
      return;
    }
    Settings.findOne({
        guildID: message.guild.id
      }, async (err, settings) => {
        if (err) this.client.logger.log(err, "error");
if(!moment(Date.now()).tz(args[0])._isUTC) 
{
  reply(`${this.client.config.emojis.error} \`${args[0]}\` is not a valid timezone! Check ${this.client.config.wiki.TIMEZONE}`);
  return;
}
        settings.timezone = args[0];
        await settings.save().catch(e => this.client.logger.log(e));
        return reply(`${this.client.config.emojis.success} TimeZone set as \`${args[0]}\``);
      });
  }
}

module.exports = TimezoneCmd