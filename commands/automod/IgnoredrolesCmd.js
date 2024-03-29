const 
Command = require("../../base/Command.js"),
FinderUtil = require("../../utils/FinderUtil"),
FormatUtil = require("../../utils/FormatUtil"),
Settings = require("../../models/settings.js"),
{ MessageEmbed } = require("discord.js");

class IgnoredrolesCmd extends Command {
  constructor (client) {
    super(client, {
      name: "ignoredroles",
      description: "ignore role in automod",
      category: "Automod",
      usage: "<add | remove> <role>",
      guildOnly: true,
      aliases: ['ignoreroles', 'ignoredrole', 'ignore-roles'],
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
      ebuilder.setTitle("Automod Ignored Roles");
      var builder = new String();
      const roles = settings.ignoredRoles;
      message.guild.roles.cache.forEach(r => {
    if(roles.includes(r.id))
       builder+=`\n${r.toString()}`;
    else if(!r.comparePositionTo(message.guild.me.roles.highest)>0)
       builder+=`\n${r.toString()} (bigger role)`;
    else if(r.permissions.toArray().includes("ADMINISTRATOR")
    || r.permissions.toArray().includes("MANAGE_GUILD")
    || r.permissions.toArray().includes("BAN_MEMBERS")
    || r.permissions.toArray().includes("KICK_MEMBERS")
    || r.permissions.toArray().includes("MANAGE_MESSAGES"))
       builder+=`\n${r.toString()} (high permission)`
      });
      ebuilder.setDescription(builder.length > 2045 ? builder.substr(0, 2045) + "..." : builder.toString());
      reply("", ebuilder);
      return;
    }
      if(!["add", "remove"].includes(args[0].toLowerCase())) 
      return reply(`${this.client.config.emojis.error} Provide \`add\` or \`remove\` as pre-arguments.`);
      if(!args[1])
      return reply(`${this.client.config.emojis.error} Provide the role name.`);
      const option = args[0].toLowerCase();
      let role;
      const roles = FinderUtil.findRoles(args.slice(1).join(" "), message.guild);
      if(roles.size == 0)
           return message.channel.send(`${this.client.config.emojis.error} No roles found matching \`${args.slice(1).join(" ")}\``, { disableMentions: "all" });
           else if(roles.size == 1)
            role = roles.first();
            else 
           return message.channel.send(this.client.config.emojis.warning+FormatUtil.listOfRoles(roles, args.slice(1).join(" ")), { disableMentions: "all" });
      if (option === "add") {
        if(!settings.ignoredRoles.includes(role.id)){
          settings.ignoredRoles.push(role.id);
          await settings.save().catch(e => this.client.logger.log(e, "error"));
        } 
        return message.channel.send(`${this.client.config.emojis.success} The role \`${role.name}\` will be ignored in my automod!`, { disableMentions: "all" });
      } else if (option === "remove") {
        const index = settings.ignoredRoles.findIndex(i => i === role.id);
        if (index < 0) return message.channel.send(`${this.client.config.emojis.error} The role \`${role.name}\` is not being ignored!`, { disableMentions: "all" });
        
        settings.ignoredRoles.splice(index, 1);
        await settings.save().catch(e => this.client.logger.log(e, "error"));
        return message.channel.send(`${this.client.config.emojis.success} The role \`${role.name}\` will no longer be ignored in the automod.`, { disableMentions: "all" });
      }
    });
  }
}

module.exports = IgnoredrolesCmd;