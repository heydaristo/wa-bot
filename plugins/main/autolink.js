const config = require('../../config')
const axios = require('axios')
const CryptoJS = require('crypto-js')
const cheerio = require('cheerio')

/**
 * ╔═══════════════════════════════════════════════════╗
 * ║         AUTO LINK DOWNLOADER — autolink.js        ║
 * ║  Kirim link saja → bot otomatis download & kirim  ║
 * ║  Tanpa command! Support: IG, TikTok, FB, Twitter, ║
 * ║  YouTube, Pinterest, Spotify, Capcut, dll          ║
 * ╚═══════════════════════════════════════════════════╝
 */

const pluginConfig = {
    name: 'autolink',
    alias: [],
    category: 'main',
    description: 'Auto download media dari link yang dikirim user',
    usage: '<kirim link langsung>',
    example: 'https://www.tiktok.com/@user/video/xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true,

    // ── Khusus autolink: ini bukan command biasa ──────
    // Pasang handler ini di message event (bukan command handler).
    // Lihat bagian bawah: module.exports.isAutoLink = true
    isAutoLink: true
}

// ─────────────────────────────────────────────────────
// PLATFORM PATTERNS
// ─────────────────────────────────────────────────────
const SUPPORTED_PLATFORMS = [
    // TikTok
    { name: 'TikTok',     regex: /(?:vt|vm)\.tiktok\.com\/|tiktok\.com\/(?:[@\/\w]+\/video\/\d+|t\/\w+)/i },
    // Instagram
    { name: 'Instagram',  regex: /instagram\.com\/(p|reel|tv|stories)\/[\w-]+/i },
    // Facebook
    { name: 'Facebook',   regex: /facebook\.com\/(watch|reel|share\/v|[\w.]+\/videos)\//i },
    // Twitter / X
    { name: 'Twitter',    regex: /(?:twitter|x)\.com\/\w+\/status\/\d+/i },
    // YouTube
    { name: 'YouTube',    regex: /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))/i },
    // Pinterest
    { name: 'Pinterest',  regex: /pinterest\.\w+\/pin\//i },
    // Capcut
    { name: 'Capcut',     regex: /capcut\.com\/(v|t)\/\w+/i },
    // Spotify
    { name: 'Spotify',    regex: /open\.spotify\.com\/(track|album|playlist)\/\w+/i },
    // Snack Video
    { name: 'Snack',      regex: /snackvideo\.com\/(v|short)\/\w+/i },
    // Likee
    { name: 'Likee',      regex: /likee\.\w+\/(v|p)\/\w+/i },
    // Threads
    { name: 'Threads',    regex: /threads\.net\/(@[\w.]+\/post|t)\/\w+/i },
    // VK
    { name: 'VK',         regex: /vk\.com\/video/i },
    // Dailymotion
    { name: 'Dailymotion',regex: /dailymotion\.com\/video\//i },
    // SFile / Terabox / MediaFire
    { name: 'Terabox',    regex: /terabox\.com\/s\/\w+/i },
    { name: 'MediaFire',  regex: /mediafire\.com\/file\//i },
    { name: 'SFile',      regex: /sfile\.mobi\//i },
]

// ─────────────────────────────────────────────────────
// DETECT URL IN TEXT
// ─────────────────────────────────────────────────────
function extractURL(text) {
    if (!text) return null
    const match = text.match(/https?:\/\/[^\s]+/)
    return match ? match[0] : null
}

function detectPlatform(url) {
    for (const p of SUPPORTED_PLATFORMS) {
        if (p.regex.test(url)) return p.name
    }
    return null
}

// ─────────────────────────────────────────────────────
// SCRAPERS
// ─────────────────────────────────────────────────────

/** Scraper utama: allinonedownloader.com */
async function scrapeAIO(targetUrl) {
    const baseUrl = 'https://allinonedownloader.com'
    const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    try {
        const initRes = await axios.get(baseUrl, { headers: { 'User-Agent': ua }, timeout: 15000 })
        const $ = cheerio.load(initRes.data)
        const token   = $('#token').val()
        const apiPath = $('#scc').val()
        const cookies = initRes.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ')
        if (!token || !apiPath) throw new Error('Token tidak ditemukan')

        const jsPath = $('script[src*="template/main/assets/js/main.js"]').attr('src')
        const jsUrl  = new URL(jsPath, baseUrl).href
        const { data: jsContent } = await axios.get(jsUrl, { headers: { 'User-Agent': ua, Cookie: cookies }, timeout: 10000 })
        const ivMatch = jsContent.match(/CryptoJS\.enc\.Hex\.parse\(['"]([a-f0-9]{32})['"]\)/)
        const ivHex   = ivMatch ? ivMatch[1] : 'afc4e290725a3bf0ac4d3ff826c43c10'

        const key     = CryptoJS.enc.Hex.parse(token)
        const iv      = CryptoJS.enc.Hex.parse(ivHex)
        const urlhash = CryptoJS.AES.encrypt(targetUrl, key, { iv, padding: CryptoJS.pad.ZeroPadding }).toString()
        const apiUrl  = apiPath.startsWith('http') ? apiPath : `${baseUrl}${apiPath}`

        const { data } = await axios.post(apiUrl,
            new URLSearchParams({ url: targetUrl, token, urlhash }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'X-Requested-With': 'XMLHttpRequest',
                    Referer: baseUrl, Cookie: cookies, 'User-Agent': ua
                },
                timeout: 20000
            }
        )
        return data
    } catch (err) {
        return { error: err.message }
    }
}

/** Scraper backup: cobalt.tools API (TikTok, IG, Twitter, YT, dll) */
async function scrapeCobalt(targetUrl) {
    try {
        const { data } = await axios.post('https://api.cobalt.tools/api/json',
            { url: targetUrl, vCodec: 'h264', vQuality: '720', aFormat: 'mp3', isAudioOnly: false },
            {
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                timeout: 20000
            }
        )
        if (data.status === 'stream' || data.status === 'redirect') {
            return { links: [{ url: data.url, type: 'mp4', quality: '720p' }], title: 'Media' }
        }
        if (data.status === 'picker') {
            return {
                links: data.picker.map(p => ({ url: p.url, type: p.type === 'photo' ? 'jpg' : 'mp4', quality: 'HD' })),
                title: 'Media'
            }
        }
        return { error: data.text || 'cobalt gagal' }
    } catch (err) {
        return { error: err.message }
    }
}

/** Scraper TikTok khusus: tikwm.com */
async function scrapeTikwm(targetUrl) {
    try {
        const { data } = await axios.post('https://www.tikwm.com/api/',
            new URLSearchParams({ url: targetUrl, count: 12, cursor: 0, web: 1, hd: 1 }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, timeout: 15000 }
        )
        if (data.code !== 0) return { error: data.msg }
        const d = data.data
        const base = 'https://www.tikwm.com'
        const fixUrl = (u) => {
            if (!u) return null
            return u.startsWith('http') ? u : `${base}${u}`
        }

        // Jika ada images (slideshow) → kirim foto saja, abaikan video
        if (d.images?.length) {
            const links = d.images.map((img, i) => ({
                url: fixUrl(img), type: 'jpg', quality: `Slide ${i+1}`, isSlide: true
            }))
            return { links, title: d.title || 'TikTok', isSlideshow: true }
        }

        // Bukan slideshow → kirim video
        const links = []
        if (d.play)   links.push({ url: fixUrl(d.play),   type: 'mp4', quality: 'No Watermark' })
        if (d.wmplay) links.push({ url: fixUrl(d.wmplay), type: 'mp4', quality: 'With Watermark' })
        if (d.music)  links.push({ url: fixUrl(d.music),  type: 'mp3', quality: 'Audio' })
        return { links, title: d.title || 'TikTok', isSlideshow: false }
    } catch (err) {
        return { error: err.message }
    }
}

// ─────────────────────────────────────────────────────
// DETERMINE MEDIA TYPE FROM URL / MIME
// ─────────────────────────────────────────────────────
function getMediaType(link) {
    const type = (link.type || '').toLowerCase()
    const url  = (link.url  || '').toLowerCase().split('?')[0]
    if (['mp4', 'mov', 'webm', 'video', 'mkv', 'avi'].some(t => type.includes(t) || url.endsWith(`.${t}`))) return 'video'
    if (['mp3', 'aac', 'ogg', 'm4a', 'audio', 'wav'].some(t => type.includes(t) || url.endsWith(`.${t}`))) return 'audio'
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'image'].some(t => type.includes(t) || url.endsWith(`.${t}`))) return 'image'
    return 'document'
}

// ─────────────────────────────────────────────────────
// SEND MEDIA
// ─────────────────────────────────────────────────────
async function sendMedia(sock, m, link, caption) {
    const mediaType = getMediaType(link)
    const mediaUrl  = link.url

    try {
        if (mediaType === 'video') {
            await sock.sendMessage(m.chat, {
                video: { url: mediaUrl },
                caption,
                mimetype: 'video/mp4',
                annotations: []
            }, { quoted: m })
        } else if (mediaType === 'image') {
            await sock.sendMessage(m.chat, {
                image: { url: mediaUrl },
                caption,
                annotations: []
            }, { quoted: m })
        } else if (mediaType === 'audio') {
            await sock.sendMessage(m.chat, {
                audio: { url: mediaUrl },
                mimetype: 'audio/mp4',
                ptt: false
            }, { quoted: m })
        } else {
            await sock.sendMessage(m.chat, {
                document: { url: mediaUrl },
                fileName: `media.${link.type || 'bin'}`,
                mimetype: 'application/octet-stream',
                caption
            }, { quoted: m })
        }
        return true
    } catch (err) {
        console.error('[AutoLink] sendMedia error:', err.message)
        return false
    }
}

// ─────────────────────────────────────────────────────
// MAIN DOWNLOAD LOGIC
// ─────────────────────────────────────────────────────
async function downloadAndSend(m, sock, url, platform) {
    let result = null

    // Coba scraper yang paling cocok dulu
    if (platform === 'TikTok') {
        result = await scrapeTikwm(url)
        if (result.error) result = await scrapeCobalt(url)
        if (result.error) result = await scrapeAIO(url)
    } else {
        result = await scrapeCobalt(url)
        if (result.error) result = await scrapeAIO(url)
    }

    if (!result || result.error) {
        await m.react('❌')
        return m.reply(`❌ Gagal mengambil media.\n\n> ${result?.error || 'Sumber tidak merespon'}`)
    }

    if (!result.links || result.links.length === 0) {
        await m.react('❌')
        return m.reply(`❌ Tidak ada media ditemukan dari link tersebut.`)
    }

    const title = result.title || platform || 'Media'

    // Cek apakah slideshow (dari flag tikwm atau semua link berupa gambar)
    const isAllImages = result.isSlideshow === true || result.links.every(l => {
        const t = (l.type || '').toLowerCase()
        return ['jpg', 'jpeg', 'png', 'webp', 'gif', 'image'].some(x => t.includes(x))
    })

    if (isAllImages) {
        // Kirim SEMUA foto (slideshow)
        let sent = 0
        for (const link of result.links) {
            const isFirst = sent === 0
            const cap = isFirst
                ? `╭─〔 📥 *${platform || 'Download'}* 〕\n│ 📌 ${title.slice(0, 60)}${title.length > 60 ? '...' : ''}\n│ 🖼 ${result.links.length} foto\n╰──────────────────⬣`
                : null
            try {
                await sock.sendMessage(m.chat, {
                    image: { url: link.url },
                    ...(cap ? { caption: cap } : {}),
                    annotations: []
                }, { quoted: isFirst ? m : undefined })
                sent++
                await new Promise(r => setTimeout(r, 800))
            } catch (e) {
                console.error('[AutoLink] foto gagal:', e.message)
            }
        }
        if (sent === 0) {
            await m.react('❌')
            return m.reply(`❌ Gagal mengirim foto.`)
        }
    } else {
        // Kirim 1 video/media terbaik
        const priority = ['No Watermark', 'mp4', 'jpg', 'jpeg', 'png', 'mp3']
        let bestLink = result.links[0]
        for (const p of priority) {
            const found = result.links.find(l =>
                (l.quality || '').toLowerCase().includes(p.toLowerCase()) ||
                (l.type || '').toLowerCase().includes(p.toLowerCase())
            )
            if (found) { bestLink = found; break }
        }

        const quality = bestLink.quality || ''
        const caption = `╭─〔 📥 *${platform || 'Download'}* 〕\n│ 📌 ${title.slice(0, 60)}${title.length > 60 ? '...' : ''}\n│ 🎞 ${quality}\n╰──────────────────⬣`
        const ok = await sendMedia(sock, m, bestLink, caption)

        if (!ok) {
            await m.react('❌')
            return m.reply(`❌ Gagal mengirim media. Coba lagi sebentar.`)
        }
    }

    await m.react('✅')
}

// ─────────────────────────────────────────────────────
// HANDLER — dipanggil dari message event sebelum command handler
// ─────────────────────────────────────────────────────
async function handler(m, { sock, db }) {
    // Hanya proses pesan teks biasa (bukan command)
    const text = (m.body || m.text || "").trim()
    if (!text) return false

    // Jangan proses jika diawali prefix command
    const prefix = m.prefix || config?.command?.prefix || "."
    if (text.startsWith(prefix)) return false

    // Cari URL di teks
    const url = extractURL(text)
    if (!url) return false

    // Cek apakah URL dari platform yang didukung
    const platform = detectPlatform(url)
    if (!platform) return false

    // Platform file storage: kirim link saja
    if (['Terabox', 'MediaFire', 'SFile'].includes(platform)) {
        await m.react('📥')
        return m.reply(`> 📦 *${platform}* terdeteksi!\nLink: ${url}\n\n_File storage tidak bisa di-download otomatis, silakan download manual._`)
    }

    // Spotify: kirim info lagu
    if (platform === 'Spotify') {
        await m.react('🎵')
        return m.reply(`> 🎵 *Spotify* terdeteksi!\n\n_Gunakan: \`${prefix}spotify ${url}\` untuk download audio_`)
    }

    await m.react('⏳')

    try {
        await downloadAndSend(m, sock, url, platform)
    } catch (err) {
        console.error('[AutoLink] handler error:', err.message)
        await m.react('❌')
        await m.reply(`❌ Terjadi error: ${err.message}`)
    }

    return true  // tandai sudah diproses
}

module.exports = {
    config: pluginConfig,
    handler,
    // Flag untuk message event dispatcher
    isAutoLink: true,
    // Export helper untuk dipakai di bot utama
    extractURL,
    detectPlatform
}