async function groupInfoCommand(sock, chatId, msg) {
    try {
        // Get group metadata
        const groupMetadata = await sock.groupMetadata(chatId);
        
        // Get group profile picture
        let pp;
        try {
            pp = await sock.profilePictureUrl(chatId, 'image');
        } catch {
            pp = 'https://i.imgur.com/2wzGhpF.jpeg'; // Default image
        }

        // Get admins from participants
        const participants = groupMetadata.participants;
        const groupAdmins = participants.filter(p => p.admin);
        const listAdmin = groupAdmins.map((v, i) => `${i + 1}. @${v.id.split('@')[0]}`).join('\n');
        
        // Get group owner
        const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || chatId.split('-')[0] + '@s.whatsapp.net';

        // Create info text
        const text = `
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃          🌟 *MASTERTECH-XD* 🌟         ┃
┃           🚀 *GROUP ANALYSIS* 🚀        ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🔮 *Basic Information:*
├─ 🆔 *Group ID:* 
│  └─ \`\`\`${groupMetadata.id}\`\`\`
├─ 📛 *Group Name:* 
│  └─ *${groupMetadata.subject}*
├─ 📅 *Created:* 
│  └─ ${new Date(groupMetadata.creation * 1000).toLocaleString()}
├─ 📜 *Description:*
│  └─ ${groupMetadata.desc?.toString() || 'No description'}

👥 *Member Statistics:*
├─ 🧑‍🤝‍🧑 *Total Members:* ${participants.length}
├─ 👑 *Owner:* @${owner.split('@')[0]}
├─ 🛡️ *Admins (${groupAdmins.length}):*
│  └─ ${listAdmin.split(',').map(admin => `@${admin.split('@')[0]}`).join(', ')}

📊 *Activity Insights:*
├─ 💬 *Last Message:* 
│  └─ ${groupMetadata.lastMsgTime ? new Date(groupMetadata.lastMsgTime * 1000).toLocaleString() : 'N/A'}
├─ 🔔 *Announcement:* 
│  └─ ${groupMetadata.announce ? '✅ Enabled' : '❌ Disabled'}
└─ 🔒 *Restricted:* 
   └─ ${groupMetadata.restrict ? '✅ Yes' : '❌ No'}

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  *🔍 Powered by MASTERTECH-XD v1.0.0*  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
`.trim();

// Send with premium styling
await sock.sendMessage(chatId, {
    image: { url: pp },
    caption: text,
    mentions: [...groupAdmins.map(v => v.id), owner],
    contextInfo: {
        forwardingScore: 999,
        isForwarded: false
    }
});


    } catch (error) {
        console.error('Error in groupinfo command:', error);
        await sock.sendMessage(chatId, { text: 'Failed to get group info!' });
    }
}

module.exports = groupInfoCommand; 