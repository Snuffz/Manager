const
Settings = require("../models/settings.js"),
moment = require("moment-timezone");

 const ROLE_DELETE = "\u2668\ufe0f"; // ♨️

module.exports = class {
  constructor (client) {
    this.client = client;
  }

  async run (role) {
    const settings = await Settings.findOne({ guildID: role.guild.id });
    if (!settings) 
    return;
       const tc = this.client.channels.cache.get(settings.serverLog);
       if(!tc)
        return;
       const date = moment(Date.now()).tz(settings.timezone).format("hh:mm:ss");
          tc.send(`\`[${date}]\`
${ROLE_DELETE} Role ${role.name} (${role.id}) deleted.`, { disableMentions: "all" }).catch(()=>{})
  }
}
