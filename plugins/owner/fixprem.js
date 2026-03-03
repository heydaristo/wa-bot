const pluginConfig = {
    name: 'resetprem',
    alias: [],
    category: 'owner',
    isOwner: true,
    isEnabled: true,
    cooldown: 3,
    energi: 0
}

async function handler(m, { sock }) {
    const database = require('../../src/lib/database').getDatabase()

    const before = database.data.premium?.length || 0

    // Hapus SEMUA data premium tanpa filter
    database.data.premium = []
    await database.save()

    await m.reply(
        `🗑️ *ʀᴇsᴇᴛ ᴘʀᴇᴍ*\n\n` +
        `> Dihapus: \`${before}\` data\n` +
        `> Status: ✅ Database bersih\n\n` +
        `> Gunakan \`.addpremall\` untuk tambah ulang`
    )
}

module.exports = { config: pluginConfig, handler }