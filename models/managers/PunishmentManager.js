const config = require("../../config.js");
const strike = "\ud83d\udea9"; // 🚩

module.exports.MAX_STRIKES = 100;
module.exports.DEFAULT_SETUP_MESSAGE = `\n${config.emojis.warning} Check the punishments wiki, a perfect strike system for administrators: https://github.com/Snuffz/ManagerBot/wiki/%F0%9F%9A%A9-Strikes#-punishments-system`;

module.exports.useDefaultSettings = (guild) => 
{
  const rs = guild.settings.firstAutomod;
  guild.settings.firstAutomod = false;
  guild.settings.save().catch(e => console.error(e));
  return rs;
}

    module.exports.removeAction = (guild, numStrikes) => 
    {
      if(guild.punishments.some(p => p.nr === numStrikes))
    {
      const index = guild.settings.punishments.findIndex(i=>i.nr===numStrikes);
      guild.settings.punishments.splice(index, 1);
      guild.settings.save().catch(e => console.error(e));
    }
    }

    module.exports.setAction = (guild, numStrikes, action) => 
    {
      if(!guild.punishments.some(p => p.nr === numStrikes))
      {
      const p = {
        nr: numStrikes,
        action: action
      }
      guild.settings.punishments.push(p);
      guild.settings.save().catch(e => console.error(e));
    }
    }

module.exports.getAllPunishmentsDisplay = (all) => {
    if(all.length==0)
       return "No punishment set!";
    const PunishmentsDisplay = {
        mute: "**\uD83D\uDD07 Mute**", // 🔇
        ban: "**\uD83D\uDD28 Ban**", // 🔨
        softban: "**\uD83C\uDF4C Softban**", // 🍌
        tempmute: "**\uD83E\uDD10 Tempmute**", // 🤐
        tempban: "**\u23F2 Tempban**" // ⏲
      }
     return all.sort((a,b) => a.nr-b.nr).map((p) =>
     `\`${p.nr} ${strike}\` - ${PunishmentsDisplay[p.action.split(" ")[0]]} ${p.action.split(" ").length>1?p.action.split(" ").slice(1).join(" "):""}`
   )
}