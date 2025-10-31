// MASTERTECH-XD Setup Script (Windows-safe version)
// ✅ Downloads bot, extracts it, installs dependencies, and runs the bot's index.js

import fs from "fs";
import path from "path";
import axios from "axios";
import AdmZip from "adm-zip";
import { exec } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === CONFIGURATION ===
const GITHUB_URL = "https://github.com/Mastertech-XD/MASTERTECH-XD-V1/archive/refs/heads/main.zip";
const TEMP_DIR = path.join(__dirname, "temp_download");
const EXTRACT_DIR = path.join(TEMP_DIR, "MASTERTECH-XD-V1-main");

// === UTIL FUNCTIONS ===
function log(msg) {
  console.log(msg);
}

async function downloadBot() {
  log("⬇️  Downloading bot from GitHub...");
  const response = await axios.get(GITHUB_URL, { responseType: "arraybuffer" });
  const zipPath = path.join(TEMP_DIR, "bot.zip");
  fs.writeFileSync(zipPath, response.data);
  log("📦 Download complete. Extracting...");

  const zip = new AdmZip(zipPath);
  zip.extractAllTo(TEMP_DIR, true);
  fs.unlinkSync(zipPath);
  log("✅ Extraction completed successfully");
}

async function installDependencies(dir) {
  return new Promise((resolve, reject) => {
    log("📦 Installing dependencies...");
    exec("npm install", { cwd: dir, shell: true, windowsHide: false }, (error) => {
      if (error) {
        console.error("❌ npm install failed:", error.message);
        reject(error);
      } else {
        log("✅ Dependencies installed successfully");
        resolve();
      }
    });
  });
}

async function copyLocalSettings(targetDir) {
  const localFiles = ["config.json", "settings.json", ".env"];
  localFiles.forEach((file) => {
    const src = path.join(__dirname, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(targetDir, file));
    }
  });
  log("⚙️ Local settings copied successfully.");
}

async function startBot(dir) {
  log("🚀 Starting bot...");
  const botFile = path.join(dir, "index.js"); // 👈 run bot's index.js instead of main.js
  if (!fs.existsSync(botFile)) {
    console.error("❌ Bot index.js not found in extracted folder!");
    process.exit(1);
  }

  const bot = exec("node index.js", { cwd: dir, shell: true });

  bot.stdout.on("data", (data) => process.stdout.write(data));
  bot.stderr.on("data", (data) => process.stderr.write(data));

  bot.on("exit", (code) => {
    log(`💀 Bot exited with code: ${code}`);
    if (code !== 0) {
      log("🔁 Restarting bot in 10 seconds...");
      setTimeout(() => startBot(dir), 10000);
    }
  });
}

async function main() {
  try {
    log("🧩 Initializing setup...");
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
      log("🧹 Cleaning previous temporary files...");
    }

    fs.mkdirSync(TEMP_DIR, { recursive: true });
    await downloadBot();
    await copyLocalSettings(EXTRACT_DIR);
    await installDependencies(EXTRACT_DIR);
    log("✅ Setup complete.");
    await startBot(EXTRACT_DIR);
  } catch (err) {
    console.error("🔥 Fatal error during setup:", err);
  }
}

main();
