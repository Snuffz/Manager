module.exports.isMuted = (member) =>
{
    const role = member.guild.roles.cache.get(member.guild.settings.muteRole) || member.guild.roles.cache.find(r => r.name.toLowerCase() === "muted");
    if(!role)
    return false;
    return member.roles.cache.has(role.id);
}

module.exports.setMute = (guild, userId, ms) => 
{
    const j = {
        guildID: guild.id,
        time: ms==null ? ms : Date.now()+ms,
        memberID: userId
      };
 if(!guild.settings.tempmutes.some(m => m.memberID === userId))
 {
      guild.settings.tempmutes.push(j);
      guild.settings.save().catch(e => console.error(e));
 }
}

module.exports.removeMute = (guild, userId) => 
{
    if(guild.settings.tempmutes.some(m => m.memberID === userId))
 {
    const index = guild.settings.tempmutes.findIndex(c => c.memberID === userId);
    guild.settings.tempmutes.splice(index, 1);
    guild.settings.save().catch(e => console.error(e));
 }
}

module.exports.checkUnmutes = (client) => 
{
    const logHandler = require("../../handlers/serverLogger.js");
    client.guilds.cache.filter(g => g.settings && g.settings.tempmutes && g.settings.tempmutes.filter(m => m.time!=null && m.time <= Date.now()).length > 0).forEach((g) => {
        g.settings.tempmutes.filter(m => m.time <= Date.now()).forEach((mutes) => {
            setInterval(() => {
        const guild = client.guilds.cache.get(mutes.guildID);
        const role = guild.roles.cache.get(guild.settings.muteRole) || member.guild.roles.cache.find(r => r.name.toLowerCase() === "muted");
        if(role){
            this.removeMute(guild, mutes.memberID);
            guild.members.cache.get(mutes.memberID).roles.remove(role.id, "Temporary Mute Completed")
            .then((member) => {
                if (guild.channels.cache.get(guild.settings.modLogsChannel)) {
                    const Logger = new logHandler({ client: client, case: "muteRemove", guild: guild.id, member: member, moderator: client.user, reason: "Temporary Mute Completed" });
                    Logger.send().then(() => Logger.kill());
                  } 
            })
            .catch(()=>{})
        }
        }, 1000)
        })
    })
}