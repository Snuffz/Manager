const Command = require("../../base/Command.js"),
{ MessageEmbed } = require('discord.js'),
FinderUtil = require("../../utils/FinderUtil"),
FormatUtil = require("../../utils/FormatUtil"),
OtherUtil = require("../../utils/OtherUtil"),
bot_emoji = "<:bot:686626014411096186>",
linestart = "\u25AB"; // ▫
class UserinfoCmd extends Command {
  constructor (client) {
    super(client, {
      name: "userinfo",
      description: "shows a information about one user in guild",
      category: "General",
      usage: "[user]",
      guildOnly:true,
      aliases: ["user","uinfo","memberinfo"],
      botPermissions: ['EMBED_LINKS']
    });
  }

  async run (message, args, reply) {

    let member;

    if(!args[0])
    {
      member = message.member;
    }
    else
     {

      const found = FinderUtil.findMembers(args.join(" "), message.guild);

      if(found.size == 0)
       {
      reply(`${this.client.config.emojis.error} I could not find the member you are looking for.`);
      }
     else if(found.size > 1)
     {
       message.channel.send(this.client.config.emojis.warning+FormatUtil.listOfUser(found, args.join(" ")), { disableMentions: "all" });
     }
     else
      {
       member = await found.first();
    }
  }
 
    var str = `${linestart} Discord ID: **${member.id}** ${OtherUtil.getEmoji(member.user.flags)}`;

    if(member.user.avatar != null && member.user.avatar.startsWith("a_"))
     str+="<:nitro:688880424205680644>";
    if(member.nickname!=null) str+=`\n${linestart} Nickname: **${member.nickname}**`;

    str+=`\n${linestart} Roles: ${member.roles.cache.filter(e =>e.id!==message.guild.id).map(r=>`\`${r.name}\``).join(", ") || "None"}`;
  
    const ordered = message.guild.members.cache.sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);
    const index = ordered.keyArray().indexOf(member.id);
    let joinOrder;
    switch (index) {
      case 0:
        joinOrder = `**${ordered.array()[index].user.username}** > ${ordered.array()[index + 1].user.username} > ${ordered.array()[index + 2].user.username} > ${ordered.array()[index + 3].user.username} > ${ordered.array()[index + 4].user.username}`;
        break;
      case 1:
        joinOrder = `${ordered.array()[index - 1].user.username} > **${ordered.array()[index].user.username}** > ${ordered.array()[index + 1].user.username} > ${ordered.array()[index + 2].user.username} > ${ordered.array()[index + 3].user.username}`;
        break;
      case (message.guild.members.cache.size - 1):
        joinOrder = `${ordered.array()[index - 4].user.username} > ${ordered.array()[index - 3].user.username} > ${ordered.array()[index - 2].user.username} > ${ordered.array()[index - 1].user.username} > **${ordered.array()[index].user.username}**`;
        break;
      case (message.guild.members.cache.size - 2):
        joinOrder = `${ordered.array()[index - 3].user.username} > ${ordered.array()[index - 2].user.username} > ${ordered.array()[index - 1].user.username} > **${ordered.array()[index].user.username}** > ${ordered.array()[index + 1].user.username}`;
        break;
      default:
        joinOrder = `${ordered.array()[index - 2].user.username} > ${ordered.array()[index - 1].user.username} > **${ordered.array()[index].user.username}** > ${ordered.array()[index + 1].user.username} > ${ordered.array()[index + 2].user.username}`;
        break;
    }

    str+=`\n${linestart} Account Creation: **${member.user.createdAt.toUTCString()()}**\n${linestart} Guild Join Date: **${member.joinedAt.toUTCString()()}** \`(#${(index + 1)})\``;

    str+=`\n${linestart} Join Order: ${joinOrder}`;

    const embed = new MessageEmbed()
    .setThumbnail(member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
    .setDescription(str)
    .setColor(member.roles.cache.filter(a=>a.color>0).sort((a,b) => a.position+b.position).map(a =>a.color)[0]||"")
    
message.channel.send({content: `${member.user.bot?bot_emoji:""} **${member.user.username}** #${member.user.discriminator} member information:`, embed: embed, disableMentions: "all"})
    
}
};

module.exports = UserinfoCmd;
