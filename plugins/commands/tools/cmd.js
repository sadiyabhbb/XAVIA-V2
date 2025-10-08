import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const config = {
  name: "cmd",
  aliases: ["command", "module"],
  version: "1.0.3",
  credits: "Sathi x GPT-5",
  description: "Install, reload or reload all commands dynamically",
  usage: "cmd <install|load|loadall> [filename]",
  cooldowns: 3,
  category: "system"
};

const langData = {
  "en_US": {
    "install.usage": "⚙️ Usage: cmd install <path/to/file.js>",
    "install.exists": "⚠️ Command '{name}' already exists. React ✅ to overwrite.",
    "install.success": "✅ Installed command '{name}' successfully!",
    "install.error": "❌ Installation failed: {error}",
    "load.success": "🔁 Reloaded command '{name}' successfully!",
    "load.error": "❌ Failed to load '{name}': {error}",
    "loadall.start": "♻️ Reloading all plugin commands...",
    "loadall.done": "✅ All plugin commands reloaded!",
    "invalid.action": "❌ Invalid action. Use install | load | loadall"
  }
};

const pluginsDir = path.join(process.cwd(), "plugins", "commands");

function ensureCommandsDir() {
  if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true });
}

async function installCommand({ message, args, getLang }) {
  const src = args[1];
  if (!src) return message.reply(getLang("install.usage"));

  const srcPath = path.resolve(src);
  const fileName = path.basename(srcPath);
  const destPath = path.join(pluginsDir, fileName);

  try {
    ensureCommandsDir();

    if (!fs.existsSync(srcPath))
      return message.reply(`❌ File not found: ${srcPath}`);

    if (fs.existsSync(destPath)) {
      return message.reply(getLang("install.exists", { name: fileName })).then(m =>
        m.addReactEvent({
          callback: handleReactInstall,
          author: message.senderID,
          data: { srcPath, destPath }
        }, 30000)
      );
    }

    fs.copyFileSync(srcPath, destPath);
    message.reply(getLang("install.success", { name: fileName }));
  } catch (err) {
    message.reply(getLang("install.error", { error: err.message }));
  }
}

async function handleReactInstall({ message, eventData }) {
  const { srcPath, destPath } = eventData;
  try {
    fs.copyFileSync(srcPath, destPath);
    message.send(`✅ Overwritten & reinstalled: ${path.basename(destPath)}`);
  } catch (err) {
    message.send(`❌ Failed reinstall: ${err.message}`);
  }
}

async function loadCommand({ message, args, getLang }) {
  const name = args[1];
  if (!name) return message.reply("⚙️ Usage: cmd load <file.js>");

  const cmdPath = path.join(pluginsDir, name);
  if (!fs.existsSync(cmdPath))
    return message.reply(`❌ Command not found: ${name}`);

  try {
    // reload dynamically
    const fileUrl = pathToFileURL(cmdPath).href + `?v=${Date.now()}`;
    await import(fileUrl);
    message.reply(getLang("load.success", { name }));
  } catch (err) {
    message.reply(getLang("load.error", { name, error: err.message }));
  }
}

async function loadAllCommands({ message, getLang }) {
  try {
    ensureCommandsDir();
    message.reply(getLang("loadall.start"));

    const scanDir = async (dir) => {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        const full = path.join(dir, f);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) await scanDir(full);
        else if (f.endsWith(".js")) {
          const fileUrl = pathToFileURL(full).href + `?reload=${Date.now()}`;
          await import(fileUrl).catch(e =>
            console.log(`❌ Failed to load '${f}': ${e.message}`)
          );
        }
      }
    };

    await scanDir(pluginsDir);
    message.reply(getLang("loadall.done"));
  } catch (err) {
    message.reply(`❌ Failed to load all: ${err.message}`);
  }
}

async function onCall({ message, args, getLang }) {
  const action = args[0];
  if (!action) return message.reply(getLang("invalid.action"));

  if (action === "install") return installCommand({ message, args, getLang });
  if (action === "load") return loadCommand({ message, args, getLang });
  if (action === "loadall") return loadAllCommands({ message, getLang });

  message.reply(getLang("invalid.action"));
}

export default { config, langData, onCall };
