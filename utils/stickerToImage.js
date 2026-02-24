const sharp = require("sharp")
const fs = require("fs")

/**
 * Convert sticker webp → image
 * @param {Buffer} webpBuffer
 * @param {string} outPath
 * @param {"png"|"jpg"} format
 */
async function stickerWebpToImage(webpBuffer, outPath, format = "png") {
    let img = sharp(webpBuffer)

    if (format === "jpg") {
        img = img
            .flatten({ background: "#ffffff" })
            .jpeg({ quality: 95 })
    } else {
        img = img.png({ compressionLevel: 9 })
    }

    await img.toFile(outPath)
}

module.exports = { stickerWebpToImage }