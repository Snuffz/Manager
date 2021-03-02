const { stat } = require("fs");

const Command = require("../../base/Command.js"),
{ MessageEmbed, Collection } = require('discord.js'),
Collections = new Collection(),
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
     return reply(`${this.client.config.emojis.error} I could not find the member you are looking for.`);
      }
     else if(found.size > 1)
     {
       message.channel.send(this.client.config.emojis.warning+FormatUtil.listOfUser(found, args.join(" ")), { disableMentions: "all" });
       return;
     }
     else
      {
       member = await found.first();
    }
  }
    const user = member.user;
    let str = new String(`${linestart}Discord ID: **${user.id}** `);
    if(user.flags!=null)
       user.flags.toArray().forEach(flag => str+=OtherUtil.getEmoji(flag))
    if(user.avatar != null && user.avatar.startsWith("a_"))
       str+="<:nitro:688880424205680644>";
    if(member.nickname!=null) 
       str+=`\n${linestart}Nickname: **${member.nickname}**`;
    var roles="";
    roles = member.roles.cache.filter(e =>e.id!==message.guild.id).map(r=>`\`${r.name}\``).join(", ");
    if(roles.length==0)
       roles="None";
    str+=`\n${linestart}Roles: ${roles}`;
    str+=`\n${linestart}Status: ${statusToEmote(member.presence.status, member.presence.activities)} **${member.presence.status.toUpperCase()}**`;
    const game = member.presence.activities.length==0 ? null : member.presence.activities[0];
    if(game!=null)
       str+=` (${formatGame(game)})`;
    str+=`\n${linestart}Account Creation: **${member.user.createdAt.toUTCString()}**`;
    var joins = message.guild.members.cache;
    joins = joins.sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);
    let index = joins.array().indexOf(member);
    str+=`\n${linestart}Guild Join Date: **${member.joinedAt.toUTCString()}** \`(#${(index+1)})\``;
    index-=3;
    if(index<0)
      index=0;
    str+=`\n${linestart}Join Order: `;
    if(joins.array()[index] === member)
       str+=`[**${joins.array()[index].user.username}**]()`;
    else 
       str+=joins.array()[index].user.username;
       for(let i=index+1;i<index+7;i++)
       {
          if(i>=joins.size)
            break;
          const m = joins.array()[i];
          let uname = m.user.username;
          if(m===member)
             uname=`[**${uname}**]()`;
          str+=` > ${uname}`
       }
/*
      

    const ordered = message.guild.members.cache.sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);
    const index = ordered.keyArray().indexOf(member.id);



    str+=`\n${linestart} Guild Join Date: **${member.joinedAt.toUTCString()}** \`(#${(index + 1)})\``;
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
    index-=3;
    if(index<0)
       index=0;
    str+=`\n${linestart} Join Order: `;

    for(let i=index+1;i<index+7;i++)
    {
       if(i>=message.guild.members.cache.size)
         break;
       const m = ordered.array()[index - i];
       let uname = m.user.username
       if(m === member)
         uname=`[**${uname}**]()`;
       
    }*/

    const embed = new MessageEmbed()
    .setThumbnail(member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
    .setDescription(str)
    .setColor(member.roles.cache.filter(a=>a.color>0).sort((a,b) => a.position-b.position).map(a =>a.color).reverse()[0]||"")
    
message.channel.send({content: `${member.user.bot?bot_emoji:""} **${member.user.username}** #${member.user.discriminator} member information:`, embed: embed, disableMentions: "all"})





   /* str+=`\n${linestart} Roles: ${member.roles.cache.filter(e =>e.id!==message.guild.id).map(r=>`\`${r.name}\``).join(", ") || "None"}`;
  
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

    str+=`\n${linestart} Account Creation: **${member.user.createdAt.toUTCString()}**\n${linestart} Guild Join Date: **${member.joinedAt.toUTCString()}** \`(#${(index + 1)})\``;

    str+=`\n${linestart} Join Order: ${joinOrder}`;

    const embed = new MessageEmbed()
    .setThumbnail(member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
    .setDescription(str)
    .setColor(member.roles.cache.filter(a=>a.color>0).sort((a,b) => a.position-b.position).map(a =>a.color).reverse()[0]||"")
    
message.channel.send({content: `${member.user.bot?bot_emoji:""} **${member.user.username}** #${member.user.discriminator} member information:`, embed: embed, disableMentions: "all"})
    */
}
};

module.exports = UserinfoCmd;

function statusToEmote(status, games)
{
  const game = games.length==0 ? null : games[0];
  if(game!=null && game.type=="STREAMING" && game.url!=null && isValidStreamingUrl(game.url))
     return "<:streaming:685951937300267112>";
  switch(status) {
    case "online": return "<:online:685951578615840962>";
    case "idle": return "<:idle:685951698916737030>";
    case "dnd": return "<:dnd:685951669070069780>";
    case "offline": return "<:invisible:685951636870529024>";
    default: return "";
  }
  function isValidStreamingUrl(url)
  {
    const TWITCH_REGEX = /^(?:https?:\/\/)?(?:www\.|go\.)?twitch\.tv\/([a-z0-9_]+)($|\?)/g;
    const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/g;
    if(url.match(TWITCH_REGEX)!==null)
      return true;
    if(url.match(YOUTUBE_REGEX)!==null)
      return true;
      return false;
  }
}

function formatGame(game)
{
  var str;
  switch(game.type)
  {
    case "STREAMING":
      return `Streaming [*${game.name}*](${game.url})`;
    case "LISTENING": 
      str="Listening to";
      break;
    case "WATCHING":
      str="Watching";
      break;
    case "PLAYING":
      str="Playing";
      break;
    default:
      str="Playing";
      break;
  }
  return `${str} *${game.name}*`;
}