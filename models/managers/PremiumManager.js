const premium = require("../premium.js");
const BOT_ID = "732237600605208626";

module.exports.getPremiumGuilds = async () => 
{
    const plans = await premium.findOne({ id: BOT_ID });
      return plans.guilds.map(p => p.guildId);
}

module.exports.getPremiumInfo = async (guild) => 
{
    const plans = await premium.findOne({ id: BOT_ID });
          if(plans.guilds.some(p => p.guildId === guild.id))
          return plans.guilds.find(p => p.guildId === guild.id);
          else return "No Premium";
}

module.exports.addPremium = async (guild, time) => 
{
    const plans = await premium.findOne({ id: BOT_ID });
    if(!plans.guilds.some(p => p.guildId === guild.id))
    {
          const j = {
              guildId: guild.id,
              time: time!=null ? Date.now()+time : null
          }
          plans.guilds.push(j);
        }
        else if((await this.getPremiumInfo(guild)).time!==null)
        {
      const timeLeft = plans.guilds.find(p => p.guildId === guild.id).time;
      await this.cancelPremium(guild);
      const j = {
          guildId: guild.id,
          time: timeLeft+time
      }
      plans.guilds.push(j);
        }
        await plans.save().catch(e => console.error(e));
}

module.exports.cancelPremium = async (guild) => 
{
    const plans = await premium.findOne({ id: BOT_ID });
    const index = plans.guilds.findIndex(p => p.guildId === guild.id);
    if(index>=0)
    {  
    guild.settings.redirectLinks = "off";
    guild.settings.nsfwDetection = 0;
    await guild.settings.save();
    plans.guilds.splice(index, 1);
    await plans.save().catch(e => console.error(e));
    }
}

module.exports.cleanPremiumList = () => 
{
    premium.findOne({
        id: BOT_ID
      }, (err, plans) => {
        if(err)
        return err;
          plans.guilds = new Array();
          plans.save().catch(e => console.error(e));
      })
}

module.exports.checkExpirations = async (client) => 
{
    const plans = await premium.findOne({ id: BOT_ID });
   plans.guilds.filter(p => p.time!==null && p.time<=Date.now()).map(p => p.guildId).forEach(async(g) => {
       setTimeout(async () => {
       const guild = client.guilds.cache.get(g);
    if(guild)
   await this.cancelPremium(guild);
       }, 1000)
   })
}

module.exports.getFooterString = async (guild) =>
{
    const level = await this.getPremiumInfo(guild);
if(level !== "No Premium")
{
    if(level.time !== null)
   return "This server is premium until";
   else return "This server is permanently premium";
}
else return "This is not a premium server";
}

module.exports.getTimestamp = async (guild) => 
{
    const level = await this.getPremiumInfo(guild);
    if(level !== "No Premium")
    return level.time;
    else return null
}