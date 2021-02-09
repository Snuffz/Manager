const 
Settings = require("../models/settings.js"),
moment = require("moment-timezone"),
FormatUtil = require("../utils/FormatUtil");

const STREAM_STOP = "\u26aa"; // ⚪
const LINESTART = "\u25AB"; // ▫

module.exports = class {
    constructor (client) {
      this.client = client;
    }
    async run (member, voiceChannel) {
      if(member.user.bot)
      return;
       const settings = await Settings.findOne({ guildID: member.guild.id });
       if(!settings)
       return;
       const tc = this.client.channels.cache.get(settings.voiceLog);
       if(!tc)
       return;
       const date = moment(Date.now()).tz(settings.timezone).format("hh:mm:ss");
          tc.send(`\`[${date}]\`
${STREAM_STOP} ${FormatUtil.formatFullUser(member.user)} stopped stream.
${LINESTART} Channel: _${voiceChannel}_`, { disableMentions: "all" }).catch(() => {})
          
    }
}