const 
Settings = require("../models/settings.js"),
moment = require("moment-timezone"),
FormatUtil = require("../utils/FormatUtil");

const STREAM_START = "\u26ab"; // ⚫
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
${STREAM_START} ${FormatUtil.formatFullUser(member.user)} started stream.
${LINESTART} Channel: **${voiceChannel}** (${voiceChannel.id})`, { disableMentions: "all" }).catch(()=>{});
    }
}