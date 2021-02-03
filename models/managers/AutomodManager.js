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
Auto AntiRaid: \`${guild.settings.antiRaid || "OFF"}\`
Auto DeHoist: \`${guild.settings.hoistCharacters.length > 0 ? `${guild.settings.hoistCharacters[0]} up` : "OFF"}\`
Resolve Links: \`${guild.settings.redirectLinks || "OFF"}\``
}