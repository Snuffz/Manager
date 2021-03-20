const Command = require("../../base/Command.js");
const Settings = require("../../models/settings.js");
const automod = require("../../models/managers/AutomodManager");

class RaidCmd extends Command {
  constructor (client) {
    super(client, {
      name: "raidmode",
      description: "view, enable, or disable raidmode",
      category: "Moderation",
      usage: "[ON|OFF] [reason]",
      guildOnly: true,
      aliases: ["raid","antiraidmode"],
      botPermissions: ['MANAGE_GUILD', 'KICK_MEMBERS'],
      userPermissions: ['MANAGE_GUILD', 'KICK_MEMBERS']
    });
  }

  async run (message, args, reply) {
    Settings.findOne({
      guildID: message.guild.id
    }, async (err, settings) => {
      if (err) this.client.logger.log(err, "error");

    const active = args.length > 0 ? args[0].toLowerCase() : settings.isInRaidMode,
    reason = args.slice(1).join(" ") || "[no reason specified]";

    if(["off","stop","disable"].includes(active))
    {
      if (settings.antiRaid === "off")
       return reply(`${this.client.config.emojis.error} Anti-Raid mode is already disabled on this server.`);
       await automod.disableRaidMode(message.guild, message.author, reason);
          return reply(`${this.client.config.emojis.success} Anti-Raid mode has been disabled.`)
    }
    else if (["on","start","enable"].includes(active))
    {
      if (settings.antiRaid === "on") 
      return reply(`${this.client.config.emojis.error} Anti-Raid mode is already active on that server.`);
      await automod.enableRaidMode(message.guild, message.author, reason)
      return reply(`${this.client.config.emojis.success} Anti-Raid mode enabled, any member that enters will be kicked.`);
    }
    else 
    {
      reply(`${this.client.config.emojis.success} Currently, the Anti-Raid system is \`${settings.isInRaidMode ? "ACTIVATED" : "DISABLED"}\`.\n\n\`${settings.prefix || this.client.config.prefix}raidmode ON\` - To activate Anti-Raid mode\n\`${settings.prefix || this.client.config.prefix}raidmode OFF\` - To disable Anti-Raid mode`)
    }
    });
  }
}

module.exports = RaidCmd