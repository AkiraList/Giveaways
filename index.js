const Discord = require("discord.js");
const ms = require("ms");
const config = require("./config.json")
const { GiveawaysManager } = require('discord-giveaways');
const client = new Discord.Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_MESSAGE_REACTIONS"
    ],
    allowedMentions: {
        parse: ["users"]
    },
    partials: ["MESSAGE", "REACTION", "USER"],
})
const snipes = {};
const editSnipes = {};
const reactionSnipes = {};
const Paginator = require("./utils/paginator");
const formatEmoji = (emoji) => {
    return !emoji.id || emoji.available
        ? emoji.toString() // bot has access or unicode emoji
        : `[:${emoji.name}:](${emoji.url})`; // bot cannot use the emoji
};

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
        const channel = inter.options.getChannel("channel") || inter.channel;
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
            if (inter.commandName == "snipe") {
                const snipe = snipes[channel.id];
                if (!snipe) return inter.reply("There's nothing to snipe!");
                const type = inter.options.getString("options");
                if (type === "embeds") {
                    if (!snipe.embeds.length)
                        return inter.reply("The message has no embeds!");
                    const paginator = new Paginator(
                        snipe.embeds.map((e) => ({ embeds: [e] }))
                    );
                    await paginator.start({ inter });
                } else if (type === "attachments") {
                    if (!snipe.attachments.length)
                        return inter.reply("The message has no embeds!");
                    const paginator = new Paginator(
                        snipe.attachments.map((a) => ({ content: a }))
                    );
                    await paginator.start({ inter });
                } else {
                    const embed = new Discord.MessageEmbed()
                        .setAuthor(snipe.author)
                        .setFooter(`#${channel.name}`)
                        .setTimestamp(snipe.createdAt);
                    if (snipe.content) embed.setDescription(snipe.content);
                    if (snipe.attachments.length) embed.setImage(snipe.attachments[0]);
                    if (snipe.attachments.length || snipe.embeds.length)
                        embed.addField(
                            "Extra Info",
                            `*Message also contained \`${snipe.embeds.length}\` embeds and \`${snipe.attachments.length}\` attachments.*`
                        );
                    await inter.reply({ embeds: [embed] });
                }
            }
        }
        if (inter.commandName == "editsnipe") {
            const snipe = editSnipes[channel.id];
            await inter.reply(
                snipe
                    ? {
                        embeds: [
                            new Discord.MessageEmbed()
                                .setDescription(snipe.content)
                                .setAuthor(snipe.author)
                                .setFooter(`#${channel.name}`)
                                .setTimestamp(snipe.createdAt),
                        ],
                    }
                    : "There's nothing to snipe!"
            );
        }
        if (inter.commandName == "reactionsnipe") {
            const snipe = reactionSnipes[channel.id];
            await inter.reply(
                snipe
                    ? {
                        embeds: [
                            new Discord.MessageEmbed()
                                .setDescription(
                                    `reacted with ${formatEmoji(
                                        snipe.emoji
                                    )} on [this message](${snipe.messageURL})`
                                )
                                .setAuthor(snipe.user)
                                .setFooter(`#${channel.name}`)
                                .setTimestamp(snipe.createdAt),
                        ],
                    }
                    : "There's nothing to snipe!"
            );
        }
    }
})
client.on("messageDelete", async (message) => {
    if (message.partial) return; // content is null or deleted embed

    snipes[message.channel.id] = {
        author: message.author.tag,
        content: message.content,
        embeds: message.embeds,
        attachments: [...message.attachments.values()].map((a) => a.proxyURL),
        createdAt: message.createdTimestamp,
    };
});
client.on("messageUpdate", async (oldMessage, newMessage) => {
    if (oldMessage.partial) return; // content is null

    editSnipes[oldMessage.channel.id] = {
        author: oldMessage.author.tag,
        content: oldMessage.content,
        createdAt: newMessage.editedTimestamp,
    };
});
client.on("messageReactionRemove", async (reaction, user) => {
    if (reaction.partial) reaction = await reaction.fetch();

    reactionSnipes[reaction.message.channel.id] = {
        user: user.tag,
        emoji: reaction.emoji,
        messageURL: reaction.message.url,
        createdAt: Date.now(),
    };
});
client.login(config.token);
process.on("unhandledRejection", console.error);
