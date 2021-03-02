const 
Settings = require("../models/settings.js"),
{ MessageEmbed } = require("discord.js"),
FormatUtil = require("../utils/FormatUtil"),
moment = require("moment-timezone");

const LINESTART = "\u25AB"; // ▫

module.exports = class {
  constructor (client) {
    this.client = client;
  }

  async run (guild) {
    if(!guild.name)
    return;

 const tc = this.client.channels.cache.get(this.client.config.logsChannel);
 if(!tc)
 return;
    const eb = new MessageEmbed()
    .setThumbnail(guild.iconURL({ format: 'png', dynamic: true, size: 1024 }))
    .setDescription(`
${LINESTART} ID: **${guild.id}**
${LINESTART} Owner: ${FormatUtil.formatFullUser(guild.owner.user)}
${LINESTART} Numbers of Members: **${guild.memberCount}**
${LINESTART} Create At: **${guild.createdAt.toUTCString()}** (${FormatUtil.msToTimeCompact(Date.now()-guild.createdTimestamp)} ago) 

${LINESTART} Number of Servers Currently: **${this.client.guilds.cache.size}**
      `)
      .setColor("RED")
    tc.send({ content:`I left a server **${guild.name}**:`, embed: eb, disableMentions: "all" }).catch(()=>{});
  }
};
