// 🟢 تشغيل سيرفر keep-alive (إن كنت تستخدم Replit أو Railway مع keep alive)
require('./server.js');

// 🧠 تحميل المتغيرات من .env
require('dotenv').config();

// 📦 استدعاء المكتبات
const { Client, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
require('@discord-player/ffmpeg'); // لتفعيل ffmpeg تلقائيًا

// 🤖 إنشاء بوت ديسكورد مع الصلاحيات المطلوبة
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent
  ]
});

// 🎵 إعداد مشغل الموسيقى
const player = new Player(client);

// 📦 تحميل الاستخراجات الافتراضية (YouTube + أكثر)
client.once('ready', async () => {
  await player.extractors.loadMulti(DefaultExtractors);

  console.log('✅ Server is ready.');
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// 🎶 عند بدء تشغيل أغنية
player.events.on('playerStart', (queue, track) => {
  queue.metadata.channel.send(`🎵 يشغل الآن: **${track.title}**`);
});

// ❌ عند حدوث خطأ في التشغيل
player.events.on('error', (queue, error) => {
  console.error(`❌ Error in queue: ${error.message}`);
});

// 🧠 تنفيذ أوامر التفاعل (مثلاً /play)
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand() || interaction.commandName !== 'play') return;

  await interaction.deferReply();

  const query = interaction.options.getString('query');
  const voiceChannel = interaction.member.voice.channel;

  if (!voiceChannel) {
    return interaction.editReply('❌ يجب أن تكون في قناة صوتية!');
  }

  const queue = player.nodes.create(interaction.guild, {
    metadata: { channel: interaction.channel }
  });

  const result = await player.search(query, {
    requestedBy: interaction.user
  });

  if (!result.hasTracks()) {
    return interaction.editReply('❌ لم أجد الأغنية.');
  }

  try {
    await queue.connect(voiceChannel);
  } catch {
    return interaction.editReply('❌ لا يمكنني الدخول إلى القناة الصوتية.');
  }

  queue.addTrack(result.tracks[0]);

  if (!queue.isPlaying()) {
    await queue.node.play();
  }

  interaction.editReply(`✅ تم تشغيل: **${result.tracks[0].title}**`);
});

// 🔐 تسجيل الدخول باستخدام التوكن من .env
client.login(process.env.TOKEN);
