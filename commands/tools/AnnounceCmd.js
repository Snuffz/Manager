const Command = require("../../base/Command.js");
const Settings = require("../../models/settings.js");

const
FinderUtil = require("../../utils/FinderUtil"),
FormatUtil = require("../../utils/FormatUtil");

class AnnounceCmd extends Command {
  constructor (client) {
    super(client, {
      name: "announce",
      description: "announce something on some channel",
      category: "Tools",
      usage: "<channel> <rolename> / <message>",
      guildOnly: true,
      aliases: ['echo'],
      botPermissions: ['MANAGE_ROLES'],
      botPermissions: ['MANAGE_ROLES'],
    });
  }

  async run (message, args, reply) {
    if(args.length<3 || !args.slice(1).includes("/") || !args.slice(args.indexOf("/")+1, args.length)[0])
    {
      reply(`${this.client.config.emojis.error} Provide the channel, role name and message by separating it by \`/\``);
      return;
    }
    const list = FinderUtil.findTextChannels(args[0], message.guild);
   if(list.size==0)
     return message.channel.send(`${this.client.config.emojis.error} I couldn't find the channel \`${args[0]}\``, { disableMentions: "all" });
   if(list.size>1)
     return message.channel.send(this.client.config.emojis.warning+FormatUtil.listOfText(list, args[0]), { disableMentions: "all" });
     const tc = list.first();
     if(!tc.permissionsFor(message.guild.me).has("SEND_MESSAGES"))
     return reply(`${this.client.config.emojis.error} I am not allowed to send messages on the channel ${tc.toString()}`);
     if(!tc.permissionsFor(message.member).has("SEND_MESSAGES") && message.guild.ownerID !== message.author.id)
     return reply(`${this.client.config.emojis.error} You are not allowed to send messages on the channel ${tc.toString()}`);
     const args2 = args.slice(1, args.indexOf("/")).join(" ");
     const rlist = FinderUtil.findRoles(args2, message.guild);
     if(rlist.size==0)
     return message.channel.send(`${this.client.config.emojis.error} I didn't find any role called \`${args2}\``, { disableMentions: "all" });
     if(rlist.size>1)
     return message.channel.send(this.client.config.emojis.warning+FormatUtil.listOfRoles(rlist, args2), { disableMentions: "all" });
     const role = rlist.first();
     if(role.position>message.guild.me.roles.highest.position)
     return message.channel.send(`${this.client.config.emojis.error} I am not allowed to interact with the role \`${role.name}\`. Put my position above it.`);
     if(role.position>message.member.roles.highest.position && message.guild.ownerID !== message.author.id)
     return message.channel.send(`${this.client.config.emojis.error} You are not allowed to interact with the role \`${role.name}\``);
     let msg = `${role.toString()}, ${args.slice(args.indexOf("/")+1, args.length).join(" ").replace(/<@&/g, "<ම&")}`;
     if(msg.length > 2000)
     msg = msg.substr(0, 2000);
     if(!role.mentionable)
     {
       const reason = `Announcement by ${message.author.tag}`;
       role.setMentionable(true, reason).then(() => {
         tc.send(msg).then(() => {
        reply(`${this.client.config.emojis.success} Annunciation for \`${role.name}\` in ${tc.toString()} sent with success!`);
        role.setMentionable(false, reason).catch(e=>{});
         })
         .catch(() => {
           reply(`${this.client.config.emojis.error} Failed to send announcement.`);
           role.setMentionable(false, reason).catch(e=>{});
         })
       })
       .catch(() => reply(`${this.client.config.emojis.error} Failed to modify the role \`${role.name}\``)) // mentionable
     }
     else 
     {
       tc.send(msg)
       .then(() => reply(`${this.client.config.emojis.success} Annunciation for \`${role.name}\` in ${tc.toString()} sent with success!`))
       .catch(() => reply(`${this.client.config.emojis.error} Failed to send announcement.`));
     }
    }
  }
  module.exports = AnnounceCmd