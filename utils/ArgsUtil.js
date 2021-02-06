const TIME_REGEX = /\d+\s?(w(eek)?|d(ay)?|y(ear)?|h(our)?|s(ec(ond)?)?|m(in(ute)?)?)s?/ig;

module.exports = (message, allowTime) => {
    try
    {
const prefix = message.guild?message.guild.settings.prefix:message.client.config.prefix;

const args = message.content.slice(prefix.length).trim().split(/ +/g);
if(!args) return {victims: new Array(), reason: new String()}
const command = args.shift().toLowerCase();
const cmd = message.client.commands.get(command) || message.client.commands.get(message.client.aliases.get(command));
if(!cmd) return;

var victims = args.join(" ").replace(TIME_REGEX, '').split(/\s+/g).filter(String).concat("").map(a => a.replace(/[^0-9]+/g, ""))
victims = victims.slice(0, victims.indexOf(""));

var reason = args.slice(victims.length, args.length), time;

const isDuration = (str) => /([0-9]+) ?(year|years|y)|([0-9]+) ?(week|weeks|w)|([0-9]+) ?(day|days|d)|([0-9]+) ?(hours|hour|h)|([0-9]+) ?(minutes|minute|mins|min|m)|((?:[0-9]*[.])?[0-9]+) ?(seconds|second|secs|sec|s)/i.exec(str);
if(allowTime)
{
var regTime;

if(victims[0] && reason[0] && !reason.join(" ").trim().replace(TIME_REGEX, "").split(/\s+/g).filter(String)[0] && isDuration(reason.join(" "))) regTime = false;
    if(victims[0] && reason[0] && regTime != false && isDuration(reason.slice(0, reason.indexOf(reason.join(" ").trim().replace(TIME_REGEX, '').split(/\s+/g).filter(String)[0])).join(" ")) && isDuration(reason.slice(0, reason.indexOf(reason.join(" ").trim().replace(TIME_REGEX, '').split(/\s+/g).filter(String)[0])).join(" ")).index == 0) {
      time = reason.slice(0, reason.indexOf(reason.join(" ").trim().replace(TIME_REGEX, '').split(/\s+/g).filter(String)[0])).join(" ")
    reason = reason.slice(reason.indexOf(reason.join(" ").trim().replace(TIME_REGEX, '').split(/\s+/g).filter(String)[0]), reason.length)
    }
    if(reason[0]){
          if(victims[0] && reason.join(" ").replace(TIME_REGEX, '').split(/\s+/g).filter(String).length == 0){
            time = reason.join(" ");
            reason = new Array();
          }
        }
        if(!victims[0])
        {
          time = undefined;
          victims = args.concat("").map(a => a.replace(/[^0-9]+/g, ""));
          victims = victims.slice(0, victims.indexOf(""));
          reason = args.slice(victims.length, args.length);
        }
};

return {
    victims: [...new Set(victims)],
    reason: reason.join(" "),
    time
}

    } 
    catch(e) { console.log(e) }
}