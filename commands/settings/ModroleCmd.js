const 
Command = require("../../base/Command.js"),
FinderUtil = require("../../utils/FinderUtil"),
FormatUtil = require("../../utils/FormatUtil"),
Settings = require("../../models/settings.js");

class ModroleCmd extends Command {
  constructor (client) {
    super(client, {
      name: "modrole",
      description: "define the moderator role",
      category: "Settings",
      usage: "<role>",
      guildOnly: true,
      userPermissions: ['MANAGE_GUILD', 'BAN_MEMBERS']
    });
  }

  async run (message, args, reply) {
    Settings.findOne({
      guildID: message.guild.id
    }, async (err, settings) => {
      if (err) this.client.logger.log(err, "error");
if(!args[0])
{
  reply(`${this.client.config.emojis.error} Please include the role to be set as Moderation Role.`);
  return;
}

else if(args[0].toLowerCase() == "none" || args[0].toLowerCase() == "off")
{
  settings.modRole = "none";
  await settings.save().catch(e => this.client.logger.log(e));
  reply(`${this.client.config.emojis.suces} The Moderator Role has been reset on that server.`);
  return;
}

const roles = FinderUtil.findRoles(args.join(" "), message.guild);
if(roles.size==0) 
  return reply(`${this.client.config.emojis.error} I couldn't find the role \`${args[0]}\``);
else if(roles.size==1)
{
  settings.modRole = await roles.first();
  await settings.save().catch(e => this.client.logger.log(e));
  reply(`${this.client.config.emojis.suces} Members with role \`${(await roles.first().name)}\` can use all Moderation Commands.`);
  return;
}
else
   reply(this.client.config.emojis.warning+FormatUtil.listOfRoles(roles, args.join(" ")));
    });
  }
}

module.exports = ModroleCmd;