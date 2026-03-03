const { downloadContentFromMessage } = require('ourin')

const pluginConfig = {
    name: 'rvo',
    alias: [],
    category: 'group',
    description: 'Membuka pesan 1x lihat yang di-reply',
    usage: '.rvo (reply pesan 1x lihat)',
    example: '.rvo',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

const pendingConfirmations = new Map()

const APPROVE_WORDS = ['ya', 'iya', 'boleh', 'oke', 'ok', 'silahkan', 'silakan', 'tidak apa', 'tidak apa-apa', 'gpp', 'gapapa', 'gak apa', 'gak apa-apa', 'izin', 'izinkan', 'acc', 'setuju']
const REJECT_WORDS = ['tidak', 'jangan', 'no', 'nope', 'ga', 'gak', 'ngga', 'nggak', 'tidak mau', 'nda', 'ndak', 'tolak', 'menolak']

// ─── Helper edit pesan ────────────────────────────────────────────────────────
async function editMsg(sock, chat, sentKey, newText, mentions = []) {
    try {
        await sock.sendMessage(chat, {
            text: newText,
            mentions,
            edit: sentKey
        })
    } catch {
        // fallback kirim baru jika edit tidak didukung
        await sock.sendMessage(chat, { text: newText, mentions })
    }
}

// ─── Handler utama ────────────────────────────────────────────────────────────
async function handler(m, { sock }) {
    const quoted = m.quoted
    if (!quoted) {
        return m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `> Balas pesan 1x lihat dengan perintah ini!\n` +
            `> Gunakan: \`${m.prefix}rvo\` (reply pesan 1x lihat)`
        )
    }

    const quotedMsg = quoted.message
    if (!quotedMsg) return m.reply(`❌ *ᴘᴇsᴀɴ ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ*\n\n> Tidak dapat membaca pesan yang di-reply.`)

    const type = Object.keys(quotedMsg)[0]
    const content = quotedMsg[type]

    if (!content) return m.reply(`❌ *ᴋᴏɴᴛᴇɴ ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ*\n\n> Konten pesan tidak dapat dibaca.`)

    if (!content.viewOnce) {
        return m.reply(
            `❌ *ʙᴜᴋᴀɴ ᴠɪᴇᴡᴏɴᴄᴇ*\n\n` +
            `> Pesan yang di-reply bukan pesan 1x lihat!\n` +
            `> Balas pesan dengan ikon 1x lihat (👁️).`
        )
    }

    let mediaType = null
    if (type.includes('image')) mediaType = 'image'
    else if (type.includes('video')) mediaType = 'video'
    else if (type.includes('audio')) mediaType = 'audio'

    if (!mediaType) {
        return m.reply(
            `❌ *ᴛɪᴘᴇ ᴛɪᴅᴀᴋ ᴅɪᴅᴜᴋᴜɴɢ*\n\n` +
            `> Tipe media: ${type}\n` +
            `> Hanya mendukung: image, video, audio`
        )
    }

    const senderJid = quoted.key?.participant || quoted.key?.remoteJid || ''
    const requestorJid = m.sender

    // ✅ Premium / Owner / diri sendiri → langsung buka
    if (m.isPremium || m.isOwner || senderJid === requestorJid) {
        return openViewOnce(m, sock, content, type, mediaType, senderJid, quoted)
    }

    // ─── User biasa: kirim konfirmasi ─────────────────────────────────────────
    const requestorNumber = requestorJid.split('@')[0].split(':')[0]
    let requestorName = ''
    try {
        requestorName = sock.store?.contacts?.[requestorJid]?.name
            || sock.store?.contacts?.[requestorJid]?.notify
            || ''
    } catch { }
    if (!requestorName) requestorName = m.pushName || m.name || `+${requestorNumber}`

    pendingConfirmations.delete(senderJid)

    // Kirim 1 pesan status ke chat requestor — akan diedit hasilnya
    const statusSent = await sock.sendMessage(m.chat, {
        text:
            `📨 *ᴋᴏɴꜰɪʀᴍᴀsɪ ᴅɪᴋɪʀɪᴍ*\n\n` +
            `> Permintaan telah dikirim ke pengirim pesan 1x lihat.\n` +
            `> ⏳ Menunggu persetujuan mereka...\n\n` +
            `_Jika ingin langsung buka tanpa konfirmasi, upgrade ke Premium!_ ⭐`
    }, { quoted: m })

    // Kirim 1 pesan konfirmasi ke pengirim ViewOnce — akan diedit hasilnya
    let confirmSent = null
    try {
        confirmSent = await sock.sendMessage(senderJid, {
            text:
                `👁️ *ᴘᴇʀᴍɪɴᴛᴀᴀɴ ʙᴜᴋᴀ ᴠɪᴇᴡᴏɴᴄᴇ*\n\n` +
                `> *@${requestorNumber}* ingin membuka pesan 1x lihat yang kamu kirim.\n\n` +
                `✅ Ketik *ya / iya / boleh / oke* untuk mengizinkan\n` +
                `❌ Ketik *tidak / jangan / no* untuk menolak\n\n` +
                `⏳ _Konfirmasi berlaku selama 2 menit._`,
            mentions: [requestorJid]
        })
    } catch (err) {
        return editMsg(sock, m.chat, statusSent.key,
            `❌ *ɢᴀɢᴀʟ ᴍᴇɴɢɪʀɪᴍ ᴋᴏɴꜰɪʀᴍᴀsɪ*\n\n` +
            `> Tidak bisa mengirim pesan ke pengirim ViewOnce.\n` +
            `> _${err.message}_`
        )
    }

    pendingConfirmations.set(senderJid, {
        m, sock, content, type, mediaType, senderJid, quoted,
        requestorJid, requestorName, requestorNumber,
        statusKey: statusSent.key,
        confirmKey: confirmSent.key,
        timestamp: Date.now()
    })

    setupConfirmationListener(sock, senderJid)
}

