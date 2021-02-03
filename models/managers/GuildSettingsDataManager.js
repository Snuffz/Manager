const config = require("../../config.js");

module.exports.getSettingsDisplay = (guild) => {
    const modlog = guild.channels.cache.get(guild.settings.modLogsChannel);
    const serverlog = guild.channels.cache.get(guild.settings.serverLog);
    const messagelog = guild.channels.cache.get(guild.settings.messageLog);
    const voicelog = guild.channels.cache.get(guild.settings.voiceLog);
    const avylog = guild.channels.cache.get(guild.settings.avatarLog);
    const modrole = guild.roles.cache.get(guild.settings.modRole);
    const muterole = guild.roles.cache.get(guild.settings.muteRole) || guild.roles.cache.find(r => r.name.toLowerCase() === "muted");
    return `Prefix: \`${!guild.settings.prefix ? config.prefix : guild.settings.prefix}\`
Mod Role: ${!modrole ? "None" : modrole.toString()}
Muted Role: ${!muterole ? "None" : muterole.toString()}
Mod Log: ${!modlog ? "None" : modlog.toString()}
Message Log: ${!messagelog ? "None" : messagelog.toString()}
Voice Log: ${!voicelog ? "None" : voicelog.toString()}
Avatar Log: ${!avylog ? "None" : avylog.toString()}
Server Log: ${!serverlog ? "None" : serverlog.toString()}
TimeZone: **${guild.settings.timezone}**\n\u200B`
}