const config = require('../../config')
const { reelsvideo } = require('../../src/scraper/reelsvideo')
const axios = require('axios')
const cheerio = require('cheerio')

const pluginConfig = {
    name: 'instagramdl',
    alias: ['igdl', 'ig', 'instagram'],
    category: 'download',
    description: 'Download video/foto/story Instagram',
    usage: '.instagramdl <url>',
    example: '.instagramdl https://www.instagram.com/reel/xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

const IG_REGEX = /instagram\.com\/(p|reel|reels|stories|tv)\//i
const STORY_REGEX = /instagram\.com\/stories\//i

// ─── Story Downloader via saveclip.app ───────────────────────────────────────
async function downloadStory(url) {
    try {
        // Step 1: Get the page and extract token
        const pageRes = await axios.get('https://saveclip.app/id/instagram-story-download', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8',
                'Referer': 'https://saveclip.app/'
            },
            timeout: 15000
        })

        const $ = cheerio.load(pageRes.data)
        const token = $('input[name="_token"]').val()
            || $('meta[name="csrf-token"]').attr('content')
            || ''

        const cookies = pageRes.headers['set-cookie']
            ?.map(c => c.split(';')[0])
            .join('; ') || ''

        // Step 2: POST the URL to their API
        const formData = new URLSearchParams()
        formData.append('url', url)
        if (token) formData.append('_token', token)

        const postRes = await axios.post('https://saveclip.app/api/ajaxSearch', formData.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://saveclip.app/id/instagram-story-download',
                'X-Requested-With': 'XMLHttpRequest',
                'Cookie': cookies
            },
            timeout: 15000
        })

        const data = postRes.data
        if (!data || data.status === 'error') {
            throw new Error(data?.mess || 'Gagal mengambil story')
        }

        // Step 3: Parse media links from HTML response
        const $result = cheerio.load(data.data || data.html || '')
        const mediaUrls = []

        $result('a[href]').each((_, el) => {
            const href = $result(el).attr('href')
            if (href && (href.includes('.mp4') || href.includes('.jpg') || href.includes('.jpeg') || href.includes('cdninstagram') || href.includes('fbcdn'))) {
                const type = href.includes('.mp4') ? 'video' : 'image'
                mediaUrls.push({ url: href, type })
            }
        })

        // Fallback: cari di data langsung jika berbentuk JSON
        if (!mediaUrls.length && data.links) {
            for (const item of data.links) {
                if (item.url) {
                    const type = item.url.includes('.mp4') ? 'video' : 'image'
                    mediaUrls.push({ url: item.url, type })
                }
            }
        }

        if (!mediaUrls.length) throw new Error('Tidak ada media ditemukan di story ini')

        return {
            success: true,
            media: mediaUrls
        }
    } catch (err) {
        throw new Error(`Story downloader: ${err.message}`)
    }
}

// ─── Handler ─────────────────────────────────────────────────────────────────
async function handler(m, { sock }) {
    const url = m.text?.trim()

    if (!url) {
        return m.reply(
            `📸 *ɪɴsᴛᴀɢʀᴀᴍ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n` +
            `> \`${m.prefix}igdl <url>\`\n\n` +
            `*ᴄᴏɴᴛᴏʜ:*\n` +
            `> \`${m.prefix}igdl https://www.instagram.com/reel/xxx\`\n` +
            `> \`${m.prefix}igdl https://www.instagram.com/p/xxx\`\n` +
            `> \`${m.prefix}igdl https://www.instagram.com/stories/xxx\``
        )
    }

    if (!IG_REGEX.test(url)) {
        return m.reply(`❌ URL tidak valid. Gunakan link Instagram (reel/post/story).`)
    }

    await m.react('⏳')

    // ── Story Handler ──────────────────────────────────────────────────────
    if (STORY_REGEX.test(url)) {
        try {
            const result = await downloadStory(url)
            const caption = `✅ *ɪɴsᴛᴀɢʀᴀᴍ sᴛᴏʀʏ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*`

            const videos = result.media.filter(m => m.type === 'video')
            const images = result.media.filter(m => m.type === 'image')

            if (videos.length) {
                for (const item of videos) {
                    await sock.sendMessage(m.chat, {
                        video: { url: item.url },
                        caption
                    }, { quoted: m })
                }
            }

            if (images.length) {
                for (const item of images) {
                    await sock.sendMessage(m.chat, {
                        image: { url: item.url },
                        caption
                    }, { quoted: m })
                }
            }

            await m.react('✅')
        } catch (err) {
            await m.react('❌')
            return m.reply(`❌ *ɢᴀɢᴀʟ ᴍᴇɴɢᴜɴᴅᴜʜ sᴛᴏʀʏ*\n\n> ${err.message}`)
        }
        return
    }

    // ── Reel / Post Handler ───────────────────────────────────────────────
    try {
        const result = await reelsvideo(url)

        if (result.type === 'unknown' || (!result.videos.length && !result.images.length)) {
            await m.react('❌')
            return m.reply(`❌ Gagal mengambil media. Coba link lain.`)
        }

        const typeLabel = {
            video: '🎬 Video',
            photo: '🖼️ Foto',
            carousel: '📸 Carousel'
        }

        const caption =
            `✅ *ɪɴsᴛᴀɢʀᴀᴍ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n` +
            `> ${typeLabel[result.type] || '📦 Media'}` +
            (result.username ? `\n> 👤 @${result.username}` : '')

        if (result.type === 'video' && result.videos.length) {
            for (const videoUrl of result.videos) {
                await sock.sendMessage(m.chat, {
                    video: { url: videoUrl },
                    caption
                }, { quoted: m })
            }
        } else if (result.type === 'photo' && result.images.length) {
            for (const imageUrl of result.images) {
                await sock.sendMessage(m.chat, {
                    image: { url: imageUrl },
                    caption
                }, { quoted: m })
            }
        } else {
            // Carousel: kirim video + gambar
            for (const videoUrl of result.videos) {
                await sock.sendMessage(m.chat, {
                    video: { url: videoUrl },
                    caption
                }, { quoted: m })
            }
            for (const imageUrl of result.images) {
                await sock.sendMessage(m.chat, {
                    image: { url: imageUrl },
                    caption
                }, { quoted: m })
            }
        }

        await m.react('✅')
    } catch (err) {
        await m.react('❌')
        return m.reply(`❌ *ɢᴀɢᴀʟ ᴍᴇɴɢᴜɴᴅᴜʜ*\n\n> ${err.message}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}