// ─── Listener konfirmasi ──────────────────────────────────────────────────────
function setupConfirmationListener(sock, senderJid) {
    const timeout = setTimeout(async () => {
        if (!pendingConfirmations.has(senderJid)) return
        const data = pendingConfirmations.get(senderJid)
        pendingConfirmations.delete(senderJid)
        sock.ev.off('messages.upsert', listener)

        // Edit pesan status di chat requestor → expired
        await editMsg(data.sock, data.m.chat, data.statusKey,
            `⏰ *ᴋᴏɴꜰɪʀᴍᴀsɪ ᴋᴀᴅᴀʟᴜᴀʀsᴀ*\n\n` +
            `> Pengirim tidak merespons dalam 2 menit.\n` +
            `> Coba gunakan perintah lagi nanti.`
        )

        // Edit pesan konfirmasi di DM pengirim → expired
        await editMsg(data.sock, senderJid, data.confirmKey,
            `👁️ *ᴘᴇʀᴍɪɴᴛᴀᴀɴ ʙᴜᴋᴀ ᴠɪᴇᴡᴏɴᴄᴇ*\n\n` +
            `> @${data.requestorNumber} ingin membuka pesan 1x lihat yang kamu kirim.\n\n` +
            `⏰ _Konfirmasi sudah kadaluarsa (tidak direspons dalam 2 menit)._`,
            [data.requestorJid]
        )
    }, 120000)

    const listener = async ({ messages, type }) => {
        if (type !== 'notify') return

        for (const msg of messages) {
            const from = msg.key?.remoteJid
            const isFromSender = from === senderJid || msg.key?.participant === senderJid
            if (!isFromSender || !msg.message) continue

            const text = (
                msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                msg.message?.buttonsResponseMessage?.selectedDisplayText ||
                ''
            ).toLowerCase().trim()

            if (!text) continue

            const isApproved = APPROVE_WORDS.some(w => text === w || text.includes(w))
            const isRejected = REJECT_WORDS.some(w => text === w || text.includes(w))
            if (!isApproved && !isRejected) continue

            if (!pendingConfirmations.has(senderJid)) {
                clearTimeout(timeout)
                sock.ev.off('messages.upsert', listener)
                return
            }

            const data = pendingConfirmations.get(senderJid)
            pendingConfirmations.delete(senderJid)
            clearTimeout(timeout)
            sock.ev.off('messages.upsert', listener)

            if (isApproved) {
                // Edit DM pengirim → diizinkan
                await editMsg(data.sock, senderJid, data.confirmKey,
                    `👁️ *ᴘᴇʀᴍɪɴᴛᴀᴀɴ ʙᴜᴋᴀ ᴠɪᴇᴡᴏɴᴄᴇ*\n\n` +
                    `> @${data.requestorNumber} ingin membuka pesan 1x lihat yang kamu kirim.\n\n` +
                    `✅ _Kamu telah mengizinkan permintaan ini._`,
                    [data.requestorJid]
                )
                // Edit status requestor → diproses
                await editMsg(data.sock, data.m.chat, data.statusKey,
                    `✅ *ᴅɪɪᴢɪɴᴋᴀɴ — ᴍᴇᴍᴘʀᴏsᴇs...*\n\n` +
                    `> Pengirim menyetujui! Sedang membuka pesan 1x lihat...`
                )
                // Buka ViewOnce
                await openViewOnce(data.m, data.sock, data.content, data.type, data.mediaType, data.senderJid, data.quoted, data.statusKey)

            } else {
                // Edit DM pengirim → ditolak
                await editMsg(data.sock, senderJid, data.confirmKey,
                    `👁️ *ᴘᴇʀᴍɪɴᴛᴀᴀɴ ʙᴜᴋᴀ ᴠɪᴇᴡᴏɴᴄᴇ*\n\n` +
                    `> @${data.requestorNumber} ingin membuka pesan 1x lihat yang kamu kirim.\n\n` +
                    `❌ _Kamu telah menolak permintaan ini._`,
                    [data.requestorJid]
                )
                // Edit status requestor → ditolak
                await editMsg(data.sock, data.m.chat, data.statusKey,
                    `🚫 *ᴘᴇʀᴍɪɴᴛᴀᴀɴ ᴅɪᴛᴏʟᴀᴋ*\n\n` +
                    `> Pengirim tidak mengizinkan pesan 1x lihat dibuka.\n\n` +
                    `_Upgrade ke Premium untuk buka tanpa konfirmasi!_ ⭐`
                )
            }
            break
        }
    }

    sock.ev.on('messages.upsert', listener)
}

