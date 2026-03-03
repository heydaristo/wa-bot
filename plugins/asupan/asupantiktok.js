const axios = require('axios')
const config = require('../../config')

const pluginConfig = {
    name: 'asupantiktok',
    alias: ['tiktokasupan', 'ttasupan'],
    category: 'asupan',
    description: 'Video TikTok dari username random atau spesifik',
    usage: '.asupantiktok [username]',
    example: '.asupantiktok natajadeh',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 2,
    isEnabled: true
}

const usernames = [
    'natajadeh', 'aletaanovianda', 'faisafch', '0rbby', 'cindyanastt',
    'awaa.an', 'nadineabgail', 'ciloqciliq', 'carluskiey', 'wuxiaturuxia',
    'joomblo', 'hxszys', 'indomeysleramu', 'anindthrc', 'm1cel',
    'chrislin.chrislin', 'brocolee__', 'dxzdaa', 'toodlesprunky', 'wasawho',
    'paphricia', 'queenzlyjlita', 'apol1yon', 'eliceannabella', 'aintyrbaby',
    'christychriselle', 'natalienovita', 'glennvmi', '_rgtaaa', 'felicialrnz',
    'zahraazzhri', 'mdy.li', 'jeyiiiii_', 'bbytiffs', 'irenefennn',
    'mellyllyyy', 'xsta_xstar', 'n0_0ella', 'kutubuku6690', 'cesiann',
    'gaby.rosse', 'charrvm_', 'bilacml04', 'whosyoraa', 'ishaangelica',
    'heresthekei', 'gemoy.douyin', 'nathasyaest', 'jasmine.mat', 'akuallyaa',
    'meycoco22', 'baby_sya66', 'knzymyln__', 'rin.channn', 'audicamy',
    'franzeskaedelyn', 'shiraishi.ito', 'itsceceh', 'senpai_cj7'
]

async function handler(m, { sock }) {
    const apikey = config.APIkey?.betabotz || 'KxUCMqPK'
    const query = m.text?.trim() || usernames[Math.floor(Math.random() * usernames.length)]
    
    m.react('⏳')
    
    try {
        const res = await axios.get(`https://api.betabotz.eu.org/api/asupan/tiktok?query=${encodeURIComponent(query)}&apikey=${apikey}`, {
            timeout: 60000
        })
        
        if (!res.data?.result?.data?.[0]) {
            m.react('❌')
            return m.reply(`🚩 *Username Tidak Ditemukan*\n\n> Username: ${query}`)
        }
        
        const video = res.data.result.data[0]
        const author = video.author || {}
        const music = video.music_info || {}
        
        let capt = `🎵 *ᴀsᴜᴘᴀɴ ᴛɪᴋᴛᴏᴋ*\n\n`
        capt += `╭┈┈⬡「 👤 *ᴀᴜᴛʜᴏʀ* 」\n`
        capt += `┃ ◦ Name: *${author.nickname || '-'}*\n`
        capt += `┃ ◦ Username: *@${author.unique_id || query}*\n`
        capt += `╰┈┈⬡\n\n`
        capt += `╭┈┈⬡「 📊 *sᴛᴀᴛs* 」\n`
        capt += `┃ ◦ Views: *${(video.play_count || 0).toLocaleString()}*\n`
        capt += `┃ ◦ Likes: *${(video.digg_count || 0).toLocaleString()}*\n`
        capt += `┃ ◦ Shares: *${(video.share_count || 0).toLocaleString()}*\n`
        capt += `┃ ◦ Comments: *${(video.comment_count || 0).toLocaleString()}*\n`
        capt += `╰┈┈⬡\n\n`
        capt += `╭┈┈⬡「 🎵 *ᴍᴜsɪᴄ* 」\n`
        capt += `┃ ◦ Title: *${music.title || '-'}*\n`
        capt += `┃ ◦ Author: *${music.author || '-'}*\n`
        capt += `╰┈┈⬡\n\n`
        if (video.title) capt += `> _${video.title}_\n\n`
        capt += `> _Powered by Betabotz API_`
        
        m.react('✅')
        
        const videoUrl = video.play || video.wmplay
        const videoRes = await axios.get(videoUrl, { responseType: 'arraybuffer', timeout: 60000 })
        
        await sock.sendMessage(m.chat, {
            video: Buffer.from(videoRes.data),
            caption: capt
        }, { quoted: m })
        
    } catch (error) {
        m.react('❌')
        m.reply(`🚩 *Username Tidak Ditemukan*\n\n> Username: ${query}`)
    }
}

module.exports = {
    config: pluginConfig,
    handler
}
