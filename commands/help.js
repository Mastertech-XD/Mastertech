const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message) {
    const helpMessage = `
╔═══════════════════╗
   *🤖 ${settings.botName || '𝕄𝔸𝕊𝕋𝔼ℝ𝕋𝔼ℂℍ-𝕏𝔻'}*  
   Version: *${settings.version || '1.0.5'}*
   by ${settings.botOwner || 'MASTERPEACE ELITE'}
   YT : ${global.ytch}
╚═══════════════════╝

*Available Commands:*

╭━━━〔 🤖 𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗫𝗗 COMMANDS 〕━━━╮
┃    ✦ Your Ultimate WhatsApp Bot Menu ✦
┃  Type the commands below to explore 🔥
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

┏━🌐  GENERAL
┃ 🆘 .help / .menu       
┃ 📡 .ping               
┃ ❤️ .alive              
┃ 🔊 .tts <txt>          
┃ 👑 .owner              
┃ 😂 .joke               
┃ 💬 .quote              
┃ 📚 .fact               
┃ 🌐 .trt <txt> <lang>   
┃ 🖼️ .ss <link>
┃ 📜 .groupinfo
┃ 👤 .staff / .admins
┃ 🔍 .jid
┃ 🌦️ .weather <city>
┃ 📰 .news
┃ 🎨 .attp <txt>
┃ 🎵 .lyrics <song>
┃ 🎯 .8ball <q>
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━👮  ADMIN
┃ 🚫 .ban @user          
┃ 📉 .demote @user       
┃ 🔓 .unmute             
┃ 👢 .kick @user         
┃ ⚠️ .warn @user         
┃ ❌ .antibadword        
┃ 🏷️ .tag <msg>          
┃ 🤖 .chatbot            
┃ 👋 .welcome on/off 
┃ 📈 .promote @user
┃ ⏳ .mute <mins> 🚪
┃ 👋 .goodbye on/off
┃ 📋 .warnings @user
┃ 🔗 .antilink
┃ 🧹 .clear
┃ 📣 .tagall
┃ ♻️ .resetlink
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━🔒  OWNER
┃ ⚙️ .mode               
┃ 🗑️ .clearsession       
┃ 🧹 .cleartmp
┃ 🔄 .autotyping <on/off>
┃ 📡 .autostatus    
┃ ⚡ .autoread <on/off
┃ 💬 .autoreact
┃ 🛡️ .antidelete
┃ 🖼️ .setpp <reply img>
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━🎨  IMAGE / STICKER
┃ 🌫️ .blur <img>         
┃ 🔄 .simage <reply st>  
┃ 😂 .meme               
┃ 💞 .emojimix e1+e2
┃ 🖼️ .sticker <reply img>
┃ 📦 .tgsticker <link>
┃ 🏷️ .take <packname>
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━🎮  GAMES
┃ ⭕ .tictactoe @user    
┃ 🔠 .guess <letter>
┃ 🪢 .hangman            
┃ ❓ .trivia
┃ 💬 .answer <ans>       
┃ 😇 .truth
┃ 😈 .dare
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━🤖  AI
┃ 💭 .gpt <question>
┃ 🧠 .gemini <question>
┃ 🎨 .imagine <prompt>
┃ 🌌 .flux <prompt>
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━🎯  FUN
┃ 🌟 .compliment @user   
┃ 😏 .flirt @user
┃ 🔥 .insult @user
┃ 💕 .roseday
┃ 🌙 .goodnight
┃ 🎭 .shayari
┃ 🧩 .character @user
┃ ☠️ .wasted @user
┃ ❤️ .ship @user
┃ 🫶 .simp @user
┃ 🤪 .stupid @user [txt]
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━🔤  TEXTMAKER
┃ ⚙️ .metallic <txt>     
┃ ❄️ .ice <txt>
┃ 🌨️ .snow <txt>        
┃ 💥 .impressive <txt>
┃ 🖤 .matrix <txt>       
┃ 💡 .light <txt>
┃ 🌌 .neon <txt>         
┃ 😈 .devil <txt>
┃ 💜 .purple <txt>
┃ ⚡ .thunder <txt>
┃ 🍃 .leaves <txt>
┃ 🎖️ .1917 <txt>
┃ 🏟️ .arena <txt>
┃ 👨‍💻 .hacker <txt>
┃ 🏖️ .sand <txt>
┃ 🖤 .blackpink <txt>
┃ 💥 .glitch <txt>
┃ 🔥 .fire <txt>
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━📥  DOWNLOADER
┃ 🎵 .play <song>        
┃ 🎶 .song <song>
┃ 📸 .instagram <link>   
┃ 📘 .facebook <link>
┃ 🎥 .tiktok <link>
┃ 📹 .video <song>
┃ ▶️ .ytmp4 <link>
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┏━💻  GITHUB
┃ 📂 .git
┃ 🗂️ .github
┃ 📜 .sc
┃ 💾 .script
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

╭━━━〔 ⚡ POWERED BY 𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗫𝗗 ⚡ 〕━━━╮
┃  💠 Fast • 💠 Stable • 💠 Feature Packed
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

Join our channel for updates:`;

    try {
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
        
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363393631540851@newsletter',
                        newsletterName: 'Mastertech-XD',
                        serverMessageId: -1
                    }
                }
            },{ quoted: message });
        } else {
            console.error('Bot image not found at:', imagePath);
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363393631540851@newsletter',
                        newsletterName: 'Mastertech-XD',
                        serverMessageId: -1
                    } 
                }
            });
        }
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: helpMessage });
    }
}

module.exports = helpCommand;
