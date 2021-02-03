const
Settings = require("../models/settings.js"),
FormatUtil = require("../utils/FormatUtil"),
logHandler = require("../handlers/serverLogger.js"),
moment = require("moment-timezone");

const LEAVE = "\ud83d\udce4"; // 📤
const LINESTART = "\u25AB"; // ▫

module.exports = class {
  constructor (client) {
    this.client = client;
  }

  async run (member) {
    const settings = await Settings.findOne({ guildID: member.guild.id });
    if (!settings) 
    return;
    const tc = this.client.channels.cache.get(settings.serverLog);
    const date = moment(Date.now()).tz(settings.timezone).format("hh:mm:ss");
    if(tc) 
    {
      tc.send(`\`[${date}]\`
${LEAVE} ${FormatUtil.formatFullUser(member.user)} left the server.
${LINESTART} Guild Join Date: **${member.joinedAt.toUTCString()()}** (${FormatUtil.msToTimeCompact(Date.now() - member.joinedTimestamp)} ago)
${member.roles.cache.size>1 ? `${LINESTART} Roles: ${member.roles.cache.filter(a => a.id!==member.guild.id).map(a => `\`${a.name}\``).join(", ")}` : ""}`, { disableMentions: "all" }).catch(() => {});
    }
  if(!member.guild.me.permissions.has("VIEW_AUDIT_LOG")) return;
    const entry = await member.guild.fetchAuditLogs({
      type: 'MEMBER_KICK'
    }).then(audit => audit.entries.first())
    if(!entry) 
    return;
    const { executor, reason, target, createdTimestamp} = entry;
    if(createdTimestamp !== Date.now())
    return;
    if(member.id !== target.id || executor.id === this.client.user.id)
    return;
  if(member.guild.channels.cache.has(settings.modLogsChannel))
  {
    const Logger = new logHandler({ client: this.client, case: "kickAdd", guild: member.guild.id, member: target, moderator: executor, reason: reason || "[no reason specified]" });
    Logger.send().then(() => Logger.kill());
  }
    }
}