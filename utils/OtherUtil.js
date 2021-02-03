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

  module.exports.getEmoji = (flags) => {
    const badges = {
        DISCORD_EMPLOYEE: "<:stafftools:771327236950982696>",
        HYPESQUAD_EVENTS: "<:hypesquadevents:556682499569221662>",
        BUGHUNTER_LEVEL_1: "<:bughunter:556682363120254979>",
        HOUSE_BRAVERY: "<:hypesquad_bravery:556683071529811983>",
        HOUSE_BRILLIANCE: "<:hypesquad_brilliance:556683174563020810>",
        HOUSE_BALANCE: "<:hypesquad_balance:556683254586015765>",
        EARLY_SUPPORTER: "<:earlysupporter:556682087579516968>",
        BUGHUNTER_LEVEL_2: "<:bughunter_lvl2:771327778791882764>",
        VERIFIED_DEVELOPER: "<:dev_verificado:769314927105146921>",
        TEAM_USER: "\u2753",
        PARTNERED_SERVER_OWNER: "<:partner2:767235399943979038>",
        VERIFIED_BOT: "<:verified_bot:771343145933340672>",
        EARLY_VERIFIED_BOT_DEVELOPER: "<:dev_verificado:769314927105146921>",
        SYSTEM: "<:system:771357953894252574>"
        }
        return flags==null?"":flags.toArray().map(e => badges[e]).join("")
  }