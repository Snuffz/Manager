const 
OtherUtil = require("../utils/OtherUtil"),
FormatUtil = require("../utils/FormatUtil"),
moment = require('moment-timezone'),
Settings = require("../models/settings.js"),
logHandler = require("../handlers/serverLogger.js");

const JOIN = "\ud83d\udce5"; // 📥
const LINESTART = "\u25AB"; // ▫

module.exports = class {
  constructor (client) {
    this.client = client;
  }

  async run (member) {
    const settings = await Settings.findOne({ guildID: member.guild.id });
    if (!settings) 
    return;
    if(settings.antiRaid == 'on')
     {
      member.send(`Anti-Raid mode is active on the server **${member.guild.name}**. Try again later.`).catch(()=>{})
      try 
      {
        await member.kick('Anti-Raid mode');
        if (member.guild.channels.cache.has(settings.modLogsChannel)) {
          const Logger = new logHandler({ client: this.client, case: "kickAdd", guild: member.guild.id, member: member.user, moderator: this.client.user, reason: "Anti-Raid mode" });
          Logger.send().then(() => Logger.kill());
        }
      } 
      catch (e) {}
      return;
    }
    if(settings.tempmutes.some(m => m.memberID === member.id))
    {
      if(member.guild.roles.cache.has(settings.muteRole))
      {
        member.roles.add(settings.muteRole, "Automatic Mute");
      }
    }
    if(settings.hoistCharacters.includes(member.displayName.substr(0,1)))
    OtherUtil.dehoist(member, member.displayName.substr(0,1));
    const tc = this.client.channels.cache.get(settings.serverLog);
   if(!tc) 
   return;
  const date = moment(Date.now()).tz(settings.timezone).format("hh:mm:ss");
    tc.send(`\`[${date}]\`
${JOIN} ${FormatUtil.formatFullUser(member.user)} joined the server.
${LINESTART} Account Creation: **${member.user.createdAt.toUTCString()()}** (${FormatUtil.msToTimeCompact(Date.now() - member.user.createdTimestamp)} ago)`, { disableMentions: 'all' }).catch(()=>{});
}
}