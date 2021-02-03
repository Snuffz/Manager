const 
{ MessageEmbed } = require("discord.js"),
moment = require("moment-timezone"),
Settings = require("../models/settings.js");

const PINNED = "\ud83d\udccc"; // 📌

module.exports = class {
    constructor (client) {
      this.client = client;
    }
  
    async run (message) {
if(!message.author) return;
 const settings = await Settings.findOne({ guildID: message.guild.id });
 if (!settings) 
 return;
 const tc = this.client.channels.cache.get(settings.messageLog);
 if(!tc || tc.id === message.channel.id)
 return;
 const date = moment(Date.now()).tz(settings.timezone).format("hh:mm:ss");
tc.send({ content:`\`[${date}]\`
${PINNED} Message pinned to the channel ${message.channel.toString()}`,
embed: new MessageEmbed()
.setDescription(message.attachments.size>0 ? `${message.content}\n${message.attachments.first().url}` : message.content)
.setColor("F1948A"),
disableMentions: "all" }).catch(()=>{})
    }
}