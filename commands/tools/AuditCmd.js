const
Command = require("../../base/Command.js"),
{ MessageEmbed } = require('discord.js'),
LINESTART = "\u25AB"; // ▫
const FinderUtil = require("../../utils/FinderUtil");
const FormatUtil = require("../../utils/FormatUtil");
const Actions = Array("GUILD_UPDATE", "CHANNEL_CREATE", "CHANNEL_UPDATE", "CHANNEL_DELETE", "CHANNEL_OVERWRITE_CREATE",
"CHANNEL_OVERWRITE_UPDATE", "CHANNEL_OVERWRITE_DELETE", "MEMBER_KICK", "MEMBER_PRUNE", "MEMBER_BAN_ADD", "MEMBER_BAN_REMOVE",
"MEMBER_UPDATE", "MEMBER_ROLE_UPDATE", "MEMBER_MOVE", "MEMBER_DISCONNECT", "BOT_ADD", "ROLE_CREATE", "ROLE_UPDATE",
"ROLE_DELETE", "INVITE_CREATE", "INVITE_UPDATE", "INVITE_DELETE", "WEBHOOK_CREATE", "WEBHOOK_UPDATE", "WEBHOOK_DELETE",
"EMOJI_CREATE", "EMOJI_UPDATE", "EMOJI_DELETE", "MESSAGE_DELETE", "MESSAGE_BULK_DELETE", "MESSAGE_PIN", "MESSAGE_UNPIN",
"INTEGRATION_CREATE", "INTEGRATION_UPDATE", "INTEGRATION_DELETE");
var actions;
const UNKNOWN = "*Unknown*";

class AuditCmd extends Command {
  constructor (client) {
    super(client, {
      name: "audit",
      description: "fetches recent audit logs",
      category: "Tools",
      usage: "<ALL | FROM | ACTION> [target]",
      guildOnly: true,
      userPermissions: ["VIEW_AUDIT_LOG"],
      botPermissions: ["VIEW_AUDIT_LOG","EMBED_LINKS"],
      cooldown: 5,
    });
  }

