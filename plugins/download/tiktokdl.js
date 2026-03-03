const ttdown = require('../../src/scraper/tiktok')
const config = require('../../config')
const axios = require('axios')
const ffmpeg = require('fluent-ffmpeg')
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg')
ffmpeg.setFfmpegPath(ffmpegInstaller.path)

const pluginConfig = {
    name: ['tiktok', 'tt', 'ttmp4'],
    alias: ['tiktokdl', 'ttdown'],
    category: 'download',
    description: 'Download video TikTok tanpa watermark',
    usage: '.tiktok <url>',
    example: '.tiktok https://vt.tiktok.com/xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

function formatNumber(num) {
    if (!num) return '0'
    const n = parseInt(num)
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
}

async function handler(m, { sock }) {
  const url = m.text?.trim()

  if (!url) {
    return m.reply(
`╭┈┈⬡「 🎵 *ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅ* 」
┃ ㊗ ᴜsᴀɢᴇ: \`${m.prefix}tiktok <url>\`
╰┈┈⬡

> Contoh: ${m.prefix}tiktok https://vt.tiktok.com/xxx`
    )
  }

  if (!url.match(/tiktok\.com|vt\.tiktok/i)) {
    return m.reply('❌ URL tidak valid. Gunakan link TikTok.')
  }

  m.react('⏱️')

  try {
    const result = await ttdown(url)
    
      config.bot?.name ||
      'Ourin-AI'

    const caption =
`✅ *Done kak*

\`\`\`${result.title}\`\`\`

👤 By \`${result.author.username || '-'}\``
    const carivideotanpawm = result.downloads.find(d => d.type == 'hd')
    if (!carivideotanpawm) {
      m.reply(`🍀 *NOTE*\n> Humm, kayaknya itu berisi foto, untuk saat ini memang belum support download foto dari tiktok hehe\n\n- Palingan ini aku kasih audio nya aja`)
      await sock.sendMessage(
        m.chat,
        {
          audio: { url: result.downloads.find(d => d.type == 'mp3').url },
          mimetype: 'audio/mpeg'
        },
        { quoted: m }
      )
      return
    }

    await sock.sendMessage(
      m.chat,
      {
        video: { url: carivideotanpawm.url },
        mimetype: 'video/mp4',
        caption,
        footer: `© ${config.bot?.name}`,
        interactiveButtons: [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '🎵 Download Audio',
                    id: `${m.prefix}ttmp3 ${url}`
                })
            }
        ]
      },
      { quoted: m }
    )

    m.react('✅')

    // cleanup
    setTimeout(() => {
      if (require('fs').existsSync(result.file)) {
        require('fs').unlinkSync(result.file)
      }
    }, 5000)

  } catch (err) {
    console.error('[TikTokDL] Error:', err)
    m.react('❌')
    m.reply(
      `❌ *ɢᴀɢᴀʟ ᴍᴇɴɢᴜɴᴅᴜʜ*\n\n> ${err.message}`
    )
  }
}

module.exports = {
    config: pluginConfig,
    handler
}
