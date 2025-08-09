const moment = require('moment-timezone');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');


async function githubCommand(sock, chatId, message) {
  try {
    const res = await fetch('https://api.github.com/repos/Mastertech-XD/Mastertech');
    if (!res.ok) throw new Error('Error fetching repository data');
    const json = await res.json();

    let txt = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃          🌟 *MASTERTECH-XD* 🌟         ┃
┃        🚀 *GITHUB REPOSITORY* 🚀        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🔮 *Repository Information:*
├─ ✨ *Name* : ${json.name}
├─ 👁️ *Watchers* : ${json.watchers_count}
├─ 📦 *Size* : ${(json.size / 1024).toFixed(2)} MB
├─ ⏱️ *Last Updated* : ${moment(json.updated_at).format('DD/MM/YY - HH:mm:ss')}
├─ 🔗 *URL* : ${json.html_url}
├─ 🍴 *Forks* : ${json.forks_count}
└─ ⭐ *Stars* : ${json.stargazers_count}

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  *💻 Powered by MASTERTECH-XD v1.0.0*  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

    // Use the local asset image
    const imgPath = path.join(__dirname, '../assets/bot_image.jpg');
    const imgBuffer = fs.readFileSync(imgPath);

    await sock.sendMessage(chatId, { image: imgBuffer, caption: txt }, { quoted: message });
  } catch (error) {
    await sock.sendMessage(chatId, { text: '❌ Error fetching repository information.' }, { quoted: message });
  }
}

module.exports = githubCommand; 