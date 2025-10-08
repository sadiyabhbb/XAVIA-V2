import fs from "fs";
import path from "path";

const config = {
  name: "cmd",
  aliases: ["command", "module"],
  version: "1.0.0",
  credits: "Sathi x GPT-5",
  description: "Manage bot commands dynamically (install, load, loadall)",
  usage: "cmd <install/load/loadall> [filename]",
  cooldowns: 3,
  category: "system"
};

const langData = {
  "en_US": {
    "install.usage": "⚙️ Usage: cmd install <file.js>",
    "install.exists": "⚠️ The command '{name}' already exists. React ✅ to reinstall.",
    "install.success": "✅ Installed command '{name}' successfully!",
    "install.error": "❌ Failed to install: {error}",
    "load.success": "🔁 Command '{name}' reloaded successfully!",
    "load.error": "❌ Error loading '{name}': {error}",
    "loadall.start": "♻️ Reloading all commands...",
    "loadall.done": "✅ All commands reloaded successfully!",
    "invalid.action": "❌ Invalid action. Use: install | load | loadall"
  }
};

async function installCommand({ message, args, getLang }) {
  const fileName = args[1];
  if (!fileName) return message.reply(getLang("install.usage"));

  const srcPath = path.resolve(fileName);
  const destDir = path.join(process.cwd(), "commands");
  const destPath = path.join(destDir, path.basename(fileName));

  try {
    if (!fs.existsSync(srcPath)) {
      return message.reply(`❌ File not found: ${srcPath}`);
    }

    if (fs.existsSync(destPath)) {
      return message.reply(getLang("install.exists", { name: path.basename(fileName) }))
        .then(d => {
          d.addReactEvent({
            callback: handleReactInstall,
            author: message.senderID,
            data: { srcPath, destPath }
          }, 30000);
        });
    }

    fs.copyFileSync(srcPath, destPath);
    message.reply(getLang("install.success", { name: path.basename(fileName) }));
  } catch (err) {
    message.reply(getLang("install.error", { error: err.message }));
  }
}

async function handleReactInstall({ message, eventData }) {
  const { srcPath, destPath } = eventData;
  try {
    fs.copyFileSync(srcPath, destPath);
    message.send(`✅ Reinstalled command: ${path.basename(destPath)}`);
  } catch (err) {
    message.send(`❌ Failed reinstall: ${err.message}`);
  }
}

async function loadCommand({ message, args, getLang }) {
  const name = args[1];
  if (!name) return message.reply("⚙️ Usage: cmd load <filename.js>");

  const cmdPath = path.join(process.cwd(), "commands", name);
  if (!fs.existsSync(cmdPath)) return message.reply(`❌ Command not found: ${name}`);

  try {
    delete require.cache[require.resolve(cmdPath)];
    await import(cmdPath + `?update=${Date.now()}`);
    message.reply(getLang("load.success", { name }));
  } catch (err) {
    message.reply(getLang("load.error", { name, error: err.message }));
  }
}

async function loadAllCommands({ message, getLang }) {
  try {
    message.reply(getLang("loadall.start"));
    const commandsDir = path.join(process.cwd(), "commands");
    const files = fs.readdirSync(commandsDir).filter(f => f.endsWith(".js"));

    for (const file of files) {
      const filePath = path.join(commandsDir, file);
      delete require.cache[require.resolve(filePath)];
      await import(filePath + `?reload=${Date.now()}`);
    }

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

export default {
  config,
  langData,
  onCall,
};
