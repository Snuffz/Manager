const 
Settings = require("../models/settings.js"),
Constants = require("../config.js"),
{ MessageEmbed } = require("discord.js"),
FormatUtil = require("../utils/FormatUtil"),
moment = require("moment-timezone");

const NEW = "\ud83c\udd95"; // 🆕
const LINESTART = "\u25AB"; // ▫

module.exports = class {
  constructor (client) {
    this.client = client;
  }

  async run (guild) {
    if(!guild.name)
    return;
    setTimeout(async () => { await leavePointlessGuilds() }, 300000);
const tc = this.client.channels.cache.get(this.client.config.logsChannel);
if(!tc)
return;
const date = moment(Date.now()).tz("America/New_York").format("hh:mm:ss");
    const eb = new MessageEmbed()
      .setThumbnail(guild.iconURL({ format: 'png', dynamic: true, size: 1024 }))
      .setDescription(`
${LINESTART} ID: **${guild.id}**
${LINESTART} Owner: ${FormatUtil.formatFullUser(guild.owner.user)}
${LINESTART} Numbers of Members: **${guild.memberCount}**
${LINESTART} Create At: **${guild.createdAt.toUTCString()}** (${FormatUtil.msToTimeCompact(Date.now()-guild.createdTimestamp)} ago)

${LINESTART} Number of Servers Currently: **${this.client.guilds.cache.size}**
      `)
      .setColor(this.client.config.color)
    tc.send({content:`\`[${date}]\`
${NEW} I logged into the server **${guild.name}**:`,embed: eb, disableMentions: "all" });
  }
}

function leavePointlessGuilds()
{
  this.client.guilds.cache.filter(async g => 
    {
      if(!g.ownerID)
        return false;
      if(Constants.OWNER_ID==g.ownerID)
        return false;
      const settings = await Settings.findOne({ guildID: g.id });
      const botcount = g.members.cache.filter(m => m.user.bot).size;
      const totalcount = g.members.cache.size;
      const humancount = totalcount - botcount;
      if(humancount < 15 || botcount > humancount)
      {
     if(settings)
       return false;
       return true;
      }
    return false;
    }).forEach(g => 
      {
        if(g.owner)
        {
          g.owner.send(`${this.client.config.emojis.error} Your server **${g.name}** does not have the basic requirements to have me, it has very few members. The minimum is 15.`)
          .then(() => g.leave())
          .catch(() => g.leave());
        }
      })
}