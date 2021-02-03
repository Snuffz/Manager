const Settings = require("../models/settings");

module.exports = class {
    constructor (client) {
      this.client = client;
    }
    async run (member, oldChannel, newChannel) {
      const settings = await Settings.findOne({ guildID: member.guild.id });
      if(!settings)
      return;
      if(member.id !== this.client.user.id) 
      return;
      settings.voicemove = false;
      await settings.save().catch(e => this.client.logger.log(e, "error"));   
      const members = member.guild.members.cache.filter(a => a.voice.channel && a.voice.channel.id === oldChannel.id);
      var count = 0; 
       members.forEach(async (u) => {
         count++;
        await u.voice.setChannel(newChannel).catch(()=>{});
     })
     var interval = setInterval(()=>{if(members.size==count){ newChannel.leave(); clearInterval(interval)}},100);         
    }
}