const config = {
    name: "join",
    aliases: [""],
    description: "Join a selected thread from the available threads.",
    usage: "[number]",
    cooldown: 3,
    permissions: [2],
    credits: "Coffee",
};

async function getAvailableThreads(threadID) {
    const { Threads } = global.controllers;
    const availableThreads = [];

    try {
        const threads = await Threads.getAll();
        for (const thread of threads) {
            if (thread.threadID !== threadID) {
                const membersLength = thread.info?.members?.length || 0;
                availableThreads.push({
                    threadID: thread.threadID,
                    name: thread.info.name || thread.threadID,
                    membersLength,
                    info: thread.info,
                });
            }
        }
    } catch (error) {
        console.error('Error fetching threads:', error);
    }

    return availableThreads;
}

async function replyHandler({ eventData, message }) {
    const { body, senderID } = message;
    const availableThreads = eventData.availableThreads;

    const selectedNumber = parseInt(body, 10) - 1;

    if (isNaN(selectedNumber) || selectedNumber < 0 || selectedNumber >= availableThreads.length) {
        return message.reply("Invalid selection. Please reply with a valid number.");
    }

    const selectedThread = availableThreads[selectedNumber];

    if (!senderID) {
        return message.reply("⚠️ Could not retrieve your user ID.");
    }

    const isAlreadyMember = selectedThread.info.members.some(member => member.userID === senderID);

    if (isAlreadyMember) {
        return message.reply(`⚠️ You are already a member of the thread "${selectedThread.name}". You cannot join again.`);
    }

    if (selectedThread.membersLength >= 250) {
        return message.reply(`⚠️ You can't be added to the thread "${selectedThread.name}" as it is already full.`);
    }

    try {
        await global.api.addUserToGroup(senderID, selectedThread.threadID);
        await message.reply(`You have been added to the thread: ${selectedThread.name}`);
        await message.react("✔️");
    } catch (error) {
        console.error('Error adding user:', error);
        await message.react("✖️");
    }
}

async function onCall({ message, args }) {
    const { api } = global;
    const { senderID, threadID } = message;

    const availableThreads = await getAvailableThreads(threadID);

    if (availableThreads.length === 0) {
        return message.reply("No available threads to join.");
    }

    const threadListMessage = `𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n╭─╮\n` +
        availableThreads.map((thread, index) => 
            `│${index + 1}. ${thread.name}\n` +
            `│𝐓𝐈𝐃: ${thread.threadID}\n` +
            `│𝐓𝐨𝐭𝐚𝐥 𝐦𝐞𝐦𝐛𝐞𝐫𝐬: ${thread.membersLength}\n` +
            (index === availableThreads.length - 1 ? '' : '│')).join('\n') +
        `╰───────────ꔪ\n` +
        `𝐌𝐚𝐱𝐢𝐦𝐮𝐦 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 = 250\n` +
        `𝐎𝐯𝐞𝐫𝐚𝐥𝐥 𝐔𝐬𝐞𝐫𝐬 = ${getTotalUsers(availableThreads)}`;

    await message.reply(`${threadListMessage}\n\nReply to this message with the number of the group you want to join (1, 2, 3, 4...).`).then(msg => {
        msg.addReplyEvent({ callback: replyHandler, type: "message", availableThreads });
    });

    await message.react("🕰️");
}

function getTotalUsers(threads) {
    return threads.reduce((acc, thread) => acc + thread.membersLength, 0);
}

export default {
    config,
    onCall,
};
