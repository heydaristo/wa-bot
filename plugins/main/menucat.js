const config = require('../../config')
const { getCommandsByCategory, getCategories } = require('../../src/lib/plugins')
const { getDatabase } = require('../../src/lib/database')
const { getCasesByCategory } = require('../../case/ourin')

const pluginConfig = {
    name: 'menucat',
    alias: ['mc', 'category', 'cat'],
    category: 'main',
    description: 'Menampilkan commands dalam kategori tertentu',
    usage: '.menucat <kategori>',
    cooldown: 3,
    isEnabled: true
}

const CATEGORY_EMOJIS = {
    owner: '👑', main: '🏠', utility: '🔧', tools: '🛠️',
    fun: '🎮', game: '🎯', download: '📥', search: '🔍',
    sticker: '🖼️', media: '🎬', ai: '🤖', group: '👥',
    religi: '☪️', info: 'ℹ️', user: '📊', store: '🛒',
    jpm: '📢', pushkontak: '📱', panel: '🖥️', ephoto: '🎨'
}

function toBold(text) {
    const map = {
        A:'𝗔',B:'𝗕',C:'𝗖',D:'𝗗',E:'𝗘',F:'𝗙',G:'𝗚',
        H:'𝗛',I:'𝗜',J:'𝗝',K:'𝗞',L:'𝗟',M:'𝗠',N:'𝗡',
        O:'𝗢',P:'𝗣',Q:'𝗤',R:'𝗥',S:'𝗦',T:'𝗧',U:'𝗨',
        V:'𝗩',W:'𝗪',X:'𝗫',Y:'𝗬',Z:'𝗭'
    }
    return text.toUpperCase().split('').map(c => map[c] || c).join('')
}

function toSmallCaps(text = '') {
    const map = {
        a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',
        h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',n:'ɴ',
        o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',
        u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ'
    }
    return text.toLowerCase().split('').map(c => map[c] || c).join('')
}

function context(m) {
    return { mentionedJid: [m.sender] }
}

async function handler(m, { sock }) {
    const prefix = config.command?.prefix || '.'
    const args = m.args || []
    const inputCat = args[0]?.toLowerCase()

    const db = getDatabase()
    const groupData = m.isGroup ? (db.getGroup(m.chat) || {}) : {}
    const botMode = groupData.botMode || 'md'

    const commandsByCategory = getCommandsByCategory()
    const casesByCategory = getCasesByCategory()

    const allCategories = [...new Set([
        ...getCategories(),
        ...Object.keys(casesByCategory)
    ])]

    const modeExclude = {
        md: ['panel', 'pushkontak', 'store'],
        store: ['panel', 'pushkontak', 'jpm', 'ephoto'],
        pushkontak: ['panel', 'store', 'jpm', 'ephoto']
    }

    const excluded = modeExclude[botMode] || []

    // === LIST KATEGORI ===
    if (!inputCat) {
        let txt = `📂 *${toBold('DAFTAR KATEGORI')}*\n`
        txt += `> Gunakan: \`${prefix}menucat <kategori>\`\n\n`
        txt += `╭┈┈⬡「 📋 *${toBold('KATEGORI')}* 」\n`

        for (const cat of allCategories.sort()) {
            if (cat === 'owner' && !m.isOwner) continue
            if (excluded.includes(cat)) continue

            const total =
                (commandsByCategory[cat]?.length || 0) +
                (casesByCategory[cat]?.length || 0)

            if (!total) continue
            txt += `┃ ${CATEGORY_EMOJIS[cat] || '📁'} ${toBold(cat)} ┃ \`${total}\`\n`
        }

        txt += `╰┈┈┈┈┈┈┈┈⬡\n`
        txt += `_Contoh: ${prefix}menucat tools_`

        return sock.sendMessage(m.chat, {
            text: txt,
            contextInfo: context(m)
        }, { quoted: m })
    }

    // === DETAIL KATEGORI ===
    const matched = allCategories.find(c => c.toLowerCase() === inputCat)
    if (!matched) {
        return m.reply(`❌ Kategori *${inputCat}* tidak ditemukan.\nGunakan \`${prefix}menucat\``)
    }

    if (matched === 'owner' && !m.isOwner) {
        return m.reply('❌ Kategori ini khusus owner.')
    }

    const cmds = [
        ...(commandsByCategory[matched] || []),
        ...(casesByCategory[matched] || [])
    ]

    if (!cmds.length) {
        return m.reply(`❌ Kategori *${matched}* kosong.`)
    }

    let txt = `╭┈┈⬡「 ${CATEGORY_EMOJIS[matched] || '📁'} *${toBold(matched)}* 」\n`
    for (const c of cmds) {
        txt += `┃ ◦ \`${prefix}${toSmallCaps(c)}\`\n`
    }
    txt += `╰┈┈┈┈┈┈┈┈⬡\n`
    txt += `Total: \`${cmds.length}\` command`

    await sock.sendMessage(m.chat, {
        text: txt,
        contextInfo: context(m)
    }, { quoted: m })
}

module.exports = {
    config: pluginConfig,
    handler
}