const Command = require("../../base/Command.js"),
{ MessageEmbed } = require('discord.js'),
FinderUtil = require("../../utils/FinderUtil"),
FormatUtil = require("../../utils/FormatUtil"),
OtherUtil = require("../../utils/OtherUtil"),
BOT_EMOJI = "<:bot:686626014411096186>",
LINESTART = "\u25AB"; // ▫

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
    let str = new String(`${LINESTART}Discord ID: **${user.id}** `);
    if(user.flags!=null)
       user.flags.toArray().forEach(flag => str+=OtherUtil.getEmoji(flag))
    if(user.avatar != null && user.avatar.startsWith("a_"))
       str+="<:nitro:688880424205680644>";
    if(member.nickname!=null) 
       str+=`\n${LINESTART}Nickname: **${member.nickname}**`;
    var roles="";
    roles = member.roles.cache.filter(e =>e.id!==message.guild.id).map(r=>`\`${r.name}\``).join(", ");
    if(roles.length==0)
       roles="None";
    str+=`\n${LINESTART}Roles: ${roles}`;
    //str+=`\n${LINESTART}Status: ${statusToEmote(member.presence.status, member.presence.activities)} **${member.presence.status.toUpperCase()}**`;
    //const game = member.presence.activities.length==0 ? null : member.presence.activities[0];
    //if(game!=null)
    //   str+=` (${formatGame(game)})`;
    str+=`\n${LINESTART}Account Creation: **${user.createdAt.toUTCString()}**`;
    var joins = message.guild.members.cache;
    joins = joins.sort((a, b) => a.joinedTimestamp - b.joinedTimestamp);
    let index = joins.array().indexOf(member);
    str+=`\n${LINESTART}Guild Join Date: **${member.joinedAt.toUTCString()}** \`(#${(index+1)})\``;
    index-=3;
    if(index<0)
      index=0;
    str+=`\n${LINESTART}Join Order: `;
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

    message.channel.send({ content: `${user.bot?BOT_EMOJI:""} **${user.username}** #${user.discriminator} member information:`,
                             embed: new MessageEmbed()
                            .setDescription(str)
                            .setThumbnail(user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
                            .setColor(member.roles.cache.filter(a=>a.color>0).sort((a,b) => a.position-b.position).map(a =>a.color).reverse()[0]||""),
                            disableMentions: "all"
                          })
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