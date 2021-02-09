const
FormatUtil = require("../utils/FormatUtil"),
Settings = require("../models/settings.js"),
moment = require("moment-timezone")

const LEAVE_VOICE = "\ud83d\udd34"; // 🔴
const JOIN_VOICE = "\ud83d\udfe2"; // 🟢

module.exports = class {
 constructor (client) {
   this.client = client;
 }

 async run (oldMember, newMember) {
   const settings = await Settings.findOne({ guildID: oldMember.guild.id });
   if (!settings) 
   return;
   if(oldMember && oldMember.id === this.client.user.id && !newMember.channel)
     {
       if(settings.voicemove===true)
       {
        oldMember.channel.join();
       }
     }
   const tc = this.client.channels.cache.get(settings.voiceLog);
   if(!tc)
   return;
   const date = moment(Date.now()).tz(settings.timezone).format("hh:mm:ss");
    if (oldMember && newMember && oldMember.channel && newMember.channel && oldMember.channel.id === newMember.channel.id) return;
    if (oldMember.channel){
     const user = this.client.users.cache.get(oldMember.id);
    tc.send(`\`[${date}]\`
${LEAVE_VOICE} ${FormatUtil.formatFullUser(user)} left _${oldMember.channel}_`, { disableMentions: "all" }).catch(() => {});
   }else if (newMember.channel)
   {
    const user = this.client.users.cache.get(newMember.id);
    tc.send(`\`[${date}]\`
${JOIN_VOICE} ${FormatUtil.formatFullUser(user)} joined _${newMember.channel}_`, { disableMentions: "all" }).catch(() => {});  
   }   
 }
} 