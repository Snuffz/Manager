const 
Settings = require("../models/settings.js"),
tempslowmodes = require("../models/managers/TempSlowmodeManager"),
moment = require("moment-timezone");

const MINUS = "\u2796"; // ➖
const LINESTART = "\u25AB"; // ▫
module.exports = class {
 constructor (client) {
   this.client = client;
 }

 async run (channel) {
   const settings = await Settings.findOne({ guildID: channel.guild.id });
   if (!settings) return;
   if(settings.slowmodes.some(c => c.channelID === channel.id))
     tempslowmodes.clearSlowmode(channel);
const tc = this.client.channels.cache.get(settings.serverLog);
   if(!tc) 
   return;
  const date = moment(Date.now()).tz(settings.timezone).format("hh:mm:ss");
   tc.send(`\`[${date}]\`
${MINUS} Channel ${channel.type=="text" ? "#" : ""}${channel.name} (${channel.id}) was deleted.
**${LINESTART}Type:** ${channel.type}
${channel.parent ? `**${LINESTART}Parent:** ${channel.parent} (${channel.parent.id})` : ""}`, { disableMentions: "all" }).catch(()=>{});
}
}