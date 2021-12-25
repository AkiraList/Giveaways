const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, guildId, clientId } = require('../config.json');
const rest = new REST({ version: '9' }).setToken(token);
const { SlashCommandBuilder } = require('@discordjs/builders');
const channelOption = {
    type: 7, // text channel
    name: "channel",
    description: "The channel to snipe",
};
const startCMD = new SlashCommandBuilder()
    .setName('start')
    .setDescription('Start a new giveaway!')
    .addStringOption(opt =>
        opt.setName('duration')
            .setDescription('How long should the giveaway last?')
            .setRequired(true))
    .addIntegerOption(opt =>
        opt.setName("winners")
            .setDescription("Amount of winners to be picked!")
            .setRequired(true))
    .addStringOption(opt =>
        opt.setName('prize')
            .setDescription('The prize that the giveaway is for!')
            .setRequired(true))
const stopCMD = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop an ongoing giveaway!')
    .addStringOption(option =>
        option.setName('message_id')
            .setDescription('The message ID of a giveaway to look for and stop')
            .setRequired(true));
const rerollCMD = new SlashCommandBuilder()
    .setName('reroll')
    .setDescription('Re-rolls an ended giveaway!')
    .addStringOption(option =>
        option.setName('message_id')
            .setDescription('The message ID of an ended giveaway to look for and reroll.')
            .setRequired(true));
const snipeCMD = new SlashCommandBuilder()
    .setName('snipe')
    .setDescription('Shows the last deleted message from a specified channel!')
    .addChannelOption(option =>
        option.setName('channel')
            .setDescription('The channel to snipe'))
    .addStringOption(option =>
        option.setName("option")
            .setDescription("Other parts of the deleted message, if present")
            .addChoice("embeds", "embeds")
            .addChoice("attachments", "attachments"))
const editSnipeCMD = new SlashCommandBuilder()
    .setName('editsnipe')
    .setDescription('Shows the last edited message from a specified channel!')
    .addChannelOption(option =>
        option.setName('channel')
            .setDescription("The channel to snipe"));
const reactSnipeCMD = new SlashCommandBuilder()
    .setName('reactionsnipe')
    .setDescription("Shows the last removed reaction from a specified channel!")
    .addChannelOption(option =>
        option.setName('channel')
            .setDescription('The channel to snipe'));
commands = [startCMD, stopCMD, rerollCMD, snipeCMD, editSnipeCMD, reactSnipeCMD];
(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();