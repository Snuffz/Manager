const 
Command = require("../../base/Command.js"),
FinderUtil = require("../../utils/FinderUtil"),
FormatUtil = require("../../utils/FormatUtil"),
Settings = require("../../models/settings.js"),
{ MessageEmbed } = require("discord.js");

class IgnoredusersCmd extends Command {
  constructor (client) {
    super(client, {
      name: "ignoredusers",
      description: "ignore user in automod",
      category: "Automod",
      usage: "<add | remove> <user>",
      guildOnly: true,
      aliases: ['ignoreduser', 'ignoreuser', 'ignored-users', 'ignoremember'],    
      userPermissions: ['MANAGE_GUILD']
    });
  }

  async run (message, args, reply) {
    Settings.findOne({
      guildID: message.guild.id
    }, async (err, settings) => {
      if (err) this.client.logger.log(err);
      if(!args[0])
      {
        const ebuilder = new MessageEmbed();
        ebuilder.setColor(message.guild.me.displayColor||"");
        ebuilder.setTitle("Automod Ignored Users");
        var builder = new String();
        const users = settings.ignoredUsers;
        message.guild.members.cache.filter(m => m.id!==this.client.user.id && !m.user.bot).forEach(u => {
       if(users.includes(u.id))
         builder+=`\n${u.toString()}`;
       else if(!u.roles.highest.comparePositionTo(message.guild.me.roles.highest)>0)
         builder+=`\n${u.toString()} (bigger user)`;
       else if(u.permissions.toArray().includes("ADMINISTRATOR")
         || u.permissions.toArray().includes("MANAGE_GUILD")
         || u.permissions.toArray().includes("BAN_MEMBERS")
         || u.permissions.toArray().includes("KICK_MEMBERS")
         || u.permissions.toArray().includes("MANAGE_MESSAGES"))
            builder+=`\n${u.toString()} (high permission)`
        });
        ebuilder.setDescription(builder.length > 2045 ? builder.substr(0, 2045) + "..." : builder.toString());
        reply("", ebuilder);
        return;
      }
      if(!["add", "remove"].includes(args[0].toLowerCase())) 
      return reply(`${this.client.config.emojis.error} Provide \`add\` or \`remove\` as pre-arguments.`);
      if(!args[1])
      return reply(`${this.client.config.emojis.error} Provide the user name.`);
      const option = args[0].toLowerCase();

      let member;
     const members = FinderUtil.findMembers(args.slice(1).join(" "), message.guild);
     if(members.size == 0)
     return message.channel.send(`${this.client.config.emojis.error} No members found matching \`${args.slice(1).join(" ")}\``, { disableMentions: "all" });
     else if(members.size == 1)
      member = members.first();
      else 
     return message.channel.send(this.client.config.emojis.warning+FormatUtil.listOfUser(members, args.slice(1).join(" ")), { disableMentions: "all" });


      if (option === "add") {
        if(!settings.ignoredUsers.includes(member.id))
        {
          settings.ignoredUsers.push(member.id);
          await settings.save().catch(e => this.client.logger.log(e, "error"));
        } 
        return reply(`${this.client.config.emojis.success} ${FormatUtil.formatUser(member.user)} will be ignored in my automod!`);
      } else if (option === "remove") {
        const index = settings.ignoredUsers.findIndex(i => i === user.id);
        if (index < 0) return reply(`${this.client.config.emojis.error} This member is not ignored!`);

        settings.ignoredUsers.splice(index, 1);
        await settings.save().catch(e => this.client.logger.log(e, "error"));
        return reply(`${this.client.config.emojis.success} ${FormatUtil.formatUser(member.user)} Successfully removed from my ignore list.`);
      }
    });
  }
}

module.exports = IgnoredusersCmd;
