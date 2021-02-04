const
Command = require("../../base/Command.js"),
{ MessageEmbed } = require('discord.js'),
FormatUtil = require("../../utils/FormatUtil"),
FinderUtil = require("../../utils/FinderUtil"),
linestart = "\u25AB"; // ▫  

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
          if(!args[0]) return reply(`${this.client.config.emojis.error} Please provide the role!`);

          let role;

          const found = FinderUtil.findRoles(args.join(" "), message.guild);

        if(found.size == 0) return reply(`${this.client.config.emojis.error} I couldn't find the role you're looking for.`);

        if(found.size > 1)
        {
      message.channel.send(this.client.config.emojis.warning+FormatUtil.listOfRoles(found, args.join(" ")), { disableMentions: "all" });
      return;
        }

        role = await found.first();

        var str = `${linestart} ID: **${role.id}**`;

        str+=`\n${linestart} Creation: **${role.createdAt.toUTCString()}**`;

        str+=`\n${linestart} Position: **${role.position}**`;

        str+=`\n${linestart} Color: **${role.hexColor}**`;

        str+=`\n${linestart} Mentionable: **${role.mentionable}**`;

        str+=`\n${linestart} Hoisted: **${role.hoist}**`;

        str+=`\n${linestart} Managed: **${role.permissions.has("ADMINISTRATOR")}**`;

        str+=`\n${linestart} Permissions: ${role.permissions.toArray().map(perm => `\`${FormatUtil.formatPerms(perm)}\``).join(", ") || "**None**"}`;

        str+=`\n${linestart} Members: **${role.members.size}**${role.members.size<38?`\n${role.members.map(a => a.user).join(" ")}`:""}`;
            
        const embed = new MessageEmbed()
        .setDescription(str)
        .setColor(role.color||"")
        message.channel.send({content: `Role **${role.name}** information:`, embed: embed, disableMentions: "all"})
        
    }
}
    
    module.exports = RoleinfoCmd;