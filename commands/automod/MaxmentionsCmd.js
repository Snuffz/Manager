const 
Command = require("../../base/Command.js"),
AutomodManager = require("../../models/managers/AutomodManager"),
PunishmentManager = require("../../models/managers/PunishmentManager"),
Settings = require("../../models/settings.js");

class MaxmentionsCmd extends Command {
  constructor (client) {
    super(client, {
      name: "maxmentions",
      description: "define a maximun number of mentions (role or user)",
      category: "Automod",
      usage: "<number | OFF>",
      guildOnly: true,
      aliases: ['antimention', 'maxmention', 'mentionmax', 'mentionsmax'],
      userPermissions: ['MANAGE_GUILD']
    });
  }

  async run (message, args, reply) {
    Settings.findOne({
      guildID: message.guild.id
    }, async (err, settings) => {
      if (err) this.client.logger.log(err, "error");
    if(!args[0])
      return reply(`${this.client.config.emojis.error} Please include a number.`);
      if(!["roles", "role"].includes(args[0].toLowerCase()))
      {
      if(args[0].toLowerCase() == "off" || args[0].toLowerCase() == "none")
      {
        settings.maxMentions = 0;
        await settings.save().catch(e => this.client.logger.log(e, "error"));
        reply(`${this.client.config.emojis.success} Max mentions disabled.`)
        return;
      }
      const num = parseInt(args[0]);
      if(!num)
      {
        reply(`${this.client.config.emojis.error} Provide a valid number or OFF.`);
        return;
      }
      else if(num<0)
      {
        reply(`${this.client.config.emojis.error} The maximum number of mentions cannot be negative!`);
        return;
      }
      else if(num>AutomodManager.MENTION_MINIMUM)
      {
    reply(`${this.client.config.emojis.error} Please enter a maximum number above \`${AutomodManager.MENTION_MINIMUM}\`.`);
    return;
      }
      settings.maxMentions = num;
      await settings.save().catch(e => this.client.logger.log(e, "error"));
      const also = PunishmentManager.useDefaultSettings(message.guild);
    reply(`${this.client.config.emojis.success} Set when a user mentions another user more than **${num}** he will receive a strike for each additional mention.
\nTo set up and do the same thing with roles, use \`${settings.prefix}${this.help.name} roles <number>\`${also ? PunishmentManager.DEFAULT_SETUP_MESSAGE : ""}`)
  }
  else
  {
    if(!args[1])
    {
      reply(`${this.client.config.emojis.error} Please include a number.`);
      return;
    }
    if(args[1].toLowerCase() == "off" || args[1].toLowerCase() == "none")
    {
      settings.maxMentionsRoles = 0;
      await settings.save().catch(e => this.client.logger.log(e, "error"));
      reply(`${this.client.config.emojis.success} Max mentions roles disabled.`);
      return;   
    }
    const num = parseInt(args[1])
    if(!num)
    {
      reply(`${this.client.config.emojis.error} Provide a valid number or OFF.`);
      return;
    }
    if(num<0)
    {
      reply(`${this.client.config.emojis.error} The maximum number of mentions cannot be negative!`);
      return; 
    }
    if(num>AutomodManager.ROLES_MENTION_MINIMUM)
    {
      reply(`${this.client.config.emojis.error} Please enter a maximum number above \`${AutomodManager.ROLES_MENTION_MINIMUM}\`.`);
      return;
    }
    settings.maxMentionsRoles = num;
    await settings.save().catch(e => this.client.logger.log(e, "error"));

    reply(`${this.client.config.emojis.success} Max mentions roles set for **${num}**.`);
  }
});
  }
}

module.exports = MaxmentionsCmd;