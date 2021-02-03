const
Settings = require("../models/settings.js"),
logHandler = require("../handlers/serverLogger.js");

module.exports = class {
  constructor (client) {
    this.client = client;
  }

  async run (guild, user) {
    const settings = await Settings.findOne({ guildID: guild.id });
    if (!settings) 
    return;
   if(!guild.channels.cache.has(settings.modLogsChannel))
   return;
if(!guild.me.hasPermission("VIEW_AUDIT_LOG")) return;
    const entry = await guild.fetchAuditLogs({
      type: 'MEMBER_BAN_ADD'
    }).then(audit => audit.entries.first())
    const { executor, reason, target } = entry;
      if(this.client.user.id === executor.id) return;
      const Logger = new logHandler({ client: this.client, case: "banAdd", guild: guild.id, member: target, moderator: executor, reason: reason || "[no reason specified]" });
      Logger.send().then(() => Logger.kill());
  }
}