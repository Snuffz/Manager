const Discord = require("discord.js");
const config = require("../config.js");
const mongoose = require("mongoose");
const databaseUrl = config.dbUrl;
const Infractions = require("../models/infractions.js");
const warningHandler = require("../handlers/warnReceive.js");
const logHandler = require("../handlers/serverLogger.js");
const validUrl = require("valid-url");
const sightengine = require("sightengine")("221075044", "wfl_8avzZNKH8OEPxwtuOsyRV");

mongoose.connect(databaseUrl, {
  useNewUrlParser: true
});

var strikes = [];
var reasons = [];
var authors = [];
var warned = [];
var givedWarn = [];
var messageLog = [];

class Automod {
  static run (client, message, settings) {
    Infractions.findOne({
      guildID: message.guild.id,
      userID: message.author.id
    }, async (err, u) => {
      if (err) client.logger.log(err, "error");    

      if (!u) {
        const newUser = new Infractions({
          guildID: message.guild.id,
          userID: message.author.id,
          infractions: 0
        });

        await newUser.save().catch(e => client.logger.log(e, "error"));
        return undefined;
      }

      const antiSpam = async (client, message) => {
        const amount = message.guild.settings.antiSpam

        if (messageLog.length > 50) {
          messageLog.shift();
        }

        const warnBuffer = 6;
        const maxBuffer = 9;
        const interval = 5000;
        const maxDuplicatesWarning = 6;
        const maxDuplicatesBan = 9;

        const giveWarnUser = async (m) => {
          for (var i = 0; i < messageLog.length; i++) {
            if (messageLog[i].author == m.author.id) {
              messageLog.splice(i);
            }
          }

          givedWarn.push(m.author.id);

          strikes.push(amount);
          reasons.push(`Spamming`)


          m.channel.messages.fetch({ limit: 20 }).then((messages) => {
            const filterBy = m.author ? m.author.id : client.user.id;
            messages = messages.filter(m => m.author.id === filterBy).array().slice(0, 20);
            m.channel.bulkDelete(messages, true).catch(err => client.logger.log(err, "error"));
          });

          return undefined;
        };


        const warnUser = async (m) => {
          warned.push(m.author.id);
          m.channel.send(`${client.config.emojis.warning} <@${m.author.id}> Please stop spamming.`).then(m => m.delete({ timeout: 2500, reason: "Spam" }));
        };

        if (message.author.bot) return;
        if (message.channel.type !== "text" || !message.member.user || !message.guild || !message.channel.guild) return;
        if(message.channel.topic!=null && message.channel.topic.includes("{spam}"))
          return;

        if (message.author.id !== client.user.id) {
          const currentTime = Math.floor(Date.now());
          authors.push({
            "time": currentTime,
            "author": message.author.id
          });

          messageLog.push({
            "message": message.content,
            "author": message.author.id
          });

          let msgMatch = 0;
          for (var i = 0; i < messageLog.length; i++) {
            if (messageLog[i].message == message.content && (messageLog[i].author == message.author.id) && (message.author.id !== client.user.id)) {
              msgMatch++;
            }
          }

          if (msgMatch == maxDuplicatesWarning && !warned.includes(message.author.id)) {
            warnUser(message);
          }

          if (msgMatch == maxDuplicatesBan && !givedWarn.includes(message.author.id)) {
            giveWarnUser(message);
          }

          var matched = 0;

          for (var i = 0; i < authors.length; i++) { 
            if (authors[i].time > currentTime - interval) {
              matched++;
              if (matched == warnBuffer && !warned.includes(message.author.id)) {
                warnUser(message);
              } else if (matched == maxBuffer) {
                if (!givedWarn.includes(message.author.id)) {
                  giveWarnUser(message);
                }
              }
            } else if (authors[i].time < currentTime - interval) {
              authors.splice(i);
              warned.splice(warned.indexOf(authors[i]));
              givedWarn.splice(warned.indexOf(authors[i]));
            }

            if (messageLog.length >= 350) {
              messageLog.shift();
            }
          }
        }

      };


      const antiInvite = async (client, message) => {
        var stat = false;
        const warnTheUser = async () => {
          stat = true;
          message.delete().catch(e=>e);
          strikes.push(message.guild.settings.antiInvite);
          reasons.push('Advertising');
        };

        const linkRegex = /((discord|invite)\.(gg|io|me|plus|link|io|gg|li)|discordapp\.com\/invite)\/.+/ig;
        let inviteUrl = message.content.match(linkRegex);
        inviteUrl = inviteUrl === null ? '' : inviteUrl[0]
        const inviteCode = inviteUrl.includes('invite/') ? inviteUrl.split('invite/')[1] : inviteUrl.split('/')[1]
        const guildInvites = await message.guild.fetchInvites();
        const args = message.content.trim().split(/ +/g);
        if(message.channel.topic==null || !message.channel.topic.includes("{invite}"))
        {
        for (const arg of args) {
          if (stat === false) {
            if(linkRegex.exec(arg.toLowerCase()) && inviteCode !== message.guild.vanityURLCode) {
            if (!guildInvites.some(invite => invite.code === inviteCode)) warnTheUser(client, message);
            }
          }
        }
        }
      };

      const maxLines = async (client, message, amount) => {
        const maxLines = message.content.split("\n");

        if (maxLines.length > amount) {
          message.delete().catch(e=>e);
          strikes.push(maxLines.length - message.guild.settings.maxLines);
          reasons.push(`Message contained ${maxLines.length} newlines`);
        }
      };

      const antiEveryone = async (client, message) => {

        if (message.content.includes("@everyone") || message.content.includes("@here")) {

          if (!message.channel.permissionsFor(message.member).toArray().includes("MENTION_EVERYONE")) {
            message.delete().catch(e=>e);
        strikes.push(message.guild.settings.antiEveryone);
        reasons.push(`Attempted @еveryone/here`)
          }
        }
      };

      const maxMentions = async (client, message) => {
        const totalMentions = message.mentions.users.size
        if (totalMentions > message.guild.settings.maxMentions) {
          message.delete().catch(e=>e);
          strikes.push(totalMentions - message.guild.settings.maxMentions);
          reasons.push(`Mentioning ${totalMentions} users`);
        }
      };

      const maxMentionsRoles = async (client, message, amount) => {
        const totalMentionsRoles = message.mentions.roles.size

        if (totalMentionsRoles > message.guild.settings.maxMentionsRoles) {
          message.delete().catch(e=>e);
          strikes.push(totalMentionsRoles - message.guild.settings.maxMentionsRoles);
          reasons.push(`Mentioning ${totalMentionsRoles} roles`);
        }
      };

      const antiCopy = async (client, message) => {
        var stat = false;
        const sueAuthor = async (client, message) => {
          stat = true;
          message.delete().catch(e=>e);
          strikes.push(message.guild.settings.antiCopy);
          reasons.push("Posting copypastas");
        };

        const CopyWords = ["╰━▅╮","╰╮","┳━━╯", "╰┳╯","╰┳┳┳╯","▔╰━╯","╱╲╱╲▏", "Λ＿Λ", "( 'ㅅ' )", ">　⌒ヽ", "Λ＿Λ", "ˇωˇ", "/▌", "╚═(███)═╝", "▐▄█▀▒▒▒▒▄▀█▄", "▐▄█▄█▌▄▒▀▒", "▒▀▀▄▄▒▒▒▄▒"];

        const args = message.content.trim().split(/ +/g);

        for (const arg of args) {
          if (stat === false) {
            if (CopyWords.includes(arg.toLowerCase())) sueAuthor(client, message);
          }
        }
      };

      const antiReferral = async (client, message) => {
        var stat = false;
        const sueAuthor = async (client, message) => {
          stat = true;
          message.delete().catch(e=>e);
          strikes.push(message.guild.settings.antiReferral);
          reasons.push("Posting malicious links");
        };

        const ReferralLinks = ["https://2no.co/","https://blasze.com","https://blasze.tk", "https://gotyouripboi.com","https://iplogger.com","https://iplogger.org","https://iplogger.ru", "https://ps3cfw.com", "https://yip.su", "https://bmwforum.co", "https://bucks.as", "https://cyberh1.xyz", "https://discörd.com", "https://disçordapp.com", "https://fortnight.space", "https://fortnitechat.site", "https://freegiftcards.co", "https://grabify.link", "https://oinmy.site", "https://leancoding.co", "https://minecräft.com", "https://quickmessage.us", "https://särahah.eu", "https://särahah.pl", "https://shört.co", "https://spötify.com", "https://spottyfly.com", "https://starbucks.bio", "https://starbucksisbadforyou.com", "https://starbucksiswrong.com", "https://stopify.co", "https://xda-developers.us", "https://youshouldclick.us", "https://yoütu.be", "https://yoütübe.co", "https://yoütübe.com", "https://youtubeshort.watch", "https://adblade.com", "https://adcash.com", "https://adcell.de", "https://adexchangecloud.com", "https://adf.ly", "https://adfoc.us", "https://adforce.com", "https://bc.vc", "https://bitl.cc", "https://btcclicks.com", "https://ceesty.com", "https://cur.lv", "https://fastclick.com", "https://getcryptotab.com", "https://gmads.net", "https://l2s.pet", "https://linkbucks.com", "https://linkshrink.net", "https://miniurl.pw", "https://nitroclicks.com", "https://ouo.io", "https://pay-ads.com", "https://petty.link", "https://pnd.tl", "https://restorecosm.bid", "https://sh.st", "https://short.es", "https://shorte.st", "https://shrtz.me", "https://udmoney.club", "https://uii.io", "https://ur-l.me", "https://vivads.net", "https://xponsor.com", "https://zeusclicks.com", "https://zipansion.com", "https://black-friday.ga", "https://boost.ink", "https://easycommerce.cf", "https://featu.re", "https://free.gg", "https://justdoit.cards", "https://makeprogress.ga", "https://pointsprizes.com", "https://referralpay.co", "https://selly.gg", "https://shoppy.gg", "https://weeklyjob.online", "https://wn.nr", "https://nakedphotos.club", "https://privatepage.vip", "https://viewc.site", "https://baymack.com", "https://btconline.io", "https://btcpool.io", "https://freebitco.in", "https://minero.cc", "https://outbuck.com", "https://amazingsexdating.com", "https://easter-event.com", "https://ezrobux.gg", "https://fortnite.cards", "https://fortnite.events", "https://fortnite-christmas.com", "fortnite-gifts.com", "https://fortnite-giveaway.com", "https://fortnite-special.com", "https://fortnite-vbuck.com", "https://fortnite-vbucks.de", "https://fortnite-vbucks.net", "https://free-gg.com", "https://free-steam-code.com", "https://giveawaybot.pw", "https://myetherermwallet.com", "https://oprewards.com", "https://rbxfree.com", "https://roblox-christmas.com", "https://robloxsummer.com", "https://steam-event.com", "https://steam-gift-codes.com", "https://steam-money.org", "https://steam-wallet-rewards.com", "https://steampromote.com", "https://steamquests.com", "https://steamreward.com", "https://steamspecial.com", "https://steamsummer.com", "https://whatsappx.com"];

        const args = message.content.trim().split(/ +/g);

        for (const arg of args) {
          if (stat === false) {
            if (ReferralLinks.includes(arg.toLowerCase())) sueAuthor(client, message);
          }
        }
      };

       
      const redirectLink = async (client, message) => {
        const fetch = require('node-fetch');
        var stat = false;
        const sueAuthor = async (client, message) => {
          stat = true;
          message.delete().catch(e=>e);
        }
        const logChannel = client.channels.cache.get(message.guild.settings.messageLog)
        if(!logChannel) return;
        let embed = new Discord.MessageEmbed()
        .setColor("BLUE")              

              const ReferralLinks = ["https://2no.co/","https://blasze.com","https://blasze.tk", "https://gotyouripboi.com","https://iplogger.com","https://iplogger.org","https://iplogger.ru", "https://ps3cfw.com", "https://yip.su", "https://bmwforum.co", "https://bucks.as", "https://cyberh1.xyz", "https://discörd.com", "https://disçordapp.com", "https://fortnight.space", "https://fortnitechat.site", "https://freegiftcards.co", "https://grabify.link", "https://oinmy.site", "https://leancoding.co", "https://minecräft.com", "https://quickmessage.us", "https://särahah.eu", "https://särahah.pl", "https://shört.co", "https://spötify.com", "https://spottyfly.com", "https://starbucks.bio", "https://starbucksisbadforyou.com", "https://starbucksiswrong.com", "https://stopify.co", "https://xda-developers.us", "https://youshouldclick.us", "https://yoütu.be", "https://yoütübe.co", "https://yoütübe.com", "https://youtubeshort.watch", "https://adblade.com", "https://adcash.com", "https://adcell.de", "https://adexchangecloud.com", "https://adf.ly", "https://adfoc.us", "https://adforce.com", "https://bc.vc", "https://bitl.cc", "https://btcclicks.com", "https://ceesty.com", "https://cur.lv", "https://fastclick.com", "https://getcryptotab.com", "https://gmads.net", "https://l2s.pet", "https://linkbucks.com", "https://linkshrink.net", "https://miniurl.pw", "https://nitroclicks.com", "https://ouo.io", "https://pay-ads.com", "https://petty.link", "https://pnd.tl", "https://restorecosm.bid", "https://sh.st", "https://short.es", "https://shorte.st", "https://shrtz.me", "https://udmoney.club", "https://uii.io", "https://ur-l.me", "https://vivads.net", "https://xponsor.com", "https://zeusclicks.com", "https://zipansion.com", "https://black-friday.ga", "https://boost.ink", "https://easycommerce.cf", "https://featu.re", "https://free.gg", "https://justdoit.cards", "https://makeprogress.ga", "https://pointsprizes.com", "https://referralpay.co", "https://selly.gg", "https://shoppy.gg", "https://weeklyjob.online", "https://wn.nr", "https://nakedphotos.club", "https://privatepage.vip", "https://viewc.site", "https://baymack.com", "https://btconline.io", "https://btcpool.io", "https://freebitco.in", "https://minero.cc", "https://outbuck.com", "https://amazingsexdating.com",
              "https://iplogger.org/", "https://easter-event.com", "https://ezrobux.gg", "https://fortnite.cards", "https://fortnite.events", "https://fortnite-christmas.com", "fortnite-gifts.com", "https://fortnite-giveaway.com", "https://fortnite-special.com", "https://fortnite-vbuck.com", "https://fortnite-vbucks.de", "https://fortnite-vbucks.net", "https://free-gg.com", "https://free-steam-code.com", "https://giveawaybot.pw", "https://myetherermwallet.com", "https://oprewards.com", "https://rbxfree.com", "https://roblox-christmas.com", "https://robloxsummer.com", "https://steam-event.com", "https://steam-gift-codes.com", "https://steam-money.org", "https://steam-wallet-rewards.com", "https://steampromote.com", "https://steamquests.com", "https://steamreward.com", "https://steamspecial.com", "https://steamsummer.com", "https://whatsappx.com"];

              message.content.split(' ').forEach(argu => {
                                if(validUrl.isUri(argu)){
                                    if(!argu.startsWith("https://")) return;
                  fetch(argu)
                  .then(link => {
                    if (stat === false) {
                      const linkRegex = /((discord|invite)\.(gg|io|me|plus|link|io|gg|li)|discordapp\.com\/invite)\/.+/ig;
                  if(argu.startsWith("https://discord.gg/") || argu.startsWith("https://discord.com/invite/")) return;
                      

                     message.guild.fetchInvites().then((a) => {
                      
                  if(ReferralLinks.includes(link.url) || linkRegex.exec(link.url.replace("discord.com/invite/", "discord.gg/")) && !a.some(invite => invite.url === link.url.replace("discord.com/invite/", "discord.gg/")) && link.url !== `https://discord.com/invite/${message.guild.vanityURLCode}`){ 
                    logChannel.send({content: `[${require("moment-timezone")(Date.now()).tz(message.guild.settings.timezone).format('hh:mm:ss')}]\`\n💠 **${message.author.username}**#${message.author.discriminator} (${message.author.id}) message has a malicious link in ${message.channel}:`, embed: embed.setDescription(`${argu} 🔀 ${link.url}`)})
                    sueAuthor(client, message)
                  }
                })
                }
                  })
                                }
              })
            }

            const filterWords = async (client, message) => {
              var stat = false;
              const sueAuthor = async (message, name, warns) => {
                stat = true;
                message.delete().catch(e=>e);
                strikes.push(warns);
                reasons.push(`*${name}* Filter`)
              };

              if (stat === false) {
                const words = message.guild.settings.filterWords;
                for (const i in words) {
                  if(words[i].regex == true){
                  const regex = new RegExp(words[i].word, 'mi');
                  if(regex.test(message.content.toLowerCase())) sueAuthor(message, `${words[i].category}`, words[i].strike);
                  } else if(words[i].regex == false) {
                    if(message.content.includes(words[i].word)) sueAuthor(message, words[i].category, words[i].strike);
                  }
                }
              }
            };

      const antiNsfw = async (client, message) => {
        if (message.channel.nsfw) return;

        var state = false;
        const punishUser = async (client, message) => {
          state = true;
          message.delete().catch(e=>e);
          strikes.push(message.guild.settings.nsfwDetection);
          reasons.push("Posting NSFW image")
        };

        if (message.attachments.size > 0) {
          for (const img of message.attachments) {
            sightengine.check(["nudity"]).set_url(img[1].url).then(function (result) {
              if (result.status === "success") {
                if (result.nudity.safe < 0.80) {
                  if (state === false) punishUser(client, message);
                }
              }
            }).catch(function (err) {
              return err;
            });
          }
        }

        const args = message.content.trim().split(/ +/g);

        for (const arg of args) {
          if (validUrl.isUri(arg)) {
            sightengine.check(["nudity"]).set_url(arg).then(function (result) {
              if (result.status === "success") {
                if (result.nudity.safe < 0.80) {
                  if (state === false) punishUser(client, message);
                }
              }
            }).catch(function (err) {
              return err;
            });
          }
        }
      };

      async function runAutomod(client, message, settings) {
      if(settings.filterWords.length > 0) await filterWords(client, message)
      if (settings.antiSpam > 0) await antiSpam(client, message);
      if (settings.antiInvite > 0) await antiInvite(client, message);
      if(settings.antiReferral > 0) await antiReferral(client, message)
      if (settings.maxLines > 0) await maxLines(client, message, settings.maxLines);
      if (settings.antiEveryone > 0) await antiEveryone(client, message);
      if (settings.maxMentionsRoles > 0) await maxMentionsRoles(client, message, settings.maxMentionsRoles);
if (settings.redirectLinks !== 'off' && settings.redirectLinks != null) await redirectLink(client, message)
      if (settings.maxMentions > 0) await maxMentions(client, message, settings.maxMentions);
      if (settings.antiCopy > 0) await antiCopy(client, message);
      if (settings.nsfwDetection > 0) await antiNsfw(client, message);
      }
      setTimeout(async() => {
      await runAutomod(client, message, settings)
      .then(async () => {
          if(strikes.length > 0 && reasons.length>0)
          {

            if (message.guild.settings.punishments.length == 0 || message.guild.settings.punishments.length >= 1 &&!message.guild.settings.punishments.some(p => p.nr === u.infractions + strikes.reduce((x, y) => x + y, 0)) && u.infractions + strikes.reduce((x, y) => x + y, 0) < Math.max(...message.guild.settings.punishments.map(a => a.nr))) {
               if(message.guild.channels.cache.has(message.guild.settings.modLogsChannel)){
              const Logger = new logHandler({ client: client, case: "warnAdd", guild: message.guild.id, member: message.author, moderator: client.user, reason: reasons.join(", "), amount: `\`[${u.infractions} → ${u.infractions + strikes.reduce((x, y) => x + y, 0)}]\`` });
                Logger.send().then(() => Logger.kill());
               }
                message.author.send(`${client.config.emojis.warning} You have received \`${strikes.reduce((x, y) => x + y, 0)}\` strikes in **${message.guild.name}** for: \`${reasons.join(", ")}\``).catch(e=>e)
              }

              u.infractions = u.infractions + strikes.reduce((x, y) => x + y, 0)
      
              await u.save().catch(e => client.logger.log(e, "error"));
              warningHandler.emit(client, message.member, client.user, message.guild, strikes.length > 1?u.infractions:`${u.infractions-strikes.reduce((x, y) => x + y, 0)} → ${u.infractions}`, reasons.join(", "), client.config.emojis.warning + ` You have received \`${strikes.reduce((x, y) => x + y, 0)}\` strikes in **${message.guild.name}** for: \`${reasons.join(", ")}\``);
          strikes.length = 0;
          reasons.length = 0;
            }
      })
    });
  }, 800)
  }
}

module.exports = Automod;