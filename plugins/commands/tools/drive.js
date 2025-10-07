import axios from "axios";

const u = "http://65.109.80.126:20409/aryan/drive";

const config = {
  name: "drive",
  version: "0.0.1",
  credits: "ArYAN",
  permissions: [0],
  cooldowns: 5,
  description: "Upload videos to Google Drive easily!",
  usage: "<link> or reply to video",
  category: "utility"
};

async function onCall({ message, args }) {
  const i = message.type === "message_reply" && message.messageReply?.attachments?.[0]?.url || args[0];

  if (!i) return message.reply("⚠️ Please provide a valid video URL or reply to a media message.");

  try {
    const r = await axios.get(`${u}?url=${encodeURIComponent(i)}`);
    const d = r.data || {};

    const l = d.driveLink || d.driveLIink;
    if (l) return message.reply(`✅ File uploaded to Google Drive!\n\n🔗 URL: ${l}`);

    const e = d.error || JSON.stringify(d) || "❌ Failed to upload the file.";
    return message.reply(`Upload failed: ${e}`);
  } catch (e) {
    console.error("Upload Error:", e.message || e);
    return message.reply("❌ An error occurred during upload. Please try again later.");
  }
}

export default {
  config,
  onCall
};
