const Command = require("../../base/Command.js");
const Settings = require("../../models/settings.js");

const PREFIX_MAX_LENGTH = 40;

class PrefixCmd extends Command {
  constructor (client) {
    super(client, {
      name: "prefix",
      description: "change prefix on server",
      category: "Settings",
      usage: "<prefix>",
      guildOnly: true,
      userPermissions: ['MANAGE_GUILD']
    });
  }

  async run (message, args, reply) { 
    Settings.findOne({
        guildID: message.guild.id
      }, async (err, settings) => {
        if (err) this.client.logger.log(err, "error");

if(!args[0])
{
  reply(`${this.client.config.emojis.error} Please include the prefix.`);
  return;
}

if(args[0].toLowerCase() == "none")
{
  settings.prefix = this.client.config.prefix;
  await settings.save().catch(e => this.client.logger.log(e, "error"));
  return reply(`${this.client.config.emojis.success} Prefix reset.`)
}

if(args[0].length>PREFIX_MAX_LENGTH)
{
  reply(`${this.client.config.emojis.error} The prefix cannot be longer than \`${PREFIX_MAX_LENGTH}\` characters.`);
  return;
}

settings.prefix = args[0];
await settings.save().catch(e => this.client.logger.log(e, "error"));
reply(`${this.client.config.emojis.success} Prefix set to \`${args[0]}\``);
      });
  }
}

module.exports = PrefixCmd;
