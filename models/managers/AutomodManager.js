module.exports.MENTION_MINIMUM = 4;
module.exports.ROLES_MENTION_MINIMUM = 2;

module.exports.getSettingsDisplay = (guild) => {
    return `AntiInvite: \`${guild.client.getEmoji("strike")} ${guild.settings.antiInvite || 0}\`
Referral Links: \`${guild.client.getEmoji("strike")} ${guild.settings.antiReferral || 0}\`
Anti-Copypastas: \`${guild.client.getEmoji("strike")} ${guild.settings.antiCopy || 0}\`
Anti-Everyone: \`${guild.client.getEmoji("strike")} ${guild.settings.antiEveryone}\`
Anti-NSFW: \`${guild.client.getEmoji("strike")} ${guild.settings.nsfwDetection}\`
Anti-Spam: \`${guild.client.getEmoji("strike")} ${guild.settings.antiSpam || 0}\`
\n**__Maximum Mentions__**
User Mentions: \`${guild.settings.maxMentions==0 ? "OFF" : guild.settings.maxMentions}\`
Roles Mentions: \`${guild.settings.maxMentionsRoles==0 ? "OFF" : guild.settings.maxMentionsRoles}\`
Max Lines: \`${guild.settings.maxLines==0 ? "OFF" : guild.settings.maxLines}\`
\n**__Miscellaneous__**
Auto AntiRaid: ${guild.settings.useAutoRaidMode ? `\`${guild.settings.raidmodeNumber}\` joins/\`${guild.settings.raidmodeTime}\`s` : "Disabled"}
Auto DeHoist: \`${guild.settings.hoistCharacters.length > 0 ? `${guild.settings.hoistCharacters[0]} up` : "OFF"}\`
Resolve Links: \`${guild.settings.redirectLinks ? guild.settings.redirectLinks.toUpperCase() : "OFF"}\``
}

module.exports.enableRaidMode = async (guild, moderator, reason) => 
{
  guild.settings.isInRaidMode = true; guild.settings.lastVerification = guild.verificationLevel; await guild.settings.save().then(() => {
  if(guild.verificationLevel!="HIGH" && guild.verificationLevel!="VERY_HIGH")
  {
      try 
      {
        guild.setVerificationLevel(3, "Enabling Anti-Raid Mode")
      } catch(e){}
  }
  const logHandler = require("../../handlers/serverLogger");
  const Logger = new logHandler({ client: guild.client, case: "lockdownOn", guild: guild.id, moderator: moderator, reason: reason });
  Logger.send().then(() => Logger.kill());
});
}

module.exports.disableRaidMode = async (guild, moderator, reason) => 
{
    const last = guild.settings.lastVerification;
    guild.settings.isInRaidMode = false; await guild.settings.save();
    if(guild.verificationLevel!=last)
    {
        try 
        {
            guild.setVerificationLevel(last, "Disabling Anti-Raid Mode");
        } catch(e){}
    }
    const logHandler = require("../../handlers/serverLogger");
    const Logger = new logHandler({ client: guild.client, case: "lockdownOff", guild: guild.id, moderator: moderator, reason: reason });
    Logger.send().then(() => Logger.kill());
}

module.exports.setAutoRaidMode = async (guild, number, time) => 
{
guild.settings.useAutoRaidMode = number>0 && time>0 ? true : false;
guild.settings.raidmodeNumber = number;
guild.settings.raidmodeTime = time;
await guild.settings.save().catch(e => guild.client.logger.log(e, "error"));
}