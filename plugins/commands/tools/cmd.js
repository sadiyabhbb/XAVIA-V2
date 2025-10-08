import fs from "fs";
import path from "path";

const config = {
  name: "cmd",
  aliases: ["command"],
  version: "2.0.0",
  credits: "Sathi & GPT-5",
  description: "Manage command files — install, load single, or load all commands easily",
  usage: "/cmd [install|load|loadall] [file]",
  cooldowns: 3,
  category: "tools",
};

const langData = {
  "bn_BD": {
    "cmd.notfound": "❌ ফাইল খুঁজে পাওয়া যায়নি: {file}",
    "cmd.exists": "⚠️ এই কমান্ড আগে থেকেই আছে! আপনি কি আবার install করতে চান?",
    "cmd.installed": "✅ {file} সফলভাবে install হয়েছে!",
    "cmd.loading": "♻️ সব কমান্ড reload করা হচ্ছে...",
    "cmd.loaded": "✅ সব কমান্ড লোড সম্পন্ন!",
    "cmd.singleload": "✅ {file} সফলভাবে load হয়েছে!",
    "cmd.invalid": "❌ ভুল ব্যবহার! উদাহরণ: /cmd install ck.js বা /cmd loadall",
  }
};

// 🔍 Recursive file finder
function findFile(fileName, dirPath = process.cwd()) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const found = findFile(fileName, fullPath);
      if (found) return found;
    } else if (file === fileName) {
      return fullPath;
    }
  }
  return null;
}

// 🧠 Load all commands
async function loadAllCommands(message, getLang) {
  try {
    const commandsPath = path.join(process.cwd(), "plugins", "commands");
    const files = [];

    const traverse = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const full = path.join(dir, item);
        if (fs.statSync(full).isDirectory()) traverse(full);
        else if (item.endsWith(".js")) files.push(full);
      }
    };

    traverse(commandsPath);
    for (const file of files) {
      delete import.cache?.[import.resolve(file)];
      await import(`file://${file}`);
    }

    await message.reply(getLang("cmd.loaded"));
  } catch (err) {
    await message.reply("❌ লোড করতে ব্যর্থ: " + err.message);
  }
}

// 🧩 Command entry point
async function onCall({ message, args, getLang }) {
  if (!args[0]) return message.reply(getLang("cmd.invalid"));

  const action = args[0].toLowerCase();
  const fileArg = args[1];

  if (action === "install") {
    if (!fileArg) return message.reply(getLang("cmd.invalid"));

    const filePath = findFile(fileArg);
    if (!filePath) return message.reply(getLang("cmd.notfound", { file: fileArg }));

    const targetDir = path.join(process.cwd(), "plugins", "commands", "tools");
    const targetPath = path.join(targetDir, path.basename(filePath));

    if (fs.existsSync(targetPath)) {
      const msg = await message.reply(getLang("cmd.exists"));
      return msg.addReactEvent({
        author_only: true,
        callback: async ({ reaction }) => {
          if (reaction === "✅") {
            fs.copyFileSync(filePath, targetPath);
            await message.reply(getLang("cmd.installed", { file: path.basename(fileArg) }));
            await loadAllCommands(message, getLang);
          }
        },
      });
    }

    fs.copyFileSync(filePath, targetPath);
    await message.reply(getLang("cmd.installed", { file: path.basename(fileArg) }));
    await loadAllCommands(message, getLang);

  } else if (action === "loadall") {
    await message.reply(getLang("cmd.loading"));
    await loadAllCommands(message, getLang);

  } else if (action === "load") {
    if (!fileArg) return message.reply(getLang("cmd.invalid"));

    const filePath = findFile(fileArg);
    if (!filePath) return message.reply(getLang("cmd.notfound", { file: fileArg }));

    delete import.cache?.[import.resolve(filePath)];
    await import(`file://${filePath}`);
    await message.reply(getLang("cmd.singleload", { file: path.basename(fileArg) }));

  } else {
    await message.reply(getLang("cmd.invalid"));
  }
}

export default {
  config,
  langData,
  onCall,
};
