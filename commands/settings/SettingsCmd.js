const
{ MessageEmbed } = require("discord.js"),
Command = require("../../base/Command.js"),
GuildSettingsDataManager = require("../../models/managers/GuildSettingsDataManager"),
AutomodManager = require("../../models/managers/AutomodManager"),
FilterManager = require("../../models/managers/FilterManager"),
PremiumManager = require("../../models/managers/PremiumManager"),
PunishmentManager = require("../../models/managers/PunishmentManager");

class SettingsCmd extends Command {
  constructor (client) {
    super(client, {
      name: "settings",
      description: "view all settings of server",
      category: "Settings",
      guildOnly: true,
      botPermissions: ['EMBED_LINKS'],
      userPermissions: ['MANAGE_GUILD']
    });
  }

  async run (message, args, reply) { 
message.channel.send({ content: `Settings for **${message.guild.name}**:`,
embed: new MessageEmbed()
.addField("\u2699\ufe0f Server Settings:", GuildSettingsDataManager.getSettingsDisplay(message.guild), true) // ⚙️
.addField(`${this.client.getEmoji("strike")} Punishments`, PunishmentManager.getAllPunishmentsDisplay(message.guild.settings.punishments), true)
.addField("\ud83d\udee1\ufe0f Automod:", AutomodManager.getSettingsDisplay(message.guild), true)
.addField("\ud83d\udeb7 Filters", FilterManager.getFiltersDisplay(message.guild), true)
.setColor(message.guild.me.roles.cache.filter(a=>a.color>0).sort((a,b) => a.position-b.position).map(a =>a.color).reverse()[0]||"")
.setFooter((await PremiumManager.getFooterString(message.guild)))
.setTimestamp((await PremiumManager.getTimestamp(message.guild))),
disableMentions: "all"
})
  }
}
module.exports = SettingsCmd
