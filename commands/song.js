// Optimized .song Command with Fallbacks and Safety
const axios = require('axios');
const yts = require('yt-search');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

module.exports = async function songCommand(sock, chatId, message) {
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
    const searchQuery = text.split(' ').slice(1).join(' ').trim();
    if (!searchQuery) return sock.sendMessage(chatId, { text: '🎵 Please enter a song name.\nExample: *.song Despacito*' });

    const { videos } = await yts(searchQuery);
    const video = videos.find(v => v.seconds < 600); // Filter < 10 mins
    if (!video) return sock.sendMessage(chatId, { text: '❌ No suitable song found (max 10 mins).' });

    const timestamp = Date.now();
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const tempRaw = path.join(tempDir, `${timestamp}.m4a`);
    const tempMp3 = path.join(tempDir, `${timestamp}.mp3`);
    const fileName = video.title.replace(/[<>:"/\\|?*]/g, '').slice(0, 64) + '.mp3';

    await sock.sendMessage(chatId, {
        image: { url: video.thumbnail },
        caption: `*${video.title}*\n⏱️ Duration: ${formatDuration(video.duration.seconds)}\n👁️ Views: ${formatNumber(video.views)}\n\n_Processing audio..._`
    }, { quoted: message });

    const apis = [
        `https://api.siputzx.my.id/api/dl/youtube/mp3?url=${video.url}`,
        `https://api.vreden.my.id/api/dl/ytmp3?url=${video.url}`,
        `https://api.zenkey.my.id/api/download/ytmp3?apikey=zenkey&url=${video.url}`,
        `https://api.axeel.my.id/api/download/ytmp3?apikey=axeel&url=${video.url}`
    ];

    for (const url of apis) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const dlUrl = data?.data || data?.result?.download?.url || data?.result?.downloadUrl;
            if (!dlUrl) continue;

            const fileRes = await fetch(dlUrl);
            const buffer = await fileRes.buffer();
            fs.writeFileSync(tempRaw, buffer);

            try {
                await execPromise(`ffmpeg -i "${tempRaw}" -vn -acodec libmp3lame -ac 2 -ab 128k -ar 44100 "${tempMp3}"`);
            } catch (err) {
                console.error("FFmpeg error:", err.message);
                return sock.sendMessage(chatId, { text: '❌ Audio conversion failed.' }, { quoted: message });
            }

            await sock.sendMessage(chatId, {
                audio: { url: tempMp3 },
                mimetype: 'audio/mpeg',
                fileName,
                ptt: false
            }, { quoted: message });

            cleanup(tempRaw, tempMp3);
            return;
        } catch (err) {
            console.warn('Fallback failed:', err.message);
        }
    }

    await sock.sendMessage(chatId, { text: '❌ All download methods failed. Try another song.' }, { quoted: message });
};

function formatDuration(seconds) {
    const m = Math.floor(seconds / 60), s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatNumber(num) {
    return num.toLocaleString('en-US');
}

function cleanup(...files) {
    setTimeout(() => {
        for (const file of files) if (fs.existsSync(file)) fs.unlinkSync(file);
    }, 5000);
}
