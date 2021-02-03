const MAX_FILTERS = 15;

const Settings = require("../settings.js");

module.exports.getFilters = async (guild) => {
const settings = await Settings.findOne({ guildID: guild.id });
if(settings!=null)
  return settings.filterWords;
  const newSettings = new Settings({
    filterWords: new Array()
  });
  await newSettings.save().catch(e => console.error(e));
  return new Array();
}

module.exports.getFiltersDisplay = (guild) => {
    const filters = [... new Set(guild.settings.filterWords.map(obj => obj.category))];
    if(filters.length==0)
      return null;
    var sb = new String();
    filters.forEach((f) => {
    const
       strikes = guild.settings.filterWords.find(w => w.category.toLowerCase() === f.toLowerCase()).strike,
       words = guild.settings.filterWords.filter(w => w.category.toLowerCase() === f.toLowerCase()).map(a => a.regex ? `/${a.word}/` : `"${a.word}"`).join(" ")
      sb+=`\n**${f}** (\`${strikes} ${guild.client.getEmoji("strike")}\`): ${words}`
    });
return sb;
}

module.exports.getFiltersJson = (guild) => {
    const fs = require("fs");
    try
    {
        fs.readFileSync("filters.json");
    } 
    catch(e)
    {
        const obj = new Object(guild.id)
        fs.appendFileSync("filters.json", JSON.stringify(obj["filters"] = guild.settings.filterWords, null, 4)); 
    }
    const file = JSON.parse(fs.readFileSync('filters.json', 'utf8'));
    return file[guild.id];
}

module.exports.addFilter = (guild, filter) => {
const shortname = shortnameOf(filter.category);
if(shortname.length==0)
    return false;
    if([... new Set(guild.settings.filterWords.map(w => w.category))].length >= MAX_FILTERS)
    return false;
try
{
guild.settings.filterWords.push(filter);
guild.settings.save().catch(e => console.error(e));
return true;
}
catch(e)
{
return false;
}
}

module.exports.deleteFilter = (guild, name) => {
  const shortname = shortnameOf(name);
  if(shortname.length==0)
     return null;
     if(!guild.settings.filterWords.find(w => w.category.toLowerCase() === name.toLowerCase()))
     return null;
     guild.settings.filterWords.filter(w => w.category.toLowerCase() === name.toLowerCase()).forEach(async (word) => {
      const index = guild.settings.filterWords.findIndex(j => j.word === word);
      guild.settings.filterWords.splice(index, 1);
      await guild.settings.save().catch(e => console.error(e));
    });
    return true;
}

module.exports.deleteAllFilters = async (guildId) => {
  const settings = await Settings.findOne({ guildID: guildId });
const filters = settings.filterWords;
settings.filterWords = new Array();
await settings.save().catch(e => console.error(e));
return filters.length;
}

function shortnameOf(name){
    return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}