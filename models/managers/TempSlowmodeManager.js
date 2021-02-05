module.exports.setSlowmode = (channel, ms) => 
{
    const j = {
        time: Date.now()+ms,
        channelID: channel.id
      };
 if(!channel.guild.settings.slowmodes.some(c => c.channelID === channel.id))
 {
      channel.guild.settings.slowmodes.push(j);
      channel.guild.settings.save().catch(e => console.error(e));
 } 
}

module.exports.clearSlowmode = (channel) => 
{
    if(channel.guild.settings.slowmodes.some(c => c.channelID === channel.id))
    {
    const index = channel.guild.settings.slowmodes.findIndex(c => c.channelID === channel.id);
    channel.guild.settings.slowmodes.splice(index, 1);
    channel.guild.settings.save().catch(e => console.error(e)).then(() =>
    console.log(channel.guild.settings.slowmodes))
    }
}

module.exports.checkSlowmode = (client) =>
{
    client.channels.cache.filter(c => c.guild && c.guild.settings && c.guild.settings.slowmodes && c.guild.settings.slowmodes.filter(s => s.time <= Date.now()).length > 0).forEach((channel) => {
      setTimeout(() => {
        this.clearSlowmode(channel);
        try{
        channel.setRateLimitPerUser(0, "Temporary Slowmode Completed")
        } catch(e) {}
      }, 1000)
    })
}