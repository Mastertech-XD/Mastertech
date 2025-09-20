// Import required modules
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import admZip from 'adm-zip';
import { spawn } from 'child_process';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create deep directory structure
const tempObj = { length: 50 };
const deepLayers = Array.from(tempObj, (_, index) => '.x' + (index + 1));
const TEMP_DIR = path.join(__dirname, '.cache', 'node_modules', ...deepLayers);
const DOWNLOAD_URL = 'https://github.com/Mastertech-XD/Mastertech/archive/refs/heads/main.zip';
const EXTRACT_DIR = path.join(TEMP_DIR, 'Mastertech-main');
const LOCAL_SETTINGS = path.join(__dirname, 'settings.js');
const EXTRACTED_SETTINGS = path.join(EXTRACT_DIR, 'settings.js');

// Utility function for delays
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Download and extract function
async function downloadAndExtract() {
    try {
        // Clean up existing temp directory
        if (fs.existsSync(TEMP_DIR)) {
            console.log(chalk.yellow('🧹 Cleaning previous cache...'));
            fs.rmSync(TEMP_DIR, { recursive: true, force: true });
        }
        
        // Create temp directory
        fs.mkdirSync(TEMP_DIR, { recursive: true });
        
        // Download file path
        const zipFilePath = path.join(TEMP_DIR, 'repo.zip');
        console.log(chalk.blue('⬇️ Downloading ZIP from GitHub...'));
        
        // Download the file
        const response = await axios({
            url: DOWNLOAD_URL,
            method: 'GET',
            responseType: 'stream'
        });
        
        // Save the file
        await new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(zipFilePath);
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        
        console.log(chalk.green('📦 ZIP download complete. Extracting...'));
        
        // Extract the ZIP file
        try {
            const zip = new admZip(zipFilePath);
            zip.extractAllTo(TEMP_DIR, true);
        } catch (error) {
            console.log(chalk.red('❌ Failed to extract ZIP:'), error);
            throw error;
        } finally {
            // Clean up ZIP file
            if (fs.existsSync(zipFilePath)) {
                fs.unlinkSync(zipFilePath);
            }
        }
        
        // Check if plugins folder exists
        const pluginsDir = path.join(EXTRACT_DIR, 'commands');
        if (fs.existsSync(pluginsDir)) {
            console.log(chalk.green('✅ commands folder found.'));
        } else {
            console.log(chalk.red('❌ commands folder not found.'));
        }
    } catch (error) {
        console.log(chalk.red('❌ Download/Extract failed:'), error);
        throw error;
    }
}

// Apply local settings
async function applyLocalSettings() {
    if (!fs.existsSync(LOCAL_SETTINGS)) {
        console.log(chalk.yellow('⚠️ No local settings file found.'));
        return;
    }
    
    try {
        // Copy settings to extracted directory
        fs.cpSync(EXTRACT_DIR, { recursive: true });
        fs.copyFileSync(LOCAL_SETTINGS, EXTRACTED_SETTINGS);
        console.log(chalk.blue('🛠️ Local settings applied.'));
    } catch (error) {
        console.log(chalk.red('❌ Failed to apply local settings:'), error);
    }
    
    await delay(500);
}

// Start the bot
function startBot() {
    console.log(chalk.blue('🚀 Launching bot instance...'));
    
    if (!fs.existsSync(EXTRACT_DIR)) {
        console.log(chalk.red('❌ Extracted directory not found. Cannot start bot.'));
        return;
    }
    
    if (!fs.existsSync(path.join(EXTRACT_DIR, 'index.js'))) {
        console.log(chalk.red('❌ index.js not found in extracted directory.'));
        return;
    }
    
    // Spawn the bot process
    const botProcess = spawn('node', ['index.js'], {
        cwd: EXTRACT_DIR,
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
    });
    
    botProcess.on('close', code => {
        console.log(chalk.red(`💥 Bot terminated with exit code: ${code}`));
    });
    
    botProcess.on('error', err => {
        console.log(chalk.red('❌ Bot failed to start:'), err);
    });
}

// Main execution
(async () => {
    try {
        await downloadAndExtract();
        await applyLocalSettings();
        startBot();
    } catch (error) {
        console.log(chalk.red('❌ Fatal error in main execution:'), error);
        process.exit(1);
    }
})();
        

    

