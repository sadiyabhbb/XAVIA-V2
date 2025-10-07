import axios from "axios";

const apiUrl = "https://nix-baby-apis.vercel.app";
const nix = ["😚", "Yes 😀, I am here", "What's up?", "Bolo jaan ki korte panmr jonno"];

const getRand = () => nix[Math.floor(Math.random() * nix.length)];

const config = {
  name: "bby",
  aliases: ["baby"],
  version: "0.0.1",
  credits: "ArYAN",
  permissions: [0],
  cooldowns: 0,
  description: "AI chat bot with learning",
  usage: "[msg] | teach [msg] - [reply] | remove [msg] | list",
  category: "ai"
};

async function handleReply(message, text) {
  try {
    const res = await axios.get(`${apiUrl}/baby?text=${encodeURIComponent(text)}&senderID=${message.senderID}&font=1`);
    const aryan = res?.data?.reply;
    if (aryan) {
      message.reply(aryan).then(d => {
        d.addReplyEvent({
          callback: async ({ message: m }) => {
            if (!m.body) return;
            handleReply(m, m.body.toLowerCase());
          },
          author: message.senderID
        });
      });
    } else {
      message.reply("❌ | No response found. Please teach me!");
    }
  } catch (e) {
    console.error(e);
    message.reply("❌ | Failed to fetch reply.");
  }
}

async function onCall({ message, args, data }) {
  const { Users } = global.controllers;
  if (!message.body) return;
  const txt = args.join(" ").trim();
  const uid = message.senderID;

  try {
    if (!txt) {
      return message.reply(getRand());
    }

    if (args[0] === "remove") {
      const key = txt.slice(7).trim();
      const res = await axios.get(`${apiUrl}/baby-remove?key=${encodeURIComponent(key)}`);
      return message.reply(res.data.message || "Removed");
    }

    if (args[0] === "rm" && txt.includes("-")) {
      const [key, repOrIdx] = txt.slice(3).split(/\s*-\s*/);
      if (!key || repOrIdx === undefined) {
        return message.reply("❌ | Use: rm [msg] - [reply/index]");
      }
      const param = !isNaN(parseInt(repOrIdx)) ? `index=${encodeURIComponent(repOrIdx)}` : `reply=${encodeURIComponent(repOrIdx)}`;
      const res = await axios.get(`${apiUrl}/baby-remove?key=${encodeURIComponent(key)}&${param}`);
      return message.reply(res.data.message || "Removed");
    }

    if (args[0] === "list") {
      if (args[1] === "all") {
        const tRes = await axios.get(`${apiUrl}/teachers`);
        const teachers = tRes.data.teachers || {};
        const sorted = Object.keys(teachers).sort((a, b) => teachers[b] - teachers[a]);
        const list = await Promise.all(sorted.map(async id => {
          const userName = data?.user?.info?.name || await Users.getName(id).catch(() => id);
          return `• ${userName}: ${teachers[id]}`;
        }));
        return message.reply(`👑 | Teachers:\n${list.join("\n")}`);
      } else {
        const infoRes = await axios.get(`${apiUrl}/baby-info`);
        return message.reply(
          `❇️ | Total Teach = ${infoRes.data.totalKeys || "api off"}\n♻️ | Total Response = ${infoRes.data.totalReplies || "api off"}`
        );
      }
    }

    if (args[0] === "edit") {
      const parts = txt.split(/\s*-\s*/);
      if (parts.length < 2) {
        return message.reply("❌ | Use: edit [msg] - [newReply]");
      }
      const oldMsg = parts[0].replace("edit ", "");
      const newMsg = parts[1];
      const res = await axios.get(`${apiUrl}/baby-edit?key=${encodeURIComponent(oldMsg)}&replace=${encodeURIComponent(newMsg)}&senderID=${uid}`);
      return message.reply(res.data.message || "Edited");
    }

    if (args[0] === "teach" && args[1] === "react") {
      const [comd, cmd] = txt.split(/\s*-\s*/);
      const final = comd.replace("teach react ", "");
      if (!cmd) {
        return message.reply("❌ | Invalid format!");
      }
      try {
        const res = await axios.get(`${apiUrl}/baby?teach=${encodeURIComponent(final)}&react=${encodeURIComponent(cmd)}`);
        return message.reply(`✅ Replies added ${res.data.message}`);
      } catch (error) {
        if (error.response && error.response.status === 400 && error.response.data.message === "Bad word not allowed") {
          return message.reply("❌ | Bad word not allowed!");
        }
        throw error;
      }
    }

    if (args[0] === "teach") {
      const [comd, cmd] = txt.split(/\s*-\s*/);
      const final = comd.replace("teach ", "");
      if (!cmd) {
        return message.reply("❌ | Invalid format!");
      }

      try {
        const res = await axios.get(`${apiUrl}/baby?teach=${encodeURIComponent(final)}&reply=${encodeURIComponent(cmd)}&senderID=${uid}`);
        const teacher = data?.user?.info?.name || await Users.getName(uid).catch(() => uid);

        if (res.data.message === "This reply has already been taught for this question." || res.data.addedReplies?.length === 0) {
          return message.reply(`❌ | This reply has already been taught for this question.\nTeacher: ${teacher}\nReply: ${cmd}`);
        }

        const teachsRes = await axios.get(`${apiUrl}/teachers`);
        const teachCount = teachsRes.data.teachers[uid] || 0;

        const addedReplies = res.data.addedReplies?.join(", ") || cmd;
        return message.reply(`✅ | Replies added "${addedReplies}" added to "${final}".\nTeacher: ${teacher}\nTeachs: ${teachCount}`);
      } catch (error) {
        if (error.response && error.response.status === 400 && error.response.data.message === "Bad word not allowed") {
          return message.reply("❌ | Bad word not allowed!");
        }
        throw error;
      }
    }

    handleReply(message, txt);
  } catch (e) {
    console.error(e);
    message.reply("❌ | Something went wrong.");
  }
}

export default {
  config,
  onCall
};
