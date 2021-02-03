const
Command = require("../../base/Command.js"),
{ MessageEmbed } = require('discord.js'),
FormatUtil = require("../../utils/FormatUtil"),
FinderUtil = require("../../utils/FinderUtil"),
perms = {
  "CREATE_INSTANT_INVITE": "Create Invite",
  "KICK_MEMBERS": "Kick Members",
  "BAN_MEMBERS": "Ban Members",
  "ADMINISTRATOR": "Administrator",
  "MANAGE_CHANNELS": "Manage Channels",
  "MANAGE_GUILD": "Manage Server",
  "ADD_REACTIONS": "Add Reactions",
  "VIEW_AUDIT_LOG": "View Audit Log",
  "VIEW_CHANNEL": "Read Text Channels & See Voice Channels",
  "READ_MESSAGES": "Read Messages",
  "SEND_MESSAGES": "Send Messages",
  "SEND_TTS_MESSAGES": "Send TTS Messages",
  "MANAGE_MESSAGES": "Manage Messages",
  "EMBED_LINKS": "Embed Links",
  "ATTACH_FILES": "Attach Files",
  "READ_MESSAGE_HISTORY": "Read Message History",
  "MENTION_EVERYONE": "Mentions @everyone, @here, and All Roles",
  "EXTERNAL_EMOJIS": "External Emojis",
  "USE_EXTERNAL_EMOJIS": "Use External Emojis",
  "VIEW_GUILD_INSIGHTS": "View Server Insights",
  "CONNECT": "Connect",
  "SPEAK": "Speak",
  "MUTE_MEMBERS": "Mute Members",
  "DEAFEN_MEMBERS": "Deafen Members",
  "MOVE_MEMBERS": "Move Members",
  "USE_VAD": "Use Voice Activity",
  "PRIORITY_SPEAKER": "Priority Speaker",
  "CHANGE_NICKNAME": "Change Nickname",
  "MANAGE_NICKNAMES": "Manage Nicknames",
  "MANAGE_ROLES": "Manage Roles",
  "MANAGE_ROLES_OR_PERMISSIONS": "Manage roles or Permissions",
  "MANAGE_WEBHOOKS": "Manage Webhooks",
  "MANAGE_EMOJIS": "Manage Emojis",
  "STREAM": "Video"
},
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

        str+=`\n${linestart} Permissions: ${role.permissions.toArray().map(perm => `\`${perms[perm]}\``).join(", ") || "**None**"}`;

        str+=`\n${linestart} Members: **${role.members.size}**${role.members.size<38?`\n${role.members.map(a => a.user).join(" ")}`:""}`;
            
        const embed = new MessageEmbed()
        .setDescription(str)
        .setColor(role.color||"")
        message.channel.send({content: `Role **${role.name}** information:`, embed: embed, disableMentions: "all"})
        
    }
}
    
    module.exports = RoleinfoCmd;