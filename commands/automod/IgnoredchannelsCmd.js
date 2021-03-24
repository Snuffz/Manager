const Command = require("../../base/Command.js");
const Settings = require("../../models/settings.js");
const { MessageEmbed } = require("discord.js");

class IgnoredchannelsCmd extends Command {
  constructor (client) {
    super(client, {
      name: "ignoredchannels",
      description: "ignore channel in automod",
      category: "Automod",
      usage: "<add | remove> <channel>",
      guildOnly: true,
      aliases: ['ignorechannel', 'ignoredchannel', 'ignore-channels'],
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
    ebuilder.setTitle("Automod Ignored Channels");
    var builder = new String();
    const channels = settings.ignoredChannels;
    channels.forEach(c => {
    if(!message.guild.channels.cache.has(c))
      return;
    const tc = message.guild.channels.cache.get(c);
    builder+=`\n${tc.toString()}`;
    });
    ebuilder.setDescription(builder.length > 2045 ? builder.substr(0,2045) + "..." : builder.toString());
    reply("", ebuilder);
    return;
    }
      if(!["add", "remove"].includes(args[0].toLowerCase())) 
      return reply(`${this.client.config.emojis.error} Provide \`add\` or \`remove\` as pre-arguments.`);
    if(!args[1])
    return reply(`${this.client.config.emojis.error} Provide the channel.`);
    const option = args[0].toLowerCase();

      const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
      if (!channel || channel.type !== 'text') return message.channel.send(`${this.client.config.emojis.error} No channels found matching \`${args.slice(1).join(" ")}\``, { disableMentions: "all" });

      if (option === "add") {        
        if(!settings.ignoredChannels.includes(channel.id))
         {
        settings.ignoredChannels.push(channel.id);
        await settings.save().catch(e => this.client.logger.log(e, "error"));
        }
        return reply(`${this.client.config.emojis.success} The channel ${channel} will be ignored in my automod!`);
      } else if (option === "remove") {
        const index = settings.ignoredChannels.findIndex(i => i === channel.id);
        if (index < 0) return reply(`${this.client.config.emojis.error} The channel ${channel} is not being ignored!`);
        
        settings.ignoredChannels.splice(index, 1);
        await settings.save().catch(e => this.client.logger.log(e, "error"));
        return reply(`${this.client.config.emojis.success} The channel ${channel} will no longer be ignored in the automod.`);
      }
    });
  }
}

module.exports = IgnoredchannelsCmd;