const { Boom } = require('@hapi/boom');
const fs = require('fs');
const chalk = require('chalk');
const FileType = require('file-type');
const path = require('path');
const axios = require('axios');
const { 
  handleMessages, 
  handleGroupParticipantUpdate, 
  handleStatus 
} = require('./elite');
const PhoneNumber = require('awesome-phonenumber');
const {
  imageToWebp,
  videoToWebp,
  writeExifImg,
  writeExifVid
} = require('./lib/exif');
const {
  smsg,
  isUrl,
  generateMessageTag,
  getBuffer,
  getSizeMedia,
  fetch,
  await,
  sleep,
  reSize
} = require('./lib/myfunc');

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  generateMessageID,
  downloadContentFromMessage,
  jidDecode,
  proto,
  jidNormalizedUser,
  makeCacheableSignalKeyStore,
  delay
} = require('@whiskeysockets/baileys');

const NodeCache = require('node-cache');
const pino = require('pino');
const readline = require('readline');
const { parsePhoneNumber } = require('libphonenumber-js');
const { PHONENUMBER_MCC } = require('libphonenumber-js/metadata');
const { rmSync, existsSync } = require('fs');
const { join } = require('path');

// Store for caching messages and contacts
const store = {
  messages: {},
  contacts: {},
  chats: {},
  groupMetadata: async (jid) => ({}),
  
  bind: function(socket) {
    socket.on('messages.upsert', ({ messages }) => {
      messages.forEach(msg => {
        if (msg.key && msg.key.remoteJid) {
          this.messages[msg.key.remoteJid] = this.messages[msg.key.remoteJid] || {};
          this.messages[msg.key.remoteJid][msg.key.id] = msg;
        }
      });
    });
    
    socket.on('contacts.update', contacts => {
      contacts.forEach(contact => {
        if (contact.id) {
          this.contacts[contact.id] = contact;
        }
      });
    });
    
    socket.on('chats.set', chats => {
      this.chats = chats;
    });
  },
  
  loadMessage: async (jid, id) => {
    return this.messages[jid]?.[id] || null;
  }
};

// Configuration
let phoneNumber = process.env.PHONE_NUMBER;
let owner = JSON.parse(fs.readFileSync('./data/owner.json'));
global.botname = 'MASTERTECH-XD BOT';
global.themeemoji = '•';

const settings = require('./settings');
const pairingCode = !!phoneNumber || process.argv.includes('--pairing-code');
const useMobile = process.argv.includes('--mobile');

// Readline interface for CLI input
const rl = process.stdin.isTTY ? readline.createInterface({
  input: process.stdin,
  output: process.stdout
}) : null;

const question = (text) => {
  if (rl) {
    return new Promise(resolve => rl.question(text, resolve));
  }
  return Promise.resolve(settings.number || phoneNumber);
};

