const settings = require("../settings");

async function aliveCommand(sock, chatId, message) {
  try {
    const botName = settings.botName || "MASTERTECH-XD BOT";
    const version = settings.version || "1.0.0";
    const mode = settings.mode || "Public";

    const message1 = `╭───〔 *🤖 ${botName} Status* 〕───⬣
│
│ 📌 *Status:* Online
│ 🔖 *Version:* ${version}
│ 🌐 *Mode:* ${mode}
│
│ ⚡ *Features:*
│ ─ Group Management
│ ─ Antilink Protection
│ ─ Fun & Utility Tools
│ ─ Media Downloaders
│ ─ AI & Games
│
│ 🛠️ Type *.menu* to explore commands!
│
╰───────────⬣`;

    await sock.sendMessage(chatId, {
      text: message1,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363402507750390@newsletter',
          newsletterName: 'Masterpeace Updates',
          serverMessageId: -1
        },
        externalAdReply: {
          title: `${botName} Alive & Online!`,
          body: `Version ${version}`,
          mediaType: 1,
          thumbnailUrl: 'https://files.catbox.moe/yi6lsr.jpg',
          sourceUrl: 'https://github.com/Mastertech-XD/Mastertech'
        }
      }
    }, { quoted: message });
    
  } catch (error) {
    console.error('❌ Error in alive command:', error);
    await sock.sendMessage(chatId, { text: '*✅ Bot is running smoothly!*' }, { quoted: message });
  }
}

module.exports = aliveCommand;
