const 
Settings = require("../models/settings.js"),
moment = require("moment-timezone");

const PAINT = "\ud83d\udd8c\ufe0f"; // 🖌️

module.exports = class {
  constructor (client) {
    this.client = client;
  }

  async run (oldChannel,newChannel) {
    if(!oldChannel.guild) 
    return;
    if(!newChannel.guild) 
    return;
    if(oldChannel.name == newChannel.name)
    return;
    const settings = await Settings.findOne({ guildID: newChannel.guild.id });
     if (!settings) return;
     const tc = this.client.channels.cache.get(settings.serverLog);
     if(!tc) 
     return;
    const date = moment(Date.now()).tz(settings.timezone).format("hh:mm:ss");
   tc.send(`\`[${date}]\`
${PAINT} Channel ${newChannel.type=="text" ? "#" : ""}${newChannel.name} (${newChannel.id}) was updated to ${oldChannel.type=="text" ? "#" : ""}${oldChannel.name}`, { disableMentions: "all" }).catch(()=>{}); 
}
}