import { join } from "path";
import axios from "axios";
import fs from "fs";

const config = {
    name: "video",
    aliases: ['play', 'yt2mp4'],
    version: "1.0.7",
    description: "Play video from YouTube",
    usage: '<keyword/url>',
    cooldown: 5,
    credits: "XaviaTeam"//fixed by team 
}

const langData = {
    "en_US": {
        "video.missingArguement": "Please provide keyword or url",
        "video.noResult": "No results found",
        "video.invalidUrl": "Invalid YouTube URL",
        "video.invaldIndex": "Invalid selection",
        "video.error": "Error occurred",
        "video.downloading": "Downloading video...",
        "video.choose": "Choose a video (reply with number):"
    },
    "vi_VN": {
        "video.missingArguement": "Vui lòng nhập từ khóa hoặc URL",
        "video.noResult": "Không tìm thấy kết quả",
        "video.invalidUrl": "URL YouTube không hợp lệ",
        "video.invaldIndex": "Lựa chọn không hợp lệ",
        "video.error": "Đã xảy ra lỗi",
        "video.downloading": "Đang tải video...",
        "video.choose": "Chọn video (trả lời bằng số):"
    },
    "ar_SY": {
        "video.missingArguement": "يرجى إدخال كلمة أو رابط",
        "video.noResult": "لا توجد نتائج",
        "video.invalidUrl": "رابط يوتيوب غير صالح",
        "video.invaldIndex": "اختيار غير صالح",
        "video.error": "حدث خطأ",
        "video.downloading": "جارٍ تنزيل الفيديو...",
        "video.choose": "اختر فيديو (رد بالرقم):"
    }
}

async function downloadFile(url, path) {
    const writer = fs.createWriteStream(path);
    const response = await axios({url, method: 'GET', responseType: 'stream'});
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

async function playVideo(message, video, getLang) {
    if (!video?.url) return message.reply(getLang("video.error"));
    
    message.react("⏳");
    const cachePath = join(global.cachePath, `_ytvideo${Date.now()}.mp4`);
    
    try {
        const downloadUrl = `https://yt-video-production.up.railway.app/ytdlv3?url=${encodeURIComponent(video.url)}`;
        const response = await axios.get(downloadUrl);
        
        if (!response?.data?.download_url) throw new Error("No download URL");
        
        await message.reply(getLang("video.downloading"));
        await downloadFile(response.data.download_url, cachePath);
        
        if (!fs.existsSync(cachePath)) throw new Error("Download failed");
        
        await message.reply({
            body: video.title || "no title.",
            attachment: fs.createReadStream(cachePath)
        });
        message.react("✅");
    } catch (err) {
        message.react("❌");
        console.error(err);
        message.reply(getLang("video.error"));
    } finally {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }
}

async function chooseVideo({ message, eventData, getLang }) {
    const { videos } = eventData;
    const index = parseInt(message.body) - 1;
    if (isNaN(index) || index < 0 || index >= videos.length) return message.reply(getLang("video.invaldIndex"));
    await playVideo(message, videos[index], getLang);
}

async function searchVideos(keyword) {
    try {
        const searchUrl = `https://rapido.zetsu.xyz/api/ytsearch?query=${encodeURIComponent(keyword)}`;
        const response = await axios.get(searchUrl);
        return response.data?.data || [];
    } catch (err) {
        console.error(err);
        return [];
    }
}

async function downloadThumbnail(url) {
    if (!url) return null;
    const path = join(global.cachePath, `_ytthumb${Date.now()}.jpg`);
    try {
        await downloadFile(url, path);
        return fs.createReadStream(path);
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function onCall({ message, args, getLang }) {
    try {
        if (!args[0]) return message.reply(getLang("video.missingArguement"));
        
        const input = args.join(" ");
        if (input.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
            return await playVideo(message, {url: input, title: "YouTube Video"}, getLang);
        }
        
        const videos = await searchVideos(input);
        if (!videos.length) return message.reply(getLang("video.noResult"));
        
        const thumbnails = await Promise.all(videos.slice(0, 10).map(v => downloadThumbnail(v.imgSrc)));
        const formattedList = videos.slice(0, 6).map((v, i) => `${i+1}. ${v.title} (${v.duration})`).join("\n\n");
        
        const sendData = await message.reply({
            body: `${getLang("video.choose")}\n\n${formattedList}`,
            attachment: thumbnails.filter(Boolean)
        });
        
        thumbnails.forEach(thumb => {
            if (thumb?.path) try { fs.unlinkSync(thumb.path); } catch {}
        });
        
        return sendData.addReplyEvent({
            callback: chooseVideo,
            videos: videos.slice(0, 10).map(v => ({title: v.title, url: v.url}))
        });
    } catch (err) {
        console.error(err);
        message.reply(getLang("video.error"));
    }
}

export default {
    config,
    langData,
    onCall
}
