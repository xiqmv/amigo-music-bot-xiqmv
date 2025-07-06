const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('./config.json');

const commands = [
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('يشغل أغنية عبر رابط أو بحث')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('رابط أو اسم الأغنية')
        .setRequired(true)
    )
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands }
    );
    console.log('✅ تم تسجيل الأوامر');
  } catch (error) {
    console.error(error);
  }
})();
