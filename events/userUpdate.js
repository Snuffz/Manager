const Settings = require("../models/settings.js");
 const { createCanvas, loadImage } = require("canvas");
 const checkLinks = require('check-links');
 const { MessageAttachment } = require("discord.js");
 const moment = require("moment-timezone");

    const
    OtherUtil = require("../utils/OtherUtil"),
    FormatUtil = require("../utils/FormatUtil");

    const USERNAME = "\ud83d\udcdb"; // 📛
    const AVATAR = "\ud83d\uddbc\ufe0f"; // 🖼️

module.exports = class {
  constructor (client) {
    this.client = client;
  }

  async run (oldUser,newUser) {
    if(oldUser.bot) return
    if(newUser.bot) return
    

    this.client.guilds.cache.filter(a => a.members.cache.has(newUser.id)).forEach(async g => {
        const settings = await Settings.findOne({ guildID: g.id });
        if(!settings)
        return;
        const date = moment(Date.now()).tz(settings.timezone).format("hh:mm:ss");
        if (oldUser.tag !== newUser.tag) {
          if(oldUser.bot) 
          return;
          const member = g.members.cache.get(oldUser.id);
          if(member && settings.hoistCharacters.includes(member.displayName.substr(0,1)))
          OtherUtil.dehoist(member, member.displayName.substr(0,1));
       const tc = g.channels.cache.get(settings.serverLog);
       if(!tc)
       return;

      tc.send(`\`[${date}]\`
${USERNAME} ${FormatUtil.formatFullUser(oldUser)} has changed usernames to ${FormatUtil.formatUser(newUser)}`, { disableMentions: "all" }).catch(()=>{})
        }

        if(oldUser.avatar !== newUser.avatar) {
          const tc = this.client.channels.cache.get(settings.avatarLog);
          if(!tc)
          return;
          const imgOld = await oldUser.displayAvatarURL({ format: 'png' })
          const imgNew = await newUser.displayAvatarURL({ format: 'png' })
  
          const results = await checkLinks([imgOld, imgNew])
            if(results[imgOld].statusCode === 404 || results[imgNew].statusCode === 404) 
            return;
            const canvas = createCanvas(260, 130);
            const ctx = canvas.getContext("2d");
            ctx.beginPath();
            const avatar = await loadImage(imgOld);
            ctx.drawImage(avatar, 0,0,130,130);
            const avatar2 = await loadImage(imgNew);
            ctx.drawImage(avatar2, 130,0,130,130);
            const attachment = new MessageAttachment(canvas.toBuffer(),"newImage.png");

      tc.send({ files: [attachment], 
        content: `\`[${date}]\`
${AVATAR} ${FormatUtil.formatFullUser(newUser)} has changed avatars ${newUser.avatar && newUser.avatar.startsWith("a_") ? "<:gif:806644461781647382>" : ""}:`,
 disableMentions: "all" }).catch(()=>{})

           
        }
      })
    }
  }