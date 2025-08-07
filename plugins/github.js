const moment = require('moment-timezone');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function githubCommand(sock, chatId, message) {
  try {
    // Fetch repository data
    const response = await fetch('https://api.github.com/repos/Mastertech-XD/Mastertech');
    if (!response.ok) throw new Error('Failed to fetch GitHub data');

    const repo = await response.json();

    // Format the GitHub info nicely
    const caption = `
╭─❖  *GitHub Info* ❖─
│ 🏷️ *Name*        : ${repo.name}
│ 📦 *Size*        : ${(repo.size / 1024).toFixed(2)} MB
│ 🕒 *Last Update* : ${moment(repo.updated_at).format('DD/MM/YY - HH:mm:ss')}
│ 🌐 *URL*         : ${repo.html_url}
│ 🍴 *Forks*       : ${repo.forks_count}
│ ⭐ *Stars*       : ${repo.stargazers_count}
╰────────────────

✨ _Made with 💖 by Masterpeace Elite_`;

    // Load the image to send with the message
    const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
    const imageBuffer = fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : null;

    if (imageBuffer) {
      await sock.sendMessage(chatId, { image: imageBuffer, caption }, { quoted: message });
    } else {
      // Fallback if image is missing
      await sock.sendMessage(chatId, { text: caption }, { quoted: message });
    }

  } catch (err) {
    console.error('[GITHUB COMMAND ERROR]', err);
    await sock.sendMessage(chatId, { text: '❌ *Failed to retrieve repository information.*' }, { quoted: message });
  }
}

module.exports = githubCommand;
