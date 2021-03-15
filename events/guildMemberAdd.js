const 
OtherUtil = require("../utils/OtherUtil"),
FormatUtil = require("../utils/FormatUtil"),
moment = require('moment-timezone'),
Settings = require("../models/settings.js"),
logHandler = require("../handlers/serverLogger.js");
const latestGuildJoin = new Map();
const { enableRaidMode } = require("../models/managers/AutomodManager");

const JOIN = "\ud83d\udce5"; // 📥
const LINESTART = "\u25AB"; // ▫

module.exports = class {
  constructor (client) {
    this.client = client;
  }

  async run (member) {
    const settings = await Settings.findOne({ guildID: member.guild.id });
    if (!settings) 
    return;

   await memberJoin(member);

    const tc = this.client.channels.cache.get(settings.serverLog);
   if(!tc) 
   return;
  const date = moment(Date.now()).tz(settings.timezone).format("hh:mm:ss");
    tc.send(`\`[${date}]\`
${JOIN} ${FormatUtil.formatFullUser(member.user)} joined the server.
${LINESTART} Account Creation: **${member.user.createdAt.toUTCString()}** (${FormatUtil.msToTimeCompact(Date.now() - member.user.createdTimestamp)} ago)`, { disableMentions: 'all' }).catch(()=>{});
}
}

async function memberJoin(member)
{
  if(member.user.bot)
     return;
  
  const inRaidMode = member.guild.settings ? member.guild.settings.isInRaidMode : null;
  const ams = member.guild.settings;
  const now = Date.now();
  var kicking = false;

  if(inRaidMode)
  {
            if(ams.useAutoRaidMode
              && latestGuildJoin.has(member.guild.id)
              && moment.duration().add(now-latestGuildJoin.get(member.guild.id)).asSeconds()>120)
              {
                  const Logger = new logHandler({ client: member.client, case: "lockdownOff", guild: member.guild.id, moderator: member.client.user, reason: "No recent join attempts" });
                  Logger.send().then(() => Logger.kill());
              }
              else if(member.guild.me.hasPermission("KICK_MEMBERS"))
              {
                kicking = true;
              }
  }
  else if(ams.useAutoRaidMode)
  {
    const min = moment(member.joinedTimestamp).subtract(ams.raidmodeTime, 'seconds');
    const recent = member.guild.members.cache.filter(m => !m.user.bot && moment(m.joinedTimestamp).isAfter(min)).size;
    if(recent>=ams.raidmodeNumber)
    {
     await enableRaidMode(member.guild, member.client.user, `Maximum join rate exceeded (${ams.raidmodeNumber}/${ams.raidmodeTime}s)`)
      kicking = true;
    }
  }

  if(kicking)
  {
    member.send(`${member.client.config.emojis.warning} Anti-Raid mode is active on the server **${member.guild.name}**. Try again later.`)
    .then(() => member.kick("Anti-Raid Mode"))
    .catch(() => member.kick("Anti-Raid Mode"));
  }
  else 
  {
    if(member.guild.settings.tempmutes.some(m => m.memberID === member.id))
    {
      if(member.guild.roles.cache.has(member.guild.settings.muteRole))
      {
        member.roles.add(member.guild.settings.muteRole, "Automatic Mute").catch(()=>{});
      }
    }
  }
  if(member.guild.settings.hoistCharacters.includes(member.displayName.substr(0,1)))
  OtherUtil.dehoist(member, member.displayName.substr(0,1));

  latestGuildJoin.set(member.guild.id, now);
}