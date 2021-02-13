module.exports.formatUser = (user) => {
return `**${user.username}**#${user.discriminator}`;
}

module.exports.formatFullUser = (user) => {
return `**${user.username}**#${user.discriminator} (${user.id})`;
}

module.exports.listOfText = (list, query) => {
       var out = ` I found more than one text channel with \`${query}\` included:`;
       for(let i=0; i<6 && i<list.size; i++)
       out+=`\n${list.first(6)[i].name} (${list.first(6)[i].id})`;

       if(list.size > 6)
             out+=`\nAnd ${list.size-6} more...`;
             return out;
         }

  module.exports.listOfVoice = (list, query) => {
var out = ` I found more than one voice channel with \`${query}\` included:`;
for(let i=0; i<6 && i<list.size; i++)
out+=`\n${list.first(6)[i].name} (${list.first(6)[i].id})`;

if(list.size > 6)
      out+=`\nAnd ${list.size-6} more...`;
      return out;
  }

  module.exports.listOfRoles = (list, query) => {
 var out = ` I found more than one role with \`${query}\` included:`;
 for(let i=0; i<6 && i<list.size; i++)
       out+=`\n${list.first(6)[i].name} (${list.first(6)[i].id})`;
if(list.size > 6)
out+=`\nAnd ${list.size-6} more...`;
return out;
  }

  module.exports.listOfUser = (list, query) => {
var out = ` I found more than one members with \`${query}\` included:`;
for(let i=0; i<6 && i<list.size; i++)
out+=`\n**${list.first(6)[i].user.username}**#${list.first(6)[i].user.discriminator} (${list.first(6)[i].id})`;
if(list.size > 6)
out+=`\nAnd ${list.size-6} more...`;
return out;
  }

  module.exports.msToTime = (ms, object = false) => {
       var totalSeconds = (ms / 1000);
       var years = Math.floor(totalSeconds / 31536000000);
       totalSeconds %= 31536000000;
       var weeks = Math.floor(totalSeconds / 604800);
       totalSeconds %= 604800;
     var days = Math.floor(totalSeconds / 86400);
     totalSeconds %= 86400;
     var hours = Math.floor(totalSeconds / 3600);
     totalSeconds %= 3600;
     var minutes = Math.floor(totalSeconds / 60);
     var seconds = totalSeconds % 60;
     seconds = Math.floor(seconds);
       if (object === true) return { years, weeks, days, hours, minutes, seconds };
   
       var str = "";
   
            if(years > 0)
            str+=`**${years}** years, `;
            if(weeks > 0) 
            str+=`**${weeks}** weeks, `;
            if(days > 0) 
            str+=`**${days}** days, `;
            if(hours > 0) 
            str+=`**${hours}** hours, `
            if(minutes > 0) 
            str+= `**${minutes}** minutes, `;
            if (seconds > 0) 
            str+=`**${seconds}** seconds`;
   
           if(str.endsWith(", "))
                  str = str.substr(0,str.length-2);
           if(str.length === 0)
                  str="**No time**";
   
           return str;
     }
   
     module.exports.msToTimeCompact = (ms, object = false) => {
       var totalSeconds = (ms / 1000);
       var years = Math.floor(totalSeconds / 31536000000);
       totalSeconds %= 31536000000;
       var weeks = Math.floor(totalSeconds / 604800);
       totalSeconds %= 604800;
     var days = Math.floor(totalSeconds / 86400);
     totalSeconds %= 86400;
     var hours = Math.floor(totalSeconds / 3600);
     totalSeconds %= 3600;
     var minutes = Math.floor(totalSeconds / 60);
     var seconds = totalSeconds % 60;
     seconds = Math.floor(seconds);
       if (object === true) return { years, weeks, days, hours, minutes, seconds };
   
       var str = "";
   
            if(years > 0)
            str+=`**${years}**y `;
            if(weeks > 0) 
            str+=`**${weeks}**w `;
            if(days > 0) 
            str+=`**${days}**d `;
            if(hours > 0) 
            str+=`**${hours}**h `
            if(minutes > 0) 
            str+= `**${minutes}**m `;
            if (seconds > 0) 
            str+=`**${seconds}**s`;
   
           if(str.endsWith(", "))
                  str = str.substr(0,str.length-2);
           if(str.length === 0)
                  str="**No time**";
   
           return str;
     }

     module.exports.formatPerms = (perms) => {
       var tradd = {
              "CREATE_INSTANT_INVITE": "Create Invite",
              "KICK_MEMBERS": "Kick Members",
              "BAN_MEMBERS": "Ban Members",
              "ADMINISTRATOR": "Administrator",
              "MANAGE_CHANNELS": "Manage Channels",
              "MANAGE_GUILD": "Manage Server",
              "ADD_REACTIONS": "Add Reactions",
              "VIEW_AUDIT_LOG": "View Audit Log",
              "VIEW_CHANNEL": "Read Text Channels & See Voice Channels",
              "READ_MESSAGES": "Read Messages",
              "SEND_MESSAGES": "Send Messages",
              "SEND_TTS_MESSAGES": "Send TTS Messages",
              "MANAGE_MESSAGES": "Manage Messages",
              "EMBED_LINKS": "Embed Links",
              "ATTACH_FILES": "Attach Files",
              "READ_MESSAGE_HISTORY": "Read Message History",
              "MENTION_EVERYONE": "Mentions @everyone, @here, and All Roles",
              "EXTERNAL_EMOJIS": "External Emojis",
              "USE_EXTERNAL_EMOJIS": "Use External Emojis",
              "VIEW_GUILD_INSIGHTS": "View Server Insights",
              "CONNECT": "Connect",
              "SPEAK": "Speak",
              "MUTE_MEMBERS": "Mute Members",
              "DEAFEN_MEMBERS": "Deafen Members",
              "MOVE_MEMBERS": "Move Members",
              "USE_VAD": "Use Voice Activity",
              "PRIORITY_SPEAKER": "Priority Speaker",
              "CHANGE_NICKNAME": "Change Nickname",
              "MANAGE_NICKNAMES": "Manage Nicknames",
              "MANAGE_ROLES": "Manage Roles",
              "MANAGE_ROLES_OR_PERMISSIONS": "Manage roles or Permissions",
              "MANAGE_WEBHOOKS": "Manage Webhooks",
              "MANAGE_EMOJIS": "Manage Emojis",
              "STREAM": "Video"
          };

          return tradd[perms];
     }

     module.exports.helpLinks = (client) =>
      {
       return `**[Wiki](${client.config.wiki.LINK})**\n`
       + `> \u2139\ufe0f [Information](${client.config.wiki.INFORMATION})\n` // ℹ
       + `> \ud83d\udcc3 [Command List](${client.config.wiki.COMMAND_LIST})\n` // 📃
       + `> \u260e\ufe0f [Support Server](${client.config.SERVER_INVITE})\n` // ☎
       + `> ${client.getEmoji("strike")} [Strikes](${client.config.wiki.STRIKES_GUIDE})`
     }