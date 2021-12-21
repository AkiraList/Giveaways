const Discord = require("discord.js");
const ms = require("ms");
const config = require("./config.json")
const { GiveawaysManager } = require('discord-giveaways');
const client = new Discord.Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_MEMBERS",
        "GUILD_MESSAGE_REACTIONS"
    ],
    allowedMentions: {
        parse: ["users"]
    }
})
const manager = new GiveawaysManager(client, {
    storage: './giveaways.json',
    default: {
        botsCanWin: false,
        embedColor: '#FF0000',
        embedColorEnd: '#000000',
        reaction: '🎉'
    }
});
client.giveawaysManager = manager;

client.on('ready', () => {
    console.log('I\'m ready!');
    client.user.setActivity(
        "Giveaways!", {
        type: "WATCHING"
    }
    )
});
client.on("interactionCreate", async (inter) => {
    if (inter.isCommand()) {
        if (inter.commandName) {
            if (!inter.inGuild) return inter.reply("All of my commands __only__ work in servers, sorry!");
            if (inter.commandName == "start") {
                if (!inter.memberPermissions.has(["MENTION_EVERYONE", "MANAGE_MESSAGES", "VIEW_CHANNEL", "SEND_MESSAGES"])) {
                    const duration = inter.options.getString('duration');
                    const winnerCount = inter.options.getInteger('winners');
                    const prize = inter.options.getString('prize');
                    const hostedBy = inter.user;
                    if (!ms(duration)) return inter.reply("Please provide a Proper time! (5m, 1h, 1d,...)")
                    client.giveawaysManager.start(inter.channel, {
                        duration: ms(duration),
                        winnerCount,
                        prize,
                        hostedBy
                    }).then((gData) => {
                        return inter.reply("Giveaway started successfully!")
                    });
                } else {
                    return inter.reply("You do not have all of the required permissions to start a new Giveaway!" + "||`MENTION_EVERYONE`, `MANAGE_MESSAGES`, `VIEW_CHANNEL`, `SEND_MESSAGES`")
                }
            }
            if (inter.commandName == "stop") {
                const giveaway = await client.giveawaysManager.giveaways.find((g) => g.guildId === inter.guildId && g.messageId === inter.options.getString('message_id'));
                //                console.log(giveaway)
                if (giveaway) {
                    if (inter.memberPermissions.has(["MANAGE_MESSAGES", "VIEW_CHANNEL", "SEND_MESSAGES"])) {
                        client.giveawaysManager.end(giveaway.options.messageId).then(() => {
                            inter.reply({ content: 'Success! Giveaway ended!', ephemeral: false });
                        }).catch((err) => {
                            inter.reply({ content: `An error has occurred, please check and try again.\n\`${err}\``, ephemeral: true });
                        });
                    } else {
                        await inter.reply({ content: "You do not have all of the required permissions to stop a Giveaway!" + "||`MENTION_EVERYONE`, `MANAGE_MESSAGES`, `VIEW_CHANNEL`, `SEND_MESSAGES`||", ephemeral: true })
                    }
                } else {
                    return inter.reply({ content: `An error has occurred, please check and try again.`, ephemeral: true });
                }
            }
            if (inter.commandName == "reroll") {
                const giveaway = await client.giveawaysManager.giveaways.find((g) => g.guildId === inter.guildId && g.messageId === inter.options.getString('message_id'));
                if (giveaway) {
                    if (inter.memberPermissions.has(["MANAGE_MESSAGES", "VIEW_CHANNEL", "SEND_MESSAGES"])) {
                        await client.giveawaysManager.reroll(giveaway.messageId).then(() => {
                            inter.reply({ content: 'Success! Giveaway rerolled!', ephemeral: false });
                        }).catch((err) => {
                            inter.reply({ content: `An error has occurred, please check and try again.\n\`${err}\``, ephemeral: true });
                        });
                    } else {
                        await inter.reply({ content: "You do not have all of the required permissions to start a new Giveaway!" + "||`MENTION_EVERYONE`, `MANAGE_MESSAGES`, `VIEW_CHANNEL`, `SEND_MESSAGES`", ephemeral: true })
                    }
                } else {
                    return inter.reply({ content: `An error has occurred, please check and try again.`, ephemeral: true });
                }
            }
        }
    }
})

client.login(config.token);