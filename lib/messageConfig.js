// WhatsApp Metadata Manipulation Tool
const channelInfo = {
  contextInfo: {
    forwardingScore: 999, // Artificially inflated
    isForwarded: true, // Forces "forwarded" label
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363393631540851@newsletter", // Your provided JID
      newsletterName: "Mastertech-XD", // Custom channel name
      serverMessageId: 999 // Fake high-priority ID
    }
  }
};

module.exports = { channelInfo };