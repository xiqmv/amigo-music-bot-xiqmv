// server.js لتشغيل البوت 24/7 على Replit
require('./server.js');

const { Client, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const config = require('./config.json');

// إنشاء عميل الديسكورد
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ]
});

// إنشاء مشغل الموسيقى
const player = new Player(client);

// ✅ حل مشكلة الصوت في Replit
require('@discord-player/ffmpeg');

client.once('ready', async () => {
  await player.extractors.loadMulti(DefaultExtractors);
  console.log('✅ Server is ready.');
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// 🎵 حدث بداية تشغيل الأغنية
player.events.on('playerStart', (queue, track) => {
  queue.metadata.channel.send(`🎵 يشغل الآن: **${track.title}**`);
});

// ❌ حدث في حالة خطأ
player.events.on('error', (queue, error) => {
  console.error(`❌ Error in queue: ${error.message}`);
});

// 🔘 تنفيذ أمر /play
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName !== 'play') return;

  await interaction.deferReply();

  const query = interaction.options.getString('query');

  const queue = player.nodes.create(interaction.guild, {
    metadata: {
      channel: interaction.channel
    }
  });

  const result = await player.search(query, {
    requestedBy: interaction.user
  });

  if (!result.hasTracks()) {
    return interaction.editReply('❌ لم أجد الأغنية.');
  }

  try {
    await queue.connect(interaction.member.voice.channel);
  } catch {
    return interaction.editReply('❌ لا يمكنني الدخول إلى القناة الصوتية.');
  }

  queue.addTrack(result.tracks[0]);

  if (!queue.connection) {
    return interaction.editReply('❌ فشل الاتصال الصوتي.');
  }

  console.log("🎧 الاتصال ناجح، جاري التشغيل...");

  if (!queue.isPlaying()) {
    await queue.node.play();
  }

  interaction.editReply(`✅ تم تشغيل: **${result.tracks[0].title}**`);
});

// تسجيل الدخول
client.login(config.token);