  async run (message, args, reply) {
    if(args.length==0)
      return reply(`${this.client.config.emojis.error} Valid subcommands:\n\n\`${message.guild.settings.prefix}${this.help.name} all\` - shows recent audit log entries
\`${message.guild.settings.prefix}${this.help.name} from <user>\` - shows recent entries by a user
\`${message.guild.settings.prefix}${this.help.name} action <action>\` - shows recent entries of a certain action`);
    let stri = new String("\n\nValid actions: `");
    for(const name of Actions)
                stri+=`${name}\`, \``
    actions = stri.toString().substring(0, stri.length-3);
let action = await message.guild.fetchAuditLogs({ limit: 10 });

switch(args[0].toLowerCase())
{
  case "all":
    break;
  case "from":
    if(args.length==1)
      return reply(`${this.client.config.emojis.error} Please include a user`);
      const list = FinderUtil.findUsers(args.slice(1).join(" "), this.client);
    if(list.size==0)
      return reply(`${this.client.config.emojis.error} No users found matching \`${args.slice(1).join(" ")}\``);
    if(list.size>1)
      return message.channel.send(this.client.config.emojis.warning+FormatUtil.listOfUser(list, args.slice(1).join(" ")), { disableMentions: "all" });
      action = await message.guild.fetchAuditLogs({ limit: 10, user: list.first()});
    break;
    case "action":
      if(args.length==1)
        return reply(`${this.client.config.emojis.error} Please include an action${actions}`);
      var type = null;
      for (const tname of Actions)
      {
        if(tname.toLowerCase().replace("_", "")==args[1].toLowerCase().replace("_", "").replace(" ", ""))
        {
          type = tname;
          break;
        }
      }
      if(type==null)
         return reply(`${this.client.config.emojis.error} Please include a valid action${actions}`);
      action = await message.guild.fetchAuditLogs({ limit: 10, type: type });
      break;
      default: 
      return reply(`${this.client.config.emojis.error} Valid subcommands:\n\n\`${message.guild.settings.prefix}${this.help.name} all\` - shows recent audit log entries
\`${message.guild.settings.prefix}${this.help.name} from <user>\` - shows recent entries by a user
\`${message.guild.settings.prefix}${this.help.name} action <action>\` - shows recent entries of a certain action`);
}
if(action.entries.size==0)
{
   reply(`${this.client.config.emojis.warning} No audit log entries found matching your criteria`);
   return;
}

const eb = new MessageEmbed().setColor(message.guild.me.displayColor||"");
action.entries.forEach(ale => 
  {
    var sb = new String();
    sb+=`${LINESTART}User: ${FormatUtil.formatFullUser(ale.executor)}`;
    switch(ale.targetType)
    {
      case "CHANNEL":
        const tc = message.guild.channels.cache.get(ale.target.id);
        sb+=`\n${LINESTART}Channel: ${tc==null ? UNKNOWN : `**#${tc.name}**`} (${ale.target.id})`;
        break;
      case "EMOJI":
        const e = message.guild.emojis.cache.get(ale.target.id);
        sb+=`\n${LINESTART}Emote: ${e==null ? UNKNOWN : e.toString()} (${ale.target.id})`;
        break;
        case "GUILD":
          break;
        case "INVITE":
          break;
        case "USER":
          const u = this.client.users.cache.get(ale.target.id);
          sb+=`\n${LINESTART}Member: ${u==null ? UNKNOWN : FormatUtil.formatUser(u)} (${ale.target.id})`;
          break;
        case "ROLE":
          const r = message.guild.roles.cache.get(ale.target.id);
          sb+=`\n${LINESTART}Role: ${r==null ? UNKNOWN : `**${r.name}**`} (${ale.target.id})`;
          break;
        case "WEBHOOK":
          sb+=`\n${LINESTART}Webhook ID: ${ale.target.id}`;
          break;
        default: 
        sb+=`\n${LINESTART}Target ID: ${ale.target.id}`;
    }
    if(ale.changes)
    {
    ale.changes.forEach(change => 
      {
        sb+=`\n${LINESTART}${fixCase(change.key)}: ${change.old==null ? "" : `**${typeof change.old=="object" ? JSON.stringify(change.old[0]) : change.old}**`}${change.old==null || change.new==null ? "" : " → "}${change.new==null ? "" : `**${typeof change.new=="object" ? JSON.stringify(change.new[0]) : change.new}**`}`
      });
    }
      if(ale.reason!=null)
        sb+=`\n${LINESTART}Reason: ${ale.reason}`;
        sb+=`\n${LINESTART}Time: **${ale.createdAt.toUTCString()}**\n\u200B`;
        const str = sb.length>1024 ? sb.substring(0,1020)+" ..." : sb.toString();
        eb.addField(actionToEmote(ale.action)+" "+fixCase(ale.action), str, true);
  });
message.channel.send({ content: `${this.client.config.emojis.success} Recent Audit Logs in **${message.guild.name}**:`,
embed: eb,
disableMentions: "all" })
.catch(() => reply(`${this.client.config.emojis.warning} Failed to retrieve audit logs`));

        function fixCase(input)
        {
          var ret = "";
          for(var i=0; i<input.length; i++)
             if(input.charAt(i) == '_')
                ret += " ";
             else if(i==0 || input.charAt(i-1) == '_')
                ret += input.charAt(i).toUpperCase();
             else 
                ret += input.charAt(i).toLowerCase();
          return ret;
        }

        function actionToEmote(type)
        {
          switch(type)
          {
            case "MEMBER_BAN_ADD": return "<:Ban:822449246263181313>";
            case "MEMBER_KICK": return "<:Kick:822449339255226368>";
            case "MEMBER_BAN_REMOVE": return "<:Unban:822449491327057980>";
            case "MEMBER_PRUNE": return "<:removeMember:822474261805006908>";

            case "CHANNEL_CREATE": return "<:addChannel:822474545466048582>";
            case "CHANNEL_DELETE": return "<:deleteChannel:822477312104071189>";
            case "CHANNEL_UPDATE": return "<:updateChannel:822477482041147452>";

            case "EMOJI_CREATE": return "<:createEmoji:822479772524871752> ";
            case "EMOJI_DELETE": return "<:deleteEmoji:822479819450744902> ";
            case "EMOJI_UPDATE": return "<:updateEmoji:822479870704877568>";

            case "GUILD_UPDATE": return "<:updateServer:822488592395796550>";

            case "INVITE_CREATE": return "<:addInvite:822611048459927671> ";
            case "INVITE_DELETE": return "<:deleteInvite:822611244304957470> ";
            case "INVITE_UPDATE": return "<:updateInvite:822626501471633439>";

            case "MEMBER_ROLE_UPDATE": return "<:updateMember:822618382268104765>";
            case "MEMBER_UPDATE": return "<:updateMember:822618382268104765>";

            case "MESSAGE_DELETE": return "<:deleteMessage:822618701547175937>";

            case "ROLE_CREATE": return "<:createRole:822618778184712202> ";
            case "ROLE_DELETE": return "<:deleteRole:822618940517646386> ";
            case "ROLE_UPDATE": return "<:updateRole:822618826637049856>";

            case "WEBHOOK_CREATE": return "<:createWebhook:822619088702537778> ";
            case "WEBHOOK_DELETE": return "<:deleteWebhook:822619205840797716> ";
            case "WEBHOOK_UPDATE": return "<:updateWebhook:822619367095009281>";

            case "ALL": return "\u2753"; // ❓
            default: return "\u2753"; // ❓
          }
        }
}
}
module.exports = AuditCmd;

