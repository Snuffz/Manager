const
FormatUtil = require("../utils/FormatUtil"),
Settings = require("../models/settings.js"),
moment = require("moment-timezone");

const VOICE_MUTE = "\ud83d\udd08"; // 🔈

module.exports = class {
    constructor (client) {
      this.client = client;
    }
  
    async run (member, oldMuteType, muteType) {
  if(member.user.bot) 
  return;
        const settings = await Settings.findOne({ guildID: member.guild.id });
        if (!settings)
         return;
         const tc = this.client.channels.cache.get(settings.voiceLog);
        if(!tc)
        return;
        const date = moment(Date.now()).tz(settings.timezone).format("hh:mm:ss");
if(oldMuteType === 'server-muted')
{
tc.send(`\`[${date}]\`
${VOICE_MUTE} ${FormatUtil.formatFullUser(member.user)} server muted.`, { disableMentions: "all" }).catch(()=>{});
}
}
}