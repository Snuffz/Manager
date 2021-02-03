const
FormatUtil = require("../utils/FormatUtil"),
Settings = require("../models/settings.js"),
moment = require("moment-timezone");

const VOICE_UNMUTE = "\ud83d\udde3\ufe0f"; // 🗣️

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
${VOICE_UNMUTE} ${FormatUtil.formatFullUser(member.user)} server unmuted.`, { disableMentions: "all" }).catch(() => {});
    }
}
}