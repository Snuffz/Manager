const Discord = require("discord.js");
 const Settings = require("../models/settings.js");
const automod = require("../handlers/automod.js");
const moment = require("moment-timezone");

const
FormatUtil = require("../utils/FormatUtil");

const EDIT = "\u2712\ufe0f"; // ✒️
const LINESTART = "\u25AB"; // ▫

module.exports = class {
  constructor (client) {
    this.client = client;
  }

  async run (oldMessage, newMessage) {
    if(!newMessage.author) return;
    if (newMessage.author.bot) return;
    
    const settings = await Settings.findOne({ guildID: oldMessage.guild.id });

    if (newMessage.guild && this.client.permlevel(newMessage) < 2) {
      if (newMessage.member && !settings.ignoredUsers.includes(newMessage.author.id)) {
        if (!settings.ignoredChannels.includes(newMessage.channel.id)) {
          if (!newMessage.member.roles.cache.some(r=>settings.ignoredRoles.includes(r.id))) {
            automod.run(this.client, newMessage, settings);
          }
        }
      }
    }
    const tc = this.client.channels.cache.get(settings.messageLog);
    if(!tc || tc.id === newMessage.channel.id)
    return;
    if (oldMessage.content === newMessage.content) 
    return;
    const date = moment(Date.now()).tz(settings.timezone).format("hh:mm:ss");
    tc.send({ content:`\`[${date}]\`
${EDIT} A message by ${FormatUtil.formatFullUser(oldMessage.author)} was edited.
${LINESTART} Channel: ${newMessage.channel.toString()}`, 
embed: new Discord.MessageEmbed()
.setDescription(`[Go to Message](${newMessage.url})`)
.addField('From:', `${oldMessage.content}
${oldMessage.attachments.size>0 ? oldMessage.attachments.first().url : ""}`)
.addField('To:', `${newMessage.content}
${newMessage.attachments.size>0 ? newMessage.attachments.first().url : ""}`)
.setColor('FFFF00'),
disableMentions: "all" }).catch(()=>{})
  }
};
