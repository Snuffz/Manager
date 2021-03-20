const
Settings = require("../models/settings.js"),
FormatUtil = require("../utils/FormatUtil"),
moment = require("moment-timezone");

const BOOST = "\ud83d\udc8e"; // 💎
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
        if(!tc)
        return;
        const date = moment(Date.now()).tz(settings.timezone).format("hh:mm:ss");
         tc.send(`\`[${date}]\`
${BOOST} ${FormatUtil.formatFullUser(member.user)} boosted the server.
${LINESTART}Boosters: **${member.guild.premiumSubscriptionCount}**
${LINESTART}Level: **${member.guild.premiumTier}**`, { disableMentions: "all" }).catch(() => {});
    }
}