const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { token, guildId, clientId } = require('./config.json');
const rest = new REST({ version: '9' }).setToken(token);
const { SlashCommandBuilder } = require('@discordjs/builders');

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

commands = [startCMD, stopCMD, rerollCMD];

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