async function startBot() {
  try {
    // Get latest Baileys version
    const { version, isLatest } = await fetchLatestBaileysVersion();
    
    // Auth state
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    
    // Cache
    const msgRetryCounterCache = new NodeCache();
    
    // Logger
    const logger = pino({ level: 'silent' });
    const childLogger = pino({ level: 'error' });
    
    // Create WhatsApp socket
    const sock = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: !pairingCode,
      browser: ['Chrome', 'Ubuntu', '20.0.04'],
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, childLogger)
      },
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      getMessage: async (key) => {
        const jid = jidNormalizedUser(key.remoteJid);
        const msg = await store.loadMessage(jid, key.id);
        return msg?.message || '';
      },
      msgRetryCounterCache,
      defaultQueryTimeoutMs: undefined
    });
    
    // Bind store to socket events
    store.bind(sock.ev);
    
    // Handle connection updates
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;
      
      if (connection === 'close') {
        console.log(chalk.yellow('Connection closed'));
        console.log(chalk.red(`Last disconnect: ${JSON.stringify(sock.user, null, 2)}`));
        
        // Reconnect if not a logout
        if (lastDisconnect?.error?.output?.statusCode !== 401) {
          startBot();
        }
      } else if (connection === 'open') {
        console.log(chalk.green('Bot connected successfully! ✓'));
        
        // Follow newsletters
        const newsletters = [
          '120363419136706156@newsletter',
          '120363402507750390@newsletter',
          '120363420267586200@newsletter'
        ];
        
        const followed = [];
        const failed = [];
        
        for (const newsletter of newsletters) {
          try {
            await sock.newsletterFollow(newsletter);
            followed.push(newsletter);
          } catch (err) {
            failed.push(newsletter);
            console.error(`❌ Failed to follow ${newsletter}:`, err.message || err);
          }
        }
        
        // Join groups
        const groups = ['120363402507750390@g.us'];
        const joined = [];
        const failedGroups = [];
        
        for (const group of groups) {
          try {
            await sock.groupAcceptInvite(group);
            joined.push(group);
          } catch (err) {
            failedGroups.push(group);
            console.error(`❌ Failed to join group ${group}:`, err.message || err);
          }
        }
        
        // Send connection success message
        const summary = [
          '📡 Newsletter Follow Summary',
          `✅ Followed: ${followed.length}`,
          `❌ Failed: ${failed.length}`,
          ...followed.map(n => `• ${n}`),
          '',
          '👥 Group Join Summary',
          `✅ Joined: ${joined.length}`,
          `❌ Failed: ${failedGroups.length}`,
          ...joined.map(g => `• ${g}`)
        ].join('\n');
        
        await sock.sendMessage(
          sock.user.id.split(':')[0] + '@s.whatsapp.net',
          {
            text: `🤖 *ZENTHRA BOT Connected Successfully!*\n\n⏰ Time: ${new Date().toLocaleString()}\n\n${summary}\n\n`
          }
        );
        
        console.log(chalk.yellow('\n\n=== BOT INFORMATION ===\n'));
        console.log(chalk.white(`• YT CHANNEL: Mastertech`));
        console.log(chalk.white(`• GITHUB: elite`));
        console.log(chalk.white(`• OWNER: ${owner}`));
        console.log(chalk.white(`• CREDIT: MR MASTERPEACE ELITE`));
        console.log(chalk.green('\n✅ Status: Online and Ready!\n'));
      }
    });
    
    // Save credentials when updated
    sock.ev.on('creds.update', saveCreds);
    
    // Handle group participant updates
    sock.ev.on('group-participants.update', async (update) => {
      await handleGroupParticipantUpdate(sock, update);
    });
    
    // Handle status updates
    sock.ev.on('status.update', async (update) => {
      if (update.status) {
        await handleStatus(sock, update);
      }
    });
    
    // Handle messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      try {
        const msg = messages[0];
        if (!msg.message) return;
        
        // Handle status broadcasts
        if (msg.key.remoteJid === 'status@broadcast') {
          await handleStatus(sock, { messages: [msg] });
          return;
        }
        
        // Handle normal messages
        await handleMessages(sock, { messages: [msg] }, true);
      } catch (err) {
        console.error('Error in messages.upsert:', err);
      }
    });
    
    // Request pairing code if needed
    if (pairingCode && !sock.authState.creds.registered) {
      if (useMobile) {
        throw new Error('Cannot use pairing code with mobile API');
      }
      
      let phoneNumberInput;
      if (global.ownerNumber) {
        phoneNumberInput = global.ownerNumber;
      } else {
        phoneNumberInput = await question(
          chalk.blue('Please type your WhatsApp number\nFormat: 2547...... (without + or spaces): ')
        );
      }
      
      phoneNumberInput = phoneNumberInput.replace(/[^0-9]/g, '');
      if (!phoneNumberInput.startsWith('263') && !phoneNumberInput.startsWith('91')) {
        phoneNumberInput = '263' + phoneNumberInput;
      }
      
      setTimeout(async () => {
        try {
          let code = await sock.requestPairingCode(phoneNumberInput);
          code = code?.match(/.{1,4}/g)?.join('-') || code;
          console.log(chalk.green('Your Pairing Code:'), chalk.black(chalk.bgGreen(code)));
          console.log(chalk.yellow('\nPlease enter this code in your WhatsApp app:'));
          console.log(chalk.white(`
1. Open WhatsApp
2. Go to Settings > Linked Devices
3. Tap "Link a Device"
4. Enter the code shown above
`));
        } catch (err) {
          console.error(chalk.red('Error requesting pairing code:'), err);
          console.log(chalk.yellow('Failed to get pairing code. Please check your phone number and try again.'));
        }
      }, 3000);
    }
    
    return sock;
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

// Start the bot
startBot()
  .catch(err => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });

// Handle process events
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', err => {
  console.error('Unhandled Rejection:', err);
});

// Watch for file changes and reload
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Updated ${__filename}`));
  delete require.cache[file];
  require(file);
});
