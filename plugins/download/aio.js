const axios = require('axios')
const cheerio = require('cheerio')
const CryptoJS = require('crypto-js')
const config = require('../../config')

const pluginConfig = {
    name: 'aio',
    alias: ['allinone', 'download', 'dl'],
    category: 'downloader',
    description: 'All in one downloader (IG, TikTok, FB, Twitter, dll)',
    usage: '.aio <url>',
    example: '.aio https://instagram.com/p/xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function scrapeAIO(targetUrl) {
    const baseUrl = 'https://allinonedownloader.com'
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

    try {
        const initRes = await axios.get(baseUrl, {
            headers: { 'User-Agent': ua }
        })

        const $ = cheerio.load(initRes.data)
        const token = $('#token').val()
        const apiPath = $('#scc').val()
        const cookies = initRes.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ')

        if (!token || !apiPath) throw new Error('Token tidak ditemukan')

        const jsPath = $('script[src*="template/main/assets/js/main.js"]').attr('src')
        const jsUrl = new URL(jsPath, baseUrl).href
        const { data: jsContent } = await axios.get(jsUrl, {
            headers: { 'User-Agent': ua, 'Cookie': cookies }
        })

        const ivMatch = jsContent.match(/CryptoJS\.enc\.Hex\.parse\(['"]([a-f0-9]{32})['"]\)/)
        const ivHex = ivMatch ? ivMatch[1] : 'afc4e290725a3bf0ac4d3ff826c43c10'

        const key = CryptoJS.enc.Hex.parse(token)
        const iv = CryptoJS.enc.Hex.parse(ivHex)
        const urlhash = CryptoJS.AES.encrypt(targetUrl, key, {
            iv: iv,
            padding: CryptoJS.pad.ZeroPadding
        }).toString()

        const apiUrl = apiPath.startsWith('http') ? apiPath : `${baseUrl}${apiPath}`

        const { data } = await axios.post(apiUrl,
            new URLSearchParams({
                url: targetUrl,
                token: token,
                urlhash: urlhash
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Referer': baseUrl,
                    'Cookie': cookies,
                    'User-Agent': ua
                }
            }
        )

        return data
    } catch (err) {
        return { error: err.message }
    }
}

/** Scraper TikTok khusus: tikwm.com (support slideshow) */
async function scrapeTikwm(targetUrl) {
    try {
        const { data } = await axios.post('https://www.tikwm.com/api/',
            new URLSearchParams({ url: targetUrl, count: 12, cursor: 0, web: 1, hd: 1 }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15000 }
        )
        if (data.code !== 0) return { error: data.msg }
        const d = data.data
        const base = 'https://www.tikwm.com'
        const fixUrl = (u) => (!u ? null : u.startsWith('http') ? u : `${base}${u}`)

        // Slideshow: ada images → kirim semua foto, abaikan video
        if (d.images?.length) {
            const links = d.images.map((img, i) => ({
                url: fixUrl(img), type: 'jpg', quality: `Slide ${i+1}`, isSlide: true
            }))
            return { links, title: d.title || 'TikTok', isSlideshow: true }
        }

        // Video biasa
        const links = []
        if (d.play)   links.push({ url: fixUrl(d.play),   type: 'mp4', quality: 'No Watermark' })
        if (d.wmplay) links.push({ url: fixUrl(d.wmplay), type: 'mp4', quality: 'With Watermark' })
        if (d.music)  links.push({ url: fixUrl(d.music),  type: 'mp3', quality: 'Audio' })
        return { links, title: d.title || 'TikTok', isSlideshow: false }
    } catch (err) {
        return { error: err.message }
    }
}

// Pilih satu media terbaik dari daftar link
function getBestLink(links) {
    const priority = ['No Watermark', 'mp4', 'jpg', 'jpeg', 'png', 'webp', 'mp3']
    let best = links[0]
    for (const p of priority) {
        const found = links.find(l =>
            (l.quality || '').toLowerCase().includes(p.toLowerCase()) ||
            (l.type || '').toLowerCase().includes(p.toLowerCase())
        )
        if (found) { best = found; break }
    }
    return best
}

async function handler(m, { sock }) {
    const url = m.text?.trim()

    if (!url) {
        return m.reply(
            `📥 *ᴀʟʟ ɪɴ ᴏɴᴇ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n` +
            `> Download dari berbagai platform!\n\n` +
            `╭┈┈⬡「 🌐 *ᴘʟᴀᴛꜰᴏʀᴍ* 」\n` +
            `┃ • Instagram\n` +
            `┃ • TikTok\n` +
            `┃ • Facebook\n` +
            `┃ • Twitter/X\n` +
            `┃ • YouTube\n` +
            `┃ • Dan lainnya...\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> *Contoh:* ${m.prefix}aio https://instagram.com/p/xxx`
        )
    }

    if (!url.startsWith('http')) {
        return m.reply(`❌ URL tidak valid! Harus dimulai dengan http/https`)
    }

    await m.react('⏳')
    await m.reply(config.messages?.wait || '⏳ Tunggu sebentar...')

    try {
        // Untuk TikTok: coba tikwm dulu (support slideshow), fallback ke scrapeAIO
        const isTikTok = /(?:vt|vm)\.tiktok\.com\/|tiktok\.com\//.test(url)
        let result = null
        if (isTikTok) {
            result = await scrapeTikwm(url)
            if (result.error) result = await scrapeAIO(url)
        } else {
            result = await scrapeAIO(url)
        }

        if (result.error) {
            await m.react('❌')
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ${result.error}`)
        }

        if (!result.links || result.links.length === 0) {
            await m.react('❌')
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Tidak dapat mengambil media dari URL tersebut`)
        }

        const title = result.title || 'Media Download'

        // Cek apakah slideshow (flag dari scraper atau semua link berupa gambar)
        const isAllImages = result.isSlideshow === true || result.links.every(l => {
            const t = (l.type || '').toLowerCase()
            return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'image'].some(x => t.includes(x))
        })

        try {
            if (isAllImages) {
                // Kirim SEMUA foto (slideshow)
                let sent = 0
                for (const l of result.links) {
                    const isFirst = sent === 0
                    const cap = isFirst
                        ? `📥 *${title}*\n\n> Quality: ${l.quality || 'HD'}\n> Total: ${result.links.length} foto`
                        : null
                    try {
                        await sock.sendMessage(m.chat, {
                            image: { url: l.url },
                            ...(cap ? { caption: cap } : {}),
                            annotations: []
                        }, { quoted: isFirst ? m : undefined })
                        sent++
                        await new Promise(r => setTimeout(r, 800))
                    } catch (e) {
                        console.error('Foto gagal:', e.message)
                    }
                }
                if (sent === 0) throw new Error('Semua foto gagal dikirim')
            } else {
                // Kirim 1 video/media terbaik
                const link = getBestLink(result.links)
                const mediaUrl = link.url
                const type = (link.type || '').toLowerCase()
                const isVideo = ['mp4', 'mov', 'webm', 'video'].some(t => type.includes(t))
                const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'image'].some(t => type.includes(t))

                const caption = `📥 *${title}*\n\n` +
                    `> Type: ${link.type || 'Unknown'}\n` +
                    `> Quality: ${link.quality || 'HD'}\n` +
                    `> Size: ${link.size || '?'}`

                if (isVideo) {
                    await sock.sendMessage(m.chat, {
                        video: { url: mediaUrl },
                        caption,
                        annotations: []
                    }, { quoted: m })
                } else if (isImage) {
                    await sock.sendMessage(m.chat, {
                        image: { url: mediaUrl },
                        caption,
                        annotations: []
                    }, { quoted: m })
                } else {
                    await sock.sendMessage(m.chat, {
                        document: { url: mediaUrl },
                        fileName: `download.${link.type || 'mp4'}`,
                        mimetype: `video/${link.type || 'mp4'}`,
                        caption,
                        annotations: []
                    }, { quoted: m })
                }
            }
            await m.react('✅')
        } catch (err) {
            console.error('Media send failed:', err.message)
            await m.react('❌')
            await m.reply(`❌ Gagal mengirim media.\n\n> ${err.message}`)
        }

    } catch (error) {
        await m.react('❌')
        await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ${error.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}