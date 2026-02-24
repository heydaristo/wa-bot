const { default: makeWASocket, useMultiFileAuthState, downloadContentFromMessage } = require("@whiskeysockets/baileys")
const P = require("pino")
const qrcode = require("qrcode-terminal")
const { exec, execSync } = require("child_process")
const fs = require("fs")
const path = require("path")
const { buildStickerSvg } = require("./utils/stickerText")
const { stickerToImage } = require("./utils/stickerToImage")
const sharp = require("sharp")
const puppeteer = require("puppeteer")
const os = require("os")

const { Sticker } = require("wa-sticker-formatter")

async function startBot() {

    const { state, saveCreds } = await useMultiFileAuthState("session")

    const sock = makeWASocket({
        logger: P({ level: "silent" }),
        auth: state
    })
    // bio run time bot
    const BOT_START_TIME = Date.now()
    function formatUptime(ms) {
        const s = Math.floor(ms / 1000)
        const d = Math.floor(s / 86400)
        const h = Math.floor((s % 86400) / 3600)
        const m = Math.floor((s % 3600) / 60)
        const sec = s % 60
        return `${d}d ${h}h ${m}m ${sec}s`
    }
    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update) => {

        if (update.qr) qrcode.generate(update.qr, { small: true })
        if (update.connection === "open") console.log("✅ Bot Connected")
        const { connection } = update

        if (connection === "open") {
            updateBotBio(sock)
        }

        if (connection === "close") {
            sock.updateProfileStatus("🔴 KepoBot | OFFLINE")
        }
    })
    // Bio otomatis dengan stats (RAM + CPU)
    function getSystemStats() {
        const usedRam = process.memoryUsage().rss / 1024 / 1024
        const totalRam = os.totalmem() / 1024 / 1024
        const ramPercent = (usedRam / totalRam) * 100

        const cpuLoad = os.loadavg()[0] // 1 menit

        return {
            ram: `${usedRam.toFixed(0)}MB`,
            ramPercent: ramPercent.toFixed(0),
            cpu: cpuLoad.toFixed(2)
        }
    }
    function getWIBTime() {
        return new Date().toLocaleTimeString("id-ID", {
            timeZone: "Asia/Jakarta",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        })
    }
    async function updateBotBio(sock) {
        try {
            const uptime = formatUptime(Date.now() - BOT_START_TIME)
            const stats = getSystemStats()
            const wib = getWIBTime()

            const bio =
                `🤖 KepoBot | ONLINE
⏱️ ${uptime} • 📊 ${stats.ram}/${stats.cpu} • 🕒 ${wib}`
            await sock.updateProfileStatus(bio)
        } catch (err) {
            console.error("Gagal update bio:", err)
        }
    }
    setInterval(() => {
        if (sock?.user) updateBotBio(sock)
    }, 5 * 60 * 1000) // tiap 5 menit
    // Handler utama untuk semua pesan masuk
    sock.ev.on("messages.upsert", async ({ messages }) => {
        try {

            if (!messages || !messages[0]) return
            const m = messages[0]
            if (!m.message) return
            if (m.key.fromMe) return

            const OWNER_NUMBER = "6282146731108"

            const sender = m.key.remoteJid || ""

            const isGroup = sender.endsWith("@g.us")

            const senderNumber = isGroup
                ? (m.key.participant || "")
                : sender

            // Bersihkan jadi angka (ANTI NULL ERROR)
            const senderClean = senderNumber
                ? senderNumber.replace(/[^0-9]/g, "")
                : ""

            const isOwner = senderClean === OWNER_NUMBER

            const reply = (text) =>
                sock.sendMessage(sender, { text }, { quoted: m })

            const react = (emoji) =>
                sock.sendMessage(sender, {
                    react: { text: emoji, key: m.key }
                })

           const msg = m.message || {}

const text =
    msg?.conversation ||
    msg?.extendedTextMessage?.text ||
    msg?.imageMessage?.caption ||
    msg?.videoMessage?.caption ||
    ""

            const args = text.trim().split(/\s+/)
            const command = args[0]?.toLowerCase() || ""

            const rawText = args.slice(1).join(" ").trim()

            let url = null

            // ===== WAJIB ADA =====
            let stickerText = rawText
            // === setelah command & rawText didapat ===
            let topText = ""
            let bottomText = ""

            // 🔥 PRIORITAS: keyword eksplisit
            if (rawText.startsWith("atas|")) {
                topText = rawText.replace(/^atas\|/i, "").trim()
                bottomText = ""
            }
            else if (rawText.startsWith("bawah|")) {
                topText = ""
                bottomText = rawText.replace(/^bawah\|/i, "").trim()
            }

            // 🔁 format umum pakai |
            else if (rawText.includes("|")) {
                const [atas, ...bawah] = rawText.split("|")
                topText = atas.trim()
                bottomText = bawah.join("|").trim()
            }

            // 🔥 DEFAULT → teks di BAWAH
            else {
                topText = ""
                bottomText = rawText.trim()
            }

            // 🛡️ safety anti double
            if (topText === bottomText) {
                topText = ""
            }
            // Jika format: .dl link
            if (args[1] && args[1].startsWith("http")) {
                url = args[1]
            }

            // Jika kirim link saja
            if (text.startsWith("http")) {
                url = text.trim()
            }
            const quoted =
                m.message?.extendedTextMessage?.contextInfo?.quotedMessage || null

            const imageMessage =
                m.message?.imageMessage ||
                m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
                quoted?.imageMessage ||
                null

            const videoMessage =
                m.message?.videoMessage ||
                m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage ||
                quoted?.videoMessage ||
                null

            const hasImage = !!imageMessage
            const hasVideo = !!videoMessage
            const videoDuration = videoMessage?.seconds || 0
            const urlRegex = /(https?:\/\/[^\s]+)/g
            const match = text ? text.match(urlRegex) : null
            // const url = match ? match[0] : null

            const isYoutube = url
                ? (url.includes("youtube.com") || url.includes("youtu.be"))
                : false


            // =======================
            // QC FINAL STABLE
            // =======================
            if (command === ".qc") {

                const quoted = m.message.extendedTextMessage?.contextInfo

                if (!quoted?.quotedMessage) {
                    return reply("⚠️ Reply pesan yang ingin dijadikan sticker.")
                }

                await react("⏳")

                const quotedMsg = quoted.quotedMessage
                const senderJid = quoted.participant || sender

                // ===== SENSOR NOMOR =====
                let rawNumber = senderJid.split("@")[0]
                const maskNumber = (num) => {
                    if (num.length <= 8) return num
                    return num.slice(0, 5) + "****" + num.slice(-3)
                }
                const senderName = maskNumber(rawNumber)

                // ===== AMBIL TEKS =====
                let quotedText = "Pesan tidak didukung"

                if (quotedMsg.conversation) {
                    quotedText = quotedMsg.conversation
                } else if (quotedMsg.extendedTextMessage?.text) {
                    quotedText = quotedMsg.extendedTextMessage.text
                } else if (quotedMsg.imageMessage?.caption) {
                    quotedText = quotedMsg.imageMessage.caption
                } else if (quotedMsg.videoMessage?.caption) {
                    quotedText = quotedMsg.videoMessage.caption
                } else if (quotedMsg.stickerMessage) {
                    quotedText = "🖼️ Sticker"
                }

                // ===== ESCAPE HTML =====
                const escapeHTML = (text) => {
                    return text
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                }

                // ===== AMBIL FOTO PROFILE =====
                let profilePic
                try {
                    profilePic = await sock.profilePictureUrl(senderJid, "image")
                } catch {
                    profilePic = "https://i.ibb.co/6bQXQ9Q/user.png"
                }

                const time = new Date().toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit"
                })

                const browser = await puppeteer.launch({
                    headless: "new",
                    args: ["--no-sandbox", "--disable-setuid-sandbox"]
                })

                const page = await browser.newPage()

                const html = `
    <html>
    <head>
    <style>
    body {
        margin:0;
        background:transparent;
        font-family:
        "Noto Color Emoji",
        "Apple Color Emoji",
        "Segoe UI Emoji",
        system-ui,
        sans-serif;
        display:flex;
        justify-content:center;
        align-items:center;
        height:100vh;
    }
    .chat {
        display:flex;
        align-items:flex-start;
        gap:20px;
        padding:40px;
    }
    .avatar {
        width:90px;
        height:90px;
        border-radius:50%;
        background-image:url('${profilePic}');
        background-size:cover;
        background-topText:center;
    }
    .bubble-container {
        display:flex;
        flex-direction:column;
    }
    .name {
        color:#00a884;
        font-size:30px;
        font-weight:600;
        margin-bottom:10px;
    }
    .bubble {
        background:#202c33;
        color:white;
        padding:25px 30px;
        border-radius:18px;
        max-width:650px;
        font-size:34px;
        line-height:1.4;
        word-wrap:break-word;
    }
    .meta {
        font-size:20px;
        color:#8696a0;
        margin-top:8px;
        text-align:right;
    }
    </style>
    </head>
    <body>
        <div class="chat">
            <div class="avatar"></div>
            <div class="bubble-container">
                <div class="name">${senderName}</div>
                <div class="bubble">${escapeHTML(quotedText)}</div>
                <div class="meta">${time}</div>
            </div>
        </div>
    </body>
    </html>
    `

                await page.setViewport({
                    width: 1000,
                    height: 1000,
                    deviceScaleFactor: 2
                })

                await page.setContent(html)

                const screenshot = await page.screenshot({
                    type: "png",
                    omitBackground: true
                })

                await browser.close()
                const webpBuffer = await sharp(screenshot)
                    .resize(512, 512, {
                        fit: "cover",
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    })
                    .webp({ quality: 100 })
                    .toBuffer()
                const sticker = new Sticker(webpBuffer, {
                    pack: "KepoBot",
                    author: "Balerina",
                    type: "full",
                    quality: 100
                })

                await sock.sendMessage(sender, {
                    sticker: await sticker.toBuffer()
                }, { quoted: m })

                await react("✅")
            }
            //   convert sticker to image handler
            const getQuotedSticker = (m) => {
                const ctx = m.message?.extendedTextMessage?.contextInfo
                if (!ctx?.quotedMessage) return null
                return ctx.quotedMessage.stickerMessage || null
            }
            // sticker to image handler (PRIORITAS 2)
            if (command === ".sf") {
                const stickerMsg = getQuotedSticker(m)
                if (!stickerMsg) return reply("❌ Reply stickernya")

                await react("⏳")
                fs.mkdirSync("./tmp", { recursive: true })

                const base = `./tmp/${Date.now()}`
                const webpPath = `${base}.webp`
                const pngPath = `${base}.png`
                const mp4Path = `${base}.mp4`

                try {
                    // download sticker
                    const stream = await downloadContentFromMessage(stickerMsg, "sticker")
                    let buffer = Buffer.from([])
                    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
                    fs.writeFileSync(webpPath, buffer)

                    // ===============================
                    // 🔍 CEK FRAME COUNT (OPSIONAL)
                    // ===============================
                    let frameCount = 1
                    try {
                        const out = execSync(`identify "${webpPath}"`).toString()
                        frameCount = out.split("\n").length
                    } catch { }

                    const isAnimated = frameCount > 1

                    // ===============================
                    // 🎞️ ANIMATED → VIDEO LOOP (PAKSA)
                    // ===============================
                    if (isAnimated) {
                        // ambil frame pertama saja
                        await sharp(buffer)
                            .resize(512, 512, { fit: "contain" })
                            .png()
                            .toFile(pngPath)

                        // bikin video loop dari image
                        exec(
                            `ffmpeg -y -loop 1 -i "${pngPath}" -t 2 \
-vf "zoompan=z='min(zoom+0.001,1.05)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=60,scale=512:-2" \
-pix_fmt yuv420p "${mp4Path}"`,
                            async () => {

                                if (!fs.existsSync(mp4Path)) {
                                    await react("❌")
                                    return reply("❌ Gagal membuat video")
                                }

                                await sock.sendMessage(
                                    sender,
                                    {
                                        video: fs.readFileSync(mp4Path),
                                        caption: "🎥 sticker → video"
                                    },
                                    { quoted: m }
                                )

                                cleanup()
                                await react("✅")
                            }
                        )
                        return
                    }

                    // ===============================
                    // 🖼️ STATIC → FOTO
                    // ===============================
                    const imageBuffer = await sharp(buffer)
                        .resize(2048, 2048, {
                            fit: "contain",
                            background: { r: 255, g: 255, b: 255, alpha: 1 }
                        })
                        .png()
                        .toBuffer()

                    await sock.sendMessage(
                        sender,
                        {
                            image: imageBuffer,
                            caption: "🖼️ sticker → foto"
                        },
                        { quoted: m }
                    )

                    cleanup()
                    await react("✅")

                } catch (err) {
                    console.error(err)
                    cleanup()
                    await react("❌")
                    reply("❌ Gagal memproses sticker")
                }

                function cleanup() {
                    try {
                        if (fs.existsSync(webpPath)) fs.unlinkSync(webpPath)
                        if (fs.existsSync(pngPath)) fs.unlinkSync(pngPath)
                        if (fs.existsSync(mp4Path)) fs.unlinkSync(mp4Path)
                    } catch { }
                }
            }
            // end of sticker text logic
            // ================= STICKER FOTO =================
            if ((command === ".sticker" || command === ".s") && hasImage) {

                if (!imageMessage) {
                    return reply(
                        "❌ Kirim atau reply gambar\n\n" +
                        ".s bawah|contoh sticker 😏🎵"
                    )
                }

                await react("⏳")

                const stream = await downloadContentFromMessage(imageMessage, "image")
                let buffer = Buffer.from([])

                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk])
                }

                let image = sharp(buffer).resize(512, 512, {
                    fit: "contain",
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })

                if (stickerText) {
                    const svg = buildStickerSvg(topText, bottomText)
                    image = image.composite([{ input: Buffer.from(svg) }])
                }

                const webp = await image
                    .webp({ quality: 95, effort: 6 })
                    .toBuffer()

                const sticker = new Sticker(webp, {
                    pack: "KepoBot",
                    author: "Balerina"
                })

                await sock.sendMessage(
                    sender,
                    { sticker: await sticker.toBuffer() },
                    { quoted: m }
                )
                return react("✅")
            }
            // ================= STICKER VIDEO =================
            if ((command === ".sticker" || command === ".s") && hasVideo) {

                const videoMessage =
                    m.message?.videoMessage ||
                    m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage

                if (!videoMessage) {
                    await react("❌")
                    return reply("❌ Reply video yang ingin dijadikan sticker")
                }

                await react("⏳")

                const stream = await downloadContentFromMessage(
                    videoMessage,
                    "video"
                )

                let buffer = Buffer.from([])
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk])
                }

                const input = `input_${Date.now()}.mp4`
                const output = `sticker_${Date.now()}.webp`

                fs.writeFileSync(input, buffer)

                // ⬇️ durasi dinamis (maks 8 detik)
                const duration = Math.min(videoDuration || 8, 8)

                exec(
                    `ffmpeg -y -i "${input}" ` +
                    `-ss 0 -t ${duration} ` +
                    `-vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15" ` +
                    `-loop 0 -an "${output}"`,
                    async (err) => {

                        if (err || !fs.existsSync(output)) {
                            console.error(err)
                            await react("❌")
                            return reply("❌ Gagal membuat sticker")
                        }

                        const sticker = new Sticker(
                            fs.readFileSync(output),
                            {
                                pack: "KepoBot",
                                author: "Balerina"
                            }
                        )

                        await sock.sendMessage(
                            sender,
                            { sticker: await sticker.toBuffer() },
                            { quoted: m }
                        )

                        fs.unlinkSync(input)
                        fs.unlinkSync(output)

                        await react("✅")
                    }
                )

                return
            }
            if ((command === ".sticker" || command === ".s") && !hasImage && !hasVideo) {
                return reply("❌ Kirim atau reply gambar / video")
            }
            // ================= WARNING .DL =================
            // if (command.startsWith(".dl")) {
            //     return reply("⚠️ Langsung kirimkan link saja tanpa menggunakan *.dl*")
            // }

            // ================= YOUTUBE VIDEO =================
            if (isYoutube && command.startsWith(".ytv")) {

                await react("⏳")

                const output = `ytvideo_${Date.now()}.mp4`

                exec(`yt-dlp -f best --merge-output-format mp4 -o "${output}" "${url}"`,
                    async (err) => {

                        if (err) {
                            await react("❌")
                            return reply("❌ Gagal download video.")
                        }

                        const sizeMB = fs.statSync(output).size / (1024 * 1024)

                        if (sizeMB <= 30) {
                            await sock.sendMessage(sender, {
                                video: { url: path.resolve(output) }
                            }, { quoted: m })
                        } else {
                            await sock.sendMessage(sender, {
                                document: { url: path.resolve(output) },
                                mimetype: "video/mp4",
                                fileName: "video.mp4"
                            }, { quoted: m })
                        }

                        fs.unlinkSync(output)
                        await react("✅")
                    })

                return
            }

            // ================= YOUTUBE AUDIO =================
            if (isYoutube && command.startsWith(".yta")) {

                await react("⏳")

                const output = `ytaudio_${Date.now()}.mp3`

                exec(`yt-dlp -x --audio-format mp3 -o "${output}" "${url}"`,
                    async (err) => {

                        if (err) {
                            await react("❌")
                            return reply("❌ Gagal download audio.")
                        }

                        await sock.sendMessage(sender, {
                            audio: { url: path.resolve(output) },
                            mimetype: "audio/mpeg"
                        }, { quoted: m })

                        fs.unlinkSync(output)
                        await react("✅")
                    })

                return
            }
            // =================================
            // TOMP3 HANDLER (PRIORITAS 1)
            // =================================
            if (command === ".tomp3" || command === ".mp3") {

                if (!url) {
                    await react("❌")
                    return
                }

                await react("⏳")

                const timestamp = Date.now()
                const audioPath = `audio_${timestamp}.mp3`

                exec(
                    `yt-dlp -x --audio-format mp3 --audio-quality 0 -o "audio_${timestamp}.%(ext)s" "${url}"`,
                    async (err) => {

                        if (err || !fs.existsSync(audioPath)) {
                            await react("❌")
                            return
                        }

                        try {

                            await sock.sendMessage(sender, {
                                audio: { url: path.resolve(audioPath) },
                                mimetype: "audio/mpeg",
                                ptt: false
                            }, { quoted: m })

                            await react("✅")

                        } catch (e) {
                            console.log("SEND AUDIO ERROR:", e)
                            await react("❌")
                        }

                        if (fs.existsSync(audioPath)) {
                            fs.unlinkSync(audioPath)
                        }
                    }
                )

                return
            }
            if (command === ".toa") {

                try {

                    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage

                    if (!quoted || !quoted.videoMessage) {
                        return react("❌")
                    }

                    await react("⏳")

                    const stream = await downloadContentFromMessage(
                        quoted.videoMessage,
                        "video"
                    )

                    const videoPath = `video_${Date.now()}.mp4`
                    const audioPath = `audio_${Date.now()}.mp3`

                    const buffer = []
                    for await (const chunk of stream) {
                        buffer.push(chunk)
                    }

                    require("fs").writeFileSync(videoPath, Buffer.concat(buffer))

                    require("child_process").exec(
                        `ffmpeg -i ${videoPath} -vn -ab 128k -ar 44100 -y ${audioPath}`,
                        async (err) => {

                            require("fs").unlinkSync(videoPath)

                            if (err) {
                                await react("❌")
                                return
                            }

                            const audioBuffer = require("fs").readFileSync(audioPath)

                            await sock.sendMessage(sender, {
                                audio: audioBuffer,
                                mimetype: "audio/mpeg",
                                ptt: false
                            }, { quoted: m })

                            require("fs").unlinkSync(audioPath)

                            await react("✅")
                        }
                    )

                } catch (err) {
                    console.log(err)
                    await react("❌")
                }

            }
            // ======================================
            // PREMIUM TELEGRAM STYLE MENU
            // ======================================
            if (command === ".menu") {

                await react("📋")

                const uptime = process.uptime()
                const runtime = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`

                const menuText = `
╭━━━〔 🤖 KEPO BOT 〕━━━⬣
┃ 🟢 Status : Online
┃ ⏳ Runtime : ${runtime}
╰━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 📥 DOWNLOAD 〕━━━⬣
┃ 🔹  <link> untuk download video dari media sosial
┃ 🔹 .ytv <link> untuk mendownload video youtube
┃ 🔹 .yta <link> untuk mendownload audio youtube
┃ 🔹 .toa <reply> mengubah video menjadi audio
┃ 🔹 .tomp3  <reply> mengubah video tiktok jadi audio
┃ 🔹 .sf untuk mengubah sticker menjadi foto
╰━━━━━━━━━━━━━━━━━━⬣
`

                await sock.sendMessage(sender, {
                    image: { url: "https://i.imgur.com/7P5V6XH.jpg" },
                    caption: menuText
                }, { quoted: m })

                await react("✅")
            }
            // ======================================
            // .restart (OWNER ONLY + CONFIRM)
            // ======================================
            if (command === ".restart") {

                if (!isOwner) {
                    return sock.sendMessage(sender, {
                        text: `❌ Akses ditolak.\nNomor kamu: ${senderClean}`
                    }, { quoted: m })
                }

                await sock.sendMessage(sender, {
                    text: `
╭───〔 🔄 RESTART BOT 〕
│ Owner : ${senderClean}
│ Status : Confirmed
╰──────────────────
Bot sedang direstart via PM2...
`
                }, { quoted: m })

                exec("pm2 restart wa-sticker", (err, stdout, stderr) => {
                    if (err) {
                        console.log("Restart error:", err)
                    } else {
                        console.log("PM2 Restarted")
                    }
                })

                return
            }
            // ======================================
            // AUTO UNIVERSAL LINK (VIDEO / FOTO)
            // ======================================
            if (command === ".dl" && url || url && !text.startsWith(".") && !isYoutube) {

                await react("⏳")

                const timestamp = Date.now()
                const output = `video_${timestamp}.%(ext)s`

                exec(
                    `yt-dlp -f "bv*[height<=2160]+ba/best" \
        --merge-output-format mp4 \
        --downloader aria2c \
        --downloader-args "aria2c:-x 16 -s 16 -k 1M" \
        --write-info-json \
        -o "${output}" "${url}"`,
                    async (err) => {

                        if (err) {
                            await react("❌")
                            return
                        }

                        const videoFile = fs.readdirSync("./")
                            .find(f => f.startsWith(`video_${timestamp}`) && !f.endsWith(".json"))

                        const infoFile = fs.readdirSync("./")
                            .find(f => f.startsWith(`video_${timestamp}`) && f.endsWith(".info.json"))

                        let captionText = ""

                        if (infoFile) {
                            try {
                                const info = JSON.parse(fs.readFileSync(infoFile))
                                captionText = info.description || info.title || ""
                            } catch { }
                            fs.unlinkSync(infoFile)
                        }

                        if (!videoFile) {
                            await react("❌")
                            return
                        }

                        const videoPath = path.resolve(videoFile)

                        await sock.sendMessage(sender, {
                            video: { url: videoPath },
                            caption: `📹 *Downloaded Successfully*\n\n${captionText.slice(0, 900)}`
                        }, { quoted: m })

                        fs.unlinkSync(videoPath)
                        await react("✅")
                    }
                )

                return
            }
        } catch (err) {
            console.error("BOT ERROR:", err)
            try {
                await sock.sendMessage(sender, {
                    react: { text: "❌", key: m.key }
                })
                await sock.sendMessage(sender, {
                    text: "⚠️ Terjadi kesalahan."
                }, { quoted: m })
            } catch { }
        }
    })
}

startBot()