// ─── Buka ViewOnce ────────────────────────────────────────────────────────────
async function openViewOnce(m, sock, content, type, mediaType, senderJid, quoted, statusKey = null) {
    try {
        const stream = await downloadContentFromMessage(content, mediaType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        if (!buffer || buffer.length < 100) {
            const errText = `❌ *ɢᴀɢᴀʟ ᴍᴇɴɢᴜɴᴅᴜʜ*\n\n> Tidak dapat mengunduh media.\n> Media mungkin sudah kadaluarsa.`
            return statusKey
                ? editMsg(sock, m.chat, statusKey, errText)
                : m.reply(errText)
        }

        const caption = content.caption || ''

        if (content.contextInfo) {
            delete content.contextInfo.forwardedNewsletterMessageInfo
            delete content.contextInfo.externalAdReply
            delete content.contextInfo.businessMessageForwardInfo
            delete content.contextInfo.entryPointConversionSource
        }

        const senderNumber = senderJid.split('@')[0].split(':')[0]
        const mediaCaption =
            `👁️ *ᴠɪᴇᴡᴏɴᴄᴇ ᴏᴘᴇɴᴇᴅ*\n\n` +
            `> Dari: @${senderNumber}\n` +
            (caption ? `> Caption: ${caption}` : '')

        const msgContent = { caption: mediaCaption, mentions: [senderJid] }

        if (mediaType === 'image') {
            msgContent.image = buffer
            msgContent.annotations = []
            await sock.sendMessage(m.chat, msgContent, { quoted: m })
        } else if (mediaType === 'video') {
            msgContent.video = buffer
            msgContent.annotations = []
            await sock.sendMessage(m.chat, msgContent, { quoted: m })
        } else if (mediaType === 'audio') {
            await sock.sendMessage(m.chat, {
                audio: buffer,
                mimetype: 'audio/mpeg',
                ptt: true
            }, { quoted: m })
        }

        // Edit pesan status → selesai
        if (statusKey) {
            await editMsg(sock, m.chat, statusKey,
                `✅ *ᴠɪᴇᴡᴏɴᴄᴇ ʙᴇʀʜᴀsɪʟ ᴅɪʙᴜᴋᴀ*\n\n` +
                `> Dari: @${senderNumber}` +
                (caption ? `\n> Caption: ${caption}` : ''),
                [senderJid]
            )
        }

    } catch (error) {
        const errText = `❌ *ᴇʀʀᴏʀ*\n\n> Gagal membuka pesan 1x lihat.\n> _${error.message}_`
        statusKey ? await editMsg(sock, m.chat, statusKey, errText) : await m.reply(errText)
    }
}

module.exports = { config: pluginConfig, handler, pendingConfirmations }