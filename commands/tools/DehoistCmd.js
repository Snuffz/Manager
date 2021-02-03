const Command = require("../../base/Command.js");
const
OtherUtil = require("../../utils/OtherUtil");

class DehoistCmd extends Command {
  constructor (client) {
    super(client, {
      name: "dehoist",
      description: "changes the nickname of all users who have such a symbol provided",
      category: "Tools",
      usage: "[symbol]",
      guildOnly: true,
      botPermissions: ['MANAGE_NICKNAMES'],
      userPermissions: ['MANAGE_NICKNAMES'],
      cooldown: 10
    });
  }

  async run (message, args, reply) {
    var symbol;
    if(!args[0])
            symbol = OtherUtil.DEHOIST_ORIGINAL[0];
    else if(OtherUtil.DEHOIST_ORIGINAL.includes(args[0]))
            symbol = args[0];
    else 
    return reply(`${this.client.config.emojis.error} You must provide one of the following characters: ${OtherUtil.DEHOIST_ORIGINAL.map(c => `\`${c}\``).join(", ")}`);

    const count = message.guild.members.cache.filter(m => OtherUtil.dehoist(m, symbol)).size;

    reply(`${this.client.config.emojis.success} Dehoisting \`${count}\` members with names starting with \`${symbol}\``);
  }

}
module.exports = DehoistCmd