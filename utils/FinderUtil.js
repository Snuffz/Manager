const DISCORD_ID = new RegExp("[0-9]{17,20}");
const FULL_USER_REF = new RegExp(".*#[0-9]{4}");
const USER_MENTION = new RegExp("<@!?[0-9]{17,20}>");
const CHANNEL_MENTION = new RegExp("<#[0-9]{17,20}>");
const ROLE_MENTION = new RegExp("<@&[0-9]{17,20}>");

const Collections = new (require("discord.js")).Collection();

module.exports.findUsers = (query, client) => 
{
    Collections.clear();

    const userMention = query.match(USER_MENTION);
    const fullRefMatch = query.match(FULL_USER_REF);

    if(userMention)
    {
        const user = client.users.cache.get(userMention[0].replace(/[<@!>]/g, ""));
        if(user!=undefined)
        return Collections.set(user.id, user);
    }
    else if(fullRefMatch)
    {
        const lowerTag = fullRefMatch[0].toLowerCase();
        const user = client.users.cache.find(u => u.tag.toLowerCase() === lowerTag);
        if(user!=undefined)
        return Collections.set(user.id, user);
    }
    else if(query.match(DISCORD_ID))
    {
       const user = client.users.cache.get(query);
       if(user!=undefined)
       return Collections.set(user.id, user);
    }

    const lowerquery = query.toLowerCase();
    if(client.users.cache.some(u => u.username.toLowerCase() === lowerquery))
    {
        const user = client.users.cache.find(u => u.username.toLowerCase() === lowerquery);
        return Collections.set(user.id, user);
    }else if(client.users.cache.filter(u => u.username.toLowerCase().includes(lowerquery)))
    {
        const user = client.users.cache.filter(u => u.username.toLowerCase().includes(lowerquery));
        return user;
    }
}

module.exports.findMembers = (query, guild) => 
{
    Collections.clear();
    
    const userMention = query.match(USER_MENTION);
    const fullRefMatch = query.match(FULL_USER_REF);
    
    if(userMention)
    {
        const member = guild.members.cache.get(userMention[0]);
        if(member!=undefined)
               return Collections.set(member.id, member);
    }
    else if(fullRefMatch)
    {
        const lowerTag = fullRefMatch[0].toLowerCase();
        const member = guild.members.cache.find(m => m.user.tag.toLowerCase() === lowerTag);
        if(member!=undefined)
               return Collections.set(member.id, member);
    }
    else if(query.match(DISCORD_ID))
    {
        const member = guild.members.cache.get(query);
        if(member!=undefined)
               return Collections.set(member.id, member);
    }
    
    const lowerquery = query.toLowerCase();
    
    if(guild.members.cache.find(m => m.user.username.toLowerCase() === lowerquery || m.nickname && m.nickname.toLowerCase() === lowerquery))
    {
        const member = guild.members.cache.find(m => m.user.username.toLowerCase() === lowerquery || m.nickname && m.nickname.toLowerCase() === lowerquery);
        return Collections.set(member.id, member);
    }
    else if(guild.members.cache.filter(m => m.user.username.toLowerCase().includes(lowerquery) || m.nickname && m.nickname.toLowerCase().includes(lowerquery)))
    {
        const member = guild.members.cache.filter(m => m.user.username.toLowerCase().includes(lowerquery) || m.nickname && m.nickname.toLowerCase().includes(lowerquery));
        return member;
    }
    }

module.exports.findTextChannels = (query, guild) =>
{
Collections.clear();

const channelMention = query.match(CHANNEL_MENTION);

if(channelMention)
{
    const tc = guild.channels.cache.find(c => c.type === "text" && c.toString() === channelMention[0]);
    if(tc!=undefined)
          return Collections.set(tc.id, tc);
}
else if(query.match(DISCORD_ID))
{
    const tc = guild.channels.cache.find(c => c.type === "text" && c.id === query);
    if(tc!=undefined)
           return Collections.set(tc.id, tc);
}

const lowerName = query.toLowerCase();

if(guild.channels.cache.find(c => c.type === "text" && c.name.toLowerCase() === lowerName))
{
    const tc = guild.channels.cache.find(c => c.type === "text" && c.name.toLowerCase() === lowerName);
    return Collections.set(tc.id, tc);
}
else if(guild.channels.cache.filter(c => c.type === "text" && c.name.toLowerCase().includes(lowerName)))
{
 const tc = guild.channels.cache.filter(c => c.type === "text" && c.name.toLowerCase().includes(lowerName));
 return tc;
}
}

module.exports.findVoiceChannels = (query, guild) => 
{
Collections.clear();

if(query.match(DISCORD_ID))
{
    const vc = guild.channels.cache.find(c => c.type === "voice" && c.id === query);
    if(vc!=undefined)
           return Collections.set(vc.id, vc);
}
else if(query.match(CHANNEL_MENTION))
{
    const vc = guild.channels.cache.find(c => c.type === "voice" && c.id === query.match(CHANNEL_MENTION)[0]);
    if(vc!=undefined)
          return Collections.set(vc.id, vc);
}

const lowerName = query.toLowerCase();

if(guild.channels.cache.find(c => c.type === "voice" && c.name.toLowerCase() === lowerName))
{
    const vc = guild.channels.cache.find(c => c.type === "voice" && c.name.toLowerCase() === lowerName);
    return Collections.set(vc.id, vc);
}
else if(guild.channels.cache.filter(c => c.type === "voice" && c.name.toLowerCase().includes(lowerName)))
{
 const vc = guild.channels.cache.filter(c => c.type === "voice" && c.name.toLowerCase().includes(lowerName));
 return vc;
}
}

module.exports.findRoles = (query, guild) => 
{
Collections.clear();

const roleMention = query.match(ROLE_MENTION);

if(roleMention)
{
    const role = guild.roles.cache.get(roleMention[0]);
    if(role!=undefined) 
          return Collections.set(role.id, role);
}
else if(query.match(DISCORD_ID))
{
    const role = guild.roles.cache.get(query);
    if(role!=undefined)
          return Collections.set(role.id, role);
}

const lowerquery = query.toLowerCase();

if(guild.roles.cache.find(r => r.name.toLowerCase() === lowerquery))
{
    const role = guild.roles.cache.find(r => r.name.toLowerCase() === lowerquery);
    return Collections.set(role.id, role);
}
else if(guild.roles.cache.filter(r => r.name.toLowerCase().includes(lowerquery)))
{
    const role = guild.roles.cache.filter(r => r.name.toLowerCase().includes(lowerquery));
    return role;
}
}