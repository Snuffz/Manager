const
Command = require("../../base/Command.js"),
{ MessageEmbed } = require('discord.js'),
FormatUtil = require("../../utils/FormatUtil"),
FinderUtil = require("../../utils/FinderUtil"),
LINESTART = "\u25AB"; // ▫  

class RoleinfoCmd extends Command {
  constructor (client) {
    super(client, {
      name: "roleinfo",
      description: "shows information about a role",
      category: "General",
      usage: "<role>",
      guildOnly: true,
      aliases: ["rinfo","rankinfo"],
      botPermissions: ['EMBED_LINKS']
    });
  }

  async run (message, args, reply) {
    let role;
          if(!args[0])
            return reply(`${this.client.config.emojis.error} Please provide the role!`);
          else 
          {
          const found = FinderUtil.findRoles(args.join(" "), message.guild);

        if(found.size==0)
        {
          reply(`${this.client.config.emojis.error} I couldn't find the role you're looking for.`);
          return;
        }
        else if(found.size > 1)
        {
          message.channel.send(this.client.config.emojis.warning+FormatUtil.listOfRoles(found, args.join(" ")), { disableMentions: "all" });
          return;
        }
        else {
        role = await found.first();
        }
      }

        const list = role.members;
        let desr = new String(`${LINESTART}ID: **${role.id}**\n`
        + `${LINESTART}Creation: **${role.createdAt.toUTCString()}**\n`
        + `${LINESTART}Position: **${role.position}**\n`
        + `${LINESTART}Color: **${role.hexColor}**\n`
        + `${LINESTART}Mentionable: **${role.mentionable}**\n`
        + `${LINESTART}Hoisted: **${role.hoist}**\n`
        + `${LINESTART}Managed: **${role.managed}**\n`
        + `${LINESTART}Permissions: `);
    if(role.permissions.toArray().length==0)
       desr+="None"
    else
       desr+=role.permissions.toArray().map(perm => `\`${FormatUtil.formatPerms(perm)}\``).join(", ");
    desr+=`\n${LINESTART}Members: **${list.size}**\n`;
    if(list.size*24<=2048-desr.length)
       list.forEach(m => desr+=`<@${m.id}> `);
            
        const embed = new MessageEmbed()
        .setDescription(desr.toString().trim())
        .setColor(role.color||"")
        message.channel.send({content: `Role **${role.name}** information:`, embed: embed, disableMentions: "all"});
    }
}
    
    module.exports = RoleinfoCmd;