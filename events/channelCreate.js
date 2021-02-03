const 
Settings = require("../models/settings.js"),
moment = require("moment-timezone");

const MORE = "\u2795"; // ➕
const LINESTART = "\u25AB"; // ▫

module.exports = class {
 constructor (client) {
   this.client = client;
 }

 async run (channel) {
   if(!channel.guild)
   return;
   const settings = await Settings.findOne({ guildID: channel.guild.id });
   if (!settings) return;
   const tc = this.client.channels.cache.get(settings.serverLog);
   if(!tc) 
   return;
  const date = moment(Date.now()).tz(settings.timezone).format("hh:mm:ss");
   tc.send(`\`[${date}]\`
${MORE} Channel ${channel} (${channel.id}) was created.
**${LINESTART} Type:** ${channel.type}
${channel.parent ? `**${LINESTART} Parent:** ${channel.parent} (${channel.parent.id})` : ""}`, { disableMentions: "all" }).catch(()=>{});
}
}