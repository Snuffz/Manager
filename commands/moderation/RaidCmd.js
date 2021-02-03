const Command = require("../../base/Command.js");
const Settings = require("../../models/settings.js");
const logHandler = require("../../handlers/serverLogger.js");

class RaidCmd extends Command {
  constructor (client) {
    super(client, {
      name: "raidmode",
      description: "enable/disable anti-raid mode",
      category: "Automod",
      usage: "[ON|OFF] [reason]",
      guildOnly: true,
      aliases: ["autoraid","autoantiraid","autoantiraidmode"],
      botPermissions: ['MANAGE_GUILD', 'KICK_MEMBERS'],
      userPermissions: ['MANAGE_GUILD', 'KICK_MEMBERS']
    });
  }

  async run (message, args, reply) {
    Settings.findOne({
      guildID: message.guild.id
    }, async (err, settings) => {
      if (err) this.client.logger.log(err, "error");

    const active = args.length > 0 ? args[0].toLowerCase() : settings.antiRaid,
    reason = args.slice(1).join(" ") || "[no reason specified]";

    if(["off","stop","disable"].includes(active))
    {
      if (settings.antiRaid === "off")
       return reply(`${this.client.config.emojis.error} Anti-Raid mode is already disabled on this server.`);
        settings.antiRaid = "off";
        await settings.save().catch(e => this.client.logger.log(e, "error"));
        if (message.guild.channels.cache.has(settings.modLogsChannel)) {
            const Logger = new logHandler({ client: this.client, case: "lockdownOff", guild: message.guild.id, moderator: message.author, reason: reason });
            Logger.send().then(() => Logger.kill());
          } 
          return reply(`${this.client.config.emojis.success} Anti-Raid mode has been disabled.`)
    }
    else if (["on","start","enable"].includes(active))
    {
      if (settings.antiRaid === "on") 
      return reply(`${this.client.config.emojis.error} Anti-Raid mode is already active on that server.`);
      settings.antiRaid = "on";
      await settings.save().catch(e => this.client.logger.log(e, "error"));
      if (message.guild.channels.cache.has(settings.modLogsChannel)) {
          const Logger = new logHandler({ client: this.client, case: "lockdownOn", guild: message.guild.id, moderator: message.author, reason: reason });
          Logger.send().then(() => Logger.kill());
        } 
      return reply(`${this.client.config.emojis.success} Anti-Raid mode enabled, any member that enters will be kicked.`);
    }
    else 
    {
      reply(`${this.client.config.emojis.success} Currently, the Anti-Raid system is \`${settings.antiRaid == "on" ? "ACTIVATED" : "DISABLED"}\`.\n\n\`${settings.prefix || this.client.config.prefix}raidmode ON\` - To activate Anti-Raid mode\n\`${settings.prefix || this.client.config.prefix}raidmode OFF\` - To disable Anti-Raid mode`)
    }
    });
  }
}

module.exports = RaidCmd;