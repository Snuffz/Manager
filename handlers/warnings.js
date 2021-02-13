const mongoose = require("mongoose");
const Infractions = require("../models/infractions.js");
const Settings = require("../models/settings.js");
const config = require("../config.js");
const databaseUrl = config.dbUrl;
const logHandler = require("./serverLogger.js");

   const
   TempMuteManager = require("../models/managers/TempMuteManager"),
   FormatUtil = require("../utils/FormatUtil"),
   OtherUtil = require("../utils/OtherUtil"),
   TempBanManager = require("../models/managers/TempBanManager");

mongoose.connect(databaseUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true 
});

class warningHandler {
  static process (client, warnedMember, warnAuthor, guild, strikes, reason, msg) {
    const muteUser = async (client, member) => { 
      const guild = member.guild;
      if(!guild.members.cache.has(member.id)) 
      return;
      const role = guild.roles.cache.get(guild.settings.muteRole) || guild.roles.cache.find(r => r.name.toLowerCase() === "muted");
     if(!role) 
     return;
     if(!guild.me.permissions.has("MANAGE_ROLES")) 
     return;

member.send(msg+`\n${client.getEmoji("mute")} You have been **muted** from **${guild.name}**`).catch(e=>e);
TempMuteManager.setMute(guild, member.id, null);
try {
  await(member.roles.add(role.id, `${warnAuthor.tag}: ${reason}`));
} catch (e) {
  return console.log(e);
}
    }

    const tempBanUser = async (client, member, duration) => { 
      const guild = member.guild;
      if (!member.bannable) 
       return;
     if(guild.members.cache.has(member.id))
      member.send(msg+`\n${client.getEmoji("tempban")} You have been **tempbanned** for ${FormatUtil.msToTime(OtherUtil.parseTime(duration).asMilliseconds())} from **${guild.name}**`).catch(e=>e);
     try {
        await guild.members.ban(member.id, { reason: `${warnAuthor.tag} (${Math.floor(OtherUtil.parseTime(duration).asMinutes())}m): ${reason}`, days: 1 });
      } catch (e) {
        return;
      }
      TempBanManager.setBan(guild, member.id, Date.now()+OtherUtil.parseTime(duration));
    }

    const softBanUser = async (client, member) => { 
      const guild = member.guild;
      if(!guild.members.cache.has(member.id))
       return;
      if (!member.bannable) 
       return;
      member.send(msg+`\n${client.getEmoji("softban")} You have been **softbanned** from **${guild.name}**`).catch(e=>e);
        await guild.members.ban(member.id, { reason: `${warnAuthor.tag}: ${reason}`, days: 1 })
        .then(() => {
          guild.members.unban(member.id, `${client.user.tag}: Softban and Unban`);
        })
        .catch(()=>{});
    }

    const banUser = async (client, member) => { 
      if (!member.bannable)  return;
      member.send(msg+`\n${client.getEmoji("ban")} You have been **banned** from **${guild.name}**`).catch(e=>e);
      try {
        guild.members.ban(member.id, { reason: `${warnAuthor.tag}: ${reason}`, days: 1 });
      } catch (e) {
        return;
      }
    };

    const timeMuteUser = async (client, member, duration) => {
      const guild = member.guild;
      if(!guild.members.cache.has(member.id)) 
      return;
      const role = guild.roles.cache.get(guild.settings.muteRole) || guild.roles.cache.find(r => r.name.toLowerCase() === "muted");
      if(!role) 
      return;
if(!guild.me.permissions.has("MANAGE_ROLES")) return;
if(guild.settings.tempmutes.some(m => m.memberID === member.id && m.time==null))
  return;
 else if(guild.settings.tempmutes.some(m => m.memberID === member.id && m.time!=null))
 {
   const { time } = guild.settings.tempmutes.find(m => m.memberID === member.id);
   TempMuteManager.removeMute(guild, member.id);
   setTimeout(async () => {
   const j = {
    guildID: guild.id,
    time: time+OtherUtil.parseTime(duration).asMilliseconds(),
    memberID: member.id
  };
  guild.settings.tempmutes.push(j);
  await guild.settings.save().catch(e => console.error(e));
}, 700)
 }
 else TempMuteManager.setMute(guild, member.id, OtherUtil.parseTime(duration).asMilliseconds());

        member.send(msg+`\n${client.getEmoji("tempmute")} You have been **tempmuted** for ${FormatUtil.msToTime(OtherUtil.parseTime(duration).asMilliseconds())} from **${guild.name}**`).catch(e=>e);

  if(!TempMuteManager.isMuted(member)) {
    try {
      await(member.roles.add(role.id, `${warnAuthor.tag} (${Math.floor(OtherUtil.parseTime(duration).asMinutes())}m): ${reason}`));
    } catch (e) {
      return;
    }
  }
  };

    const kickUser = async (client, member) => {
      const guild = member.guild;
      if(!guild.members.cache.has(member.id)) 
      return;
      if (!member.kickable)  
      return;
      member.send(msg+`\n${client.getEmoji("kick")} You have been **kicked** from **${guild.name}**`)

      try {
        await member.kick(`${warnAuthor.tag}: ${reason}`);
      } catch (e) {
        return;
      }
    };

   Settings.findOne({
      guildID: guild.id
    }, async (err, settings) => {
      if (err) client.logger.log(err, "error");
      if(settings.punishments.length > 0) {
      Infractions.findOne({
        guildID: guild.id,
        userID: warnedMember.id
      }, async (errr, user) => {
        if (errr) client.logger.log(errr, "error");
        const punishment = settings.punishments.filter(p => p.nr === user.infractions);
        let instr;
        if(punishment.length==0 && user.infractions > Math.max(...settings.punishments.map(a => a.nr)))
      instr = settings.punishments.filter(a => a.nr === Math.max(...settings.punishments.map(a => a.nr))).map(a => a.action.split(/ +/))[0]; 
        else instr = punishment.map(p => p.action.split(/ +/))[0];
        if(!instr)
        return;
            if (instr[0] === "ban") await banUser(client, warnedMember);
            if (instr[0] === "kick") await kickUser(client, warnedMember);
            if (instr[0] === "mute") await muteUser(client, warnedMember);
            if(instr[0] === "tempmute") await timeMuteUser(client, warnedMember, instr.slice(1).join(" "));
            if (instr[0] === "softban") await softBanUser(client, warnedMember);
            if(instr[0] === "tempban") await tempBanUser(client, warnedMember, instr.slice(1).join(" "));
            if (instr[0] === "ban") {
              const Logger1 = new logHandler({ client: client, case: "banAdd", guild: guild.id, member: warnedMember.user, moderator: warnAuthor, reason: `[${strikes} strikes] ${reason}` });;
                 Logger1.send().then(t => Logger1.kill());
             }
            if (instr[0] === "kick") {
              const Logger2 = new logHandler({ client: client, case: "kickAdd", guild: guild.id, member: warnedMember.user, moderator: warnAuthor, reason: `[${strikes}] ${reason}` });;
              Logger2.send().then(t => Logger2.kill());
            }
            if (instr[0] === "mute") {
              const Logger3 = new logHandler({ client: client, case: "muteAdd", guild: guild.id, member: warnedMember.user, moderator: warnAuthor, reason: `[${strikes} strikes] ${reason}` });;
              Logger3.send().then(t => Logger3.kill());
             }
             if (instr[0] === "tempmute") {
              const Logger4 = new logHandler({ client: client, case: "muteTimeAdd", guild: guild.id, member: warnedMember.user, moderator: warnAuthor, reason: `[${strikes} strikes] ${reason}`, duration: OtherUtil.parseTime(instr.slice(1).join(" ")).asMilliseconds() });;
              Logger4.send().then(t => Logger4.kill());
             }
             if (instr[0] === "softban") {
              const Logger5 = new logHandler({ client: client, case: "softbanAdd", guild: guild.id, member: warnedMember.user, moderator: warnAuthor, reason: `[${strikes} strikes] ${reason}` });;
              Logger5.send().then(t => Logger5.kill());
             }
             if (instr[0] === "tempban") {
              const Logger6 = new logHandler({ client: client, case: "banTimeAdd", guild: guild.id, member: warnedMember.user, moderator: warnAuthor, reason: `[${strikes} strikes] ${reason}`, duration: OtherUtil.parseTime(instr.slice(1).join(" ")).asMilliseconds() });;
                 Logger6.send().then(t => Logger6.kill());
             }
      })
      }
    })
  }
}

module.exports = warningHandler;