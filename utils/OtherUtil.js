const moment = require("moment");

module.exports.DEHOIST_ORIGINAL = ['!','"','#','$','%','&','\'','(',')','*','+',',','-','.','/'];
module.exports.DEHOIST_REPLACEMENTS = ['\u01C3', '\u201C', '\u2D4C', '\uFF04', '\u2105',     // visually
'\u214B', '\u2018', '\u2768', '\u2769', '\u2217', '\u2722', '\u201A', '\u2013', '\u2024', '\u2044'];

module.exports.dehoist = (m, symbol) => {
    if(m.id == m.guild.ownerID || m.roles.highest.position >= m.guild.me.roles.highest.position)
    return false;
    if(m.displayName.charAt(0)>symbol)
    return false;
        var newname = m.displayName;
        for(let i=0; i<this.DEHOIST_ORIGINAL.length; i++)
        {
            if(this.DEHOIST_ORIGINAL[i] == newname.charAt(0))
            {
                newname = this.DEHOIST_REPLACEMENTS[i] + (newname.length == 1 ? "" : newname.substr(1));
                break;
            }
        }
        m.setNickname(newname, "Dehoisting").catch(()=>{});
        return true;
}

module.exports.parseTime = (timeStr) => {
    let duration = moment.duration(),
    time = timeStr.replace(/[*]/g, "");
    
    if (/([0-9]+) ?(year|years|y)/i.test(time))
            duration.add(parseInt(time.match(/([0-9]+) ?(year|years|y)/i)[1]) || 0, 'y');
        if (/([0-9]+) ?(week|weeks|w)/i.test(time))
            duration.add(parseInt(time.match(/([0-9]+) ?(week|weeks|w)/i)[1]) || 0, 'w');
        if (/([0-9]+) ?(day|days|d)/i.test(time))
            duration.add(parseInt(time.match(/([0-9]+) ?(day|days|d)/i)[1]) || 0, 'd');
        if (/([0-9]+) ?(hours|hour|h)/i.test(time))
            duration.add(parseInt(time.match(/([0-9]+) ?(hours|hour|h)/i)[1]) || 0, 'h');
        if (/([0-9]+) ?(minutes|minute|mins|min|m)/i.test(time))
            duration.add(parseInt(time.match(/([0-9]+) ?(minutes|minute|mins|min|m)/i)[1]) || 0, 'm');
        if (/((?:[0-9]*[.])?[0-9]+) ?(seconds|second|secs|sec|s)/i.test(time))
            duration.add(Math.floor(parseFloat(time.match(/((?:[0-9]*[.])?[0-9]+) ?(seconds|second|secs|sec|s)/i)[1]) * 1000) || 0, 'ms');
            return duration
  }

  module.exports.getEmoji = (flag) => 
  {
     switch(flag)
     {
        case "BUGHUNTER_LEVEL_1":   return "<:bughunter:808014331370537001>";
        case "BUGHUNTER_LEVEL_2":   return "<:bughunter_lvl2:808315193624756244>";
        case "EARLY_SUPPORTER":      return "<:supporter:808284906379673602>";
        case "HYPESQUAD_EVENTS":            return "<:hypesquad_events:808284887890001941>";
        case "HOUSE_BALANCE":    return "<:balance:808006728171257897>";
        case "HOUSE_BRAVERY":    return "<:bravery:808006870169288784>";
        case "HOUSE_BRILLIANCE": return "<:brilliance:808014010875904054>";
        case "PARTNERED_SERVER_OWNER":              return "<:partner:808284928256901131>";
        case "DISCORD_EMPLOYEE":                return "<:staff:808285606529859645>";
        case "SYSTEM":               return "<:system:808318606398980096>";
        case "TEAM_USER":            return "\u2753";
        case "VERIFIED_BOT":         return "<:verified_bot:808317929367928852>";
        case "EARLY_VERIFIED_DEVELOPER": return "";
        case "VERIFIED_DEVELOPER":   return "<:verified_dev:808287043046211615>";
        default:                   "\u2753";
     }
  }