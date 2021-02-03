const 
Command = require("../../base/Command.js"),
FinderUtil = require("../../utils/FinderUtil"),
FormatUtil = require("../../utils/FormatUtil"),
Settings = require("../../models/settings.js");

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
      if(!args[0] || !["add", "remove"].includes(args[0].toLowerCase())) 
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
        return reply(`${this.client.config.emojis.success} ${FormatUtil.formatUser(member.user)} will be ignored in my automod`);
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
