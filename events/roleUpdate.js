const Discord = require("discord.js"),
moment = require("moment-timezone"),
Settings = require("../models/settings.js");

 const PAINT = "\ud83d\udd8c\ufe0f"; // 🖌️
 const ROLE_UPDATE = "\ud83c\udfa8"; // 🎨

module.exports = class {
  constructor (client) {
    this.client = client;
  }

  async run (oldRole,newRole) {
    const settings = await Settings.findOne({ guildID: oldRole.guild.id });
    if (!settings) 
    return;
    const tc = this.client.channels.cache.get(settings.serverLog);
    if(!tc)
    return;
if (newRole.name === oldRole.name && oldRole.hexColor === newRole.hexColor) return;
const date = moment(Date.now()).tz(settings.timezone).format("hh:mm:ss");
  if (newRole.name !== oldRole.name)
   {
    tc.send(`\`[${date}]\`
${PAINT} Role **${oldRole.name}** (${oldRole.id}) changed names to **${newRole.name}**`, { disableMentions: "all" }).catch(e => {})
  }
  else if (oldRole.hexColor !== newRole.hexColor)
  {
    tc.send({content:`\`[${date}]\`
${ROLE_UPDATE} Role **${newRole.name}** (${newRole.id}) changed color:`,
 embed: new Discord.MessageEmbed()
.addField("Before:",oldRole.hexColor)
.addField("After:",newRole.hexColor)
.setColor(newRole.hexColor),
disableMentions: "all" }).catch(()=>{})
  }
}
}