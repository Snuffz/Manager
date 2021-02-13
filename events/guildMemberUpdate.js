const 
OtherUtil = require("../utils/OtherUtil"),
FormatUtil = require("../utils/FormatUtil"),
moment = require('moment-timezone'),
TempMuteManager = require("../models/managers/TempMuteManager"),
Settings = require("../models/settings.js"),
logHandler = require("../handlers/serverLogger.js");

const NICKNAME = "\ud83d\uded1"; // 🛑
const ROLE = "\ud83d\udca0"; // 💠

module.exports = class {
  constructor (client) {
    this.client = client;
  }

  async run (oldMember,newMember) {
    const settings = await Settings.findOne({ guildID: oldMember.guild.id });
     if(!settings) 
     return;
    if(oldMember.user.bot) return
    const date = moment(Date.now()).tz(settings.timezone).format("hh:mm:ss");
    if (oldMember.nickname !== newMember.nickname){
     if(settings.hoistCharacters.includes(newMember.displayName.substr(0,1)))
     OtherUtil.dehoist(newMember, newMember.displayName.substr(0,1));
     const tc = this.client.channels.cache.get(settings.serverLog);
     if (!tc) 
     return;
tc.send(`\`[${date}]\`
${NICKNAME} ${oldMember.displayName} (${newMember.id}) has changed nicknames to ${newMember.displayName}`, { disableMentions: "all" }).catch(() => {});
  }
  const tc = this.client.channels.cache.get(settings.modLogsChannel);
  if(oldMember.guild.me.permissions.has("VIEW_AUDIT_LOG"))
  {
  const entry = await oldMember.guild.fetchAuditLogs({
    type: 'MEMBER_ROLE_UPDATE'
  }).then(audit => audit.entries.first());
  if(!entry || !entry.executor)
  return;
   const { executor } = entry;
   if(executor.id === this.client.user.id)
   return;
}
  if (oldMember.roles.cache.size !== newMember.roles.cache.size) 
  {
     if(newMember.roles.cache.size > oldMember.roles.cache.size)
     {
      if(oldMember.guild.me.permissions.has("VIEW_AUDIT_LOG") && newMember.roles.cache.map(a => a.id).filter(a => !oldMember.roles.cache.map(a => a.id).includes(a))[0] == settings.muteRole || newMember.guild.roles.cache.some(r => r.name.toLowerCase() === "muted") && newMember.roles.cache.map(a => a.id).filter(a => !oldMember.roles.cache.map(a => a.id).includes(a))[0] === newMember.guild.roles.cache.find(r => r.name.toLowerCase() === "muted").id)
      {  
        if(!tc)
        return;
        const entry = await oldMember.guild.fetchAuditLogs({
          type: 'MEMBER_ROLE_UPDATE'
        }).then(audit => audit.entries.first());
        if(!entry.executor)
        return;
         const { executor, reason } = entry;
          const Logger = new logHandler({ client: this.client, case: "muteAdd", guild: oldMember.guild.id, member: oldMember.user, moderator: executor, reason: reason || '[no reason specified]' });
          Logger.send().then(() => Logger.kill());
      } else {
        const serverTc = this.client.channels.cache.get(settings.serverLog);
          if(!serverTc)
          return;
          const newRole = newMember.guild.roles.cache.get(newMember.roles.cache.map(a => a.id).filter(a => !oldMember.roles.cache.map(a => a.id).includes(a))[0]);
          serverTc.send(`\`[${date}]\`
${ROLE} ${FormatUtil.formatFullUser(newMember.user)} had an added role \`${newRole.name}\` (${newRole.id})`, { disableMentions: "all" }).catch(()=>{});
      }
    }else if(newMember.roles.cache.size < oldMember.roles.cache.size)
    {
     if(oldMember.guild.me.permissions.has("VIEW_AUDIT_LOG") && oldMember.roles.cache.map(a => a.id).filter(a => !newMember.roles.cache.map(a => a.id).includes(a))[0] == settings.muteRole || oldMember.guild.roles.cache.some(r => r.name.toLowerCase() === "muted") && oldMember.roles.cache.map(a => a.id).filter(a => !newMember.roles.cache.map(a => a.id).includes(a))[0] === oldMember.guild.roles.cache.find(r => r.name.toLowerCase() === "muted").id)
     {
      TempMuteManager.removeMute(newMember.guild, newMember.id);
      if(!tc)
      return;
      const entry = await oldMember.guild.fetchAuditLogs({
        type: 'MEMBER_ROLE_UPDATE'
      }).then(audit => audit.entries.first());
      if(!entry.executor)
        return;
       const { executor, reason } = entry;
        const Logger = new logHandler({ client: this.client, case: "muteRemove", guild: oldMember.guild.id, member: oldMember.user, moderator: executor, reason: reason || '[no reason specified]' });
        Logger.send().then(() => Logger.kill());
} else
{
  const serverTc = this.client.channels.cache.get(settings.serverLog);
  if(!serverTc)
  return;
  const oldRole = newMember.guild.roles.cache.get(oldMember.roles.cache.map(a => a.id).filter(a => !newMember.roles.cache.map(a => a.id).includes(a))[0]);
  serverTc.send(`\`[${date}]\`
${ROLE} ${FormatUtil.formatFullUser(newMember.user)} had an removed role \`${oldRole.name}\` (${oldRole.id})`, { disableMentions: "all" }).catch(()=>{});

  }
}
  }
}
}