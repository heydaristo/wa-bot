const cekfemboy = require('../../src/scraper/lufemboy')
const { fetchBuffer } = require('../../src/lib/functions')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

const pluginConfig = {
    name: 'cekfemboy',
    alias: ['femboy'],
    category: 'cek',
    description: 'Cek seberapa femboy kamu',
    usage: '.cekfemboy @user atau .cekfemboy <nama>',
    example: '.cekfemboy @Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const convertGifToMp4 = (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        exec(
            `ffmpeg -y -i ${inputPath} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${outputPath}`,
            (err) => err ? reject(err) : resolve()
        )
    })
}

async function handler(m, { sock, db }) {
    const mentioned = m.mentionedJid ||
                      m.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
                      []

    let nama
    let targetJid = null

    if (mentioned.length >= 1) {
        // Ada mention — ambil nama dari db
        targetJid = mentioned[0]
        const number = targetJid.split('@')[0].split(':')[0]

        try {
            const user = db.getUser(targetJid)
            if (user?.name && user.name !== number) {
                nama = user.name
            }
        } catch {}

        // Fallback jika nama tidak ada di db
        if (!nama) nama = number

    } else {
        // Tidak ada mention — pakai teks input atau pushName sendiri
        nama = m.text?.trim() || m.pushName || 'Kamu'
        targetJid = m.sender
    }

    try {
        const result = cekfemboy(nama)

        // Ambil nomor untuk mention
        const number = targetJid.split('@')[0].split(':')[0]

        let txt = `🌸 *ᴄᴇᴋ ғᴇᴍʙᴏʏ*\n\n`
        // Ganti nama di hasil dengan format mention @nomor
        const hasilWithMention = result.hasil.replace(
            nama,
            `@${number}`
        )
        txt += `> ${hasilWithMention}`

        let buffer = null
        try {
            buffer = await fetchBuffer(result.gif)
        } catch (e) {
            console.error('[cekfemboy] Gagal fetch buffer:', e.message)
        }

        const sendOptions = { quoted: m }
        const mentions = [targetJid]

        if (buffer && buffer.length > 0) {
            const isGif = result.gif?.toLowerCase().includes('.gif')

            if (isGif) {
                const tmpGif = path.join('/tmp', `femboy_${Date.now()}.gif`)
                const tmpMp4 = path.join('/tmp', `femboy_${Date.now()}.mp4`)
                try {
                    fs.writeFileSync(tmpGif, buffer)
                    await convertGifToMp4(tmpGif, tmpMp4)
                    const mp4Buffer = fs.readFileSync(tmpMp4)
                    await sock.sendMessage(m.chat, {
                        video: mp4Buffer,
                        gifPlayback: true,
                        mimetype: 'video/mp4',
                        caption: txt,
                        mentions
                    }, sendOptions)
                } catch (convertErr) {
                    console.error('[cekfemboy] Gagal convert GIF:', convertErr.message)
                    await sock.sendMessage(m.chat, {
                        image: buffer,
                        caption: txt,
                        mentions
                    }, sendOptions)
                } finally {
                    if (fs.existsSync(tmpGif)) fs.unlinkSync(tmpGif)
                    if (fs.existsSync(tmpMp4)) fs.unlinkSync(tmpMp4)
                }
            } else {
                await sock.sendMessage(m.chat, {
                    video: buffer,
                    gifPlayback: true,
                    mimetype: 'video/mp4',
                    caption: txt,
                    mentions
                }, sendOptions)
            }
        } else {
            await sock.sendMessage(m.chat, { text: txt, mentions }, sendOptions)
        }

    } catch (err) {
        console.error('[cekfemboy] Error:', err)
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ${err.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}