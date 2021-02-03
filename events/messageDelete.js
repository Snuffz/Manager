const 
{ MessageEmbed } = require("discord.js"),
FormatUtil = require("../utils/FormatUtil"),
moment = require("moment-timezone"),
Settings = require("../models/settings.js");

 const DELETED = "\u274c"; // ❌

module.exports = class {
  constructor (client) {
    this.client = client;
  }

  async run (message) {
    if(!message.author) return;
    if(message.author.bot) return;
    const settings = await Settings.findOne({ guildID: message.guild.id });
    const tc = this.client.channels.cache.get(settings.messageLog);
    if(!tc || tc.id === message.channel.id)
    return;
    const date = moment(Date.now()).tz(settings.timezone).format("hh:mm:ss");
 tc.send({ content: `\`[${date}]\`
${DELETED} A message by ${FormatUtil.formatFullUser(message.author)} was deleted in ${message.channel.toString()}.`,
embed: new MessageEmbed()
.setDescription(`${message.content}
${message.attachments.size>0 ? message.attachments.first().url : ""}`)
.setColor("B22222"),
disableMentions: "all" }).catch(()=>{})
  }
};