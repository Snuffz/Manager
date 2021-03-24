module.exports.setBan = (guild, userId, ms) => 
{
    const j = {
        guildID: guild.id,
        time: Date.now()+ms,
        memberID: userId
      };
 if(!guild.settings.tempbans.some(m => m.memberID === userId))
 {
      guild.settings.tempbans.push(j);
      guild.settings.save().catch(e => console.error(e));
 }
}

module.exports.clearBan = (guild, userId) => 
{
    if(guild.settings.tempbans.some(m => m.memberID === userId))
    {
    const index = guild.settings.tempbans.findIndex(c => c.memberID === userId);
    guild.settings.tempbans.splice(index, 1);
    guild.settings.save().catch(e => console.error(e));
    }
}

module.exports.checkUnbans = (client) => 
{
    const logHandler = require("../../handlers/serverLogger.js");
    client.guilds.cache.filter(g => g.settings && g.settings.tempbans && g.settings.tempbans.filter(b => b.time <= Date.now()).length > 0).forEach((g) => {
        g.settings.tempbans.filter(b => b.time <= Date.now()).forEach((bans) => {
            setInterval(() => {
        const guild = client.guilds.cache.get(bans.guildID);
        if(guild && guild.members){
            guild.members.unban(bans.memberID, "Temporary Ban Completed")
            .then((member) => {
                if (guild.channels.cache.has(guild.settings.modLogsChannel)) {
                    const Logger = new logHandler({ client: client, case: "unban", guild: guild.id, member: member, moderator: client.user, reason: "Temporary Ban Completed" });
                    Logger.send().then(() => Logger.kill());
                  } 
            })
            .catch(()=>{})
        }
        }, 1000)
        })
    })
}

