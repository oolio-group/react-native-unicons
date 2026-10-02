const path = require('path')
const fs = require('fs-plus')
const upperCamelCase = require('uppercamelcase')

const root = process.cwd()
const iconsComponentPath = path.join(root, 'icons')
const iconsIndexPath = path.join(root, 'index.js')
const uniconsRoot = path.join(root, 'node_modules/@iconscout/unicons')
const uniconsConfig = require('@iconscout/unicons/json/line.json')

const FONT_FILE = 'unicons-line.ttf'
const fontSource = path.join(uniconsRoot, 'fonts/line', FONT_FILE)
const fontTargets = [
  path.join(root, 'fonts', FONT_FILE),
  path.join(root, 'android/src/main/assets/fonts', FONT_FILE)
]

const readCodepoints = font => {
  const tableCount = font.readUInt16BE(4)
  let cmapOffset
  for (let i = 0; i < tableCount; i++) {
    const record = 12 + i * 16
    if (font.toString('ascii', record, record + 4) === 'cmap') {
      cmapOffset = font.readUInt32BE(record + 8)
    }
  }
  if (cmapOffset === undefined) throw new Error(`${FONT_FILE} has no cmap table`)

  const codepoints = new Set()
  const subtableCount = font.readUInt16BE(cmapOffset + 2)
  for (let i = 0; i < subtableCount; i++) {
    const offset = cmapOffset + font.readUInt32BE(cmapOffset + 4 + i * 8 + 4)
    const format = font.readUInt16BE(offset)
    if (format === 4) {
      const segCount = font.readUInt16BE(offset + 6) / 2
      const ends = offset + 14
      const starts = ends + segCount * 2 + 2
      for (let s = 0; s < segCount; s++) {
        const start = font.readUInt16BE(starts + s * 2)
        const end = font.readUInt16BE(ends + s * 2)
        for (let c = start; c <= end && c !== 0xffff; c++) codepoints.add(c)
      }
    } else if (format === 12) {
      const groups = font.readUInt32BE(offset + 12)
      for (let g = 0; g < groups; g++) {
        const group = offset + 16 + g * 12
        const start = font.readUInt32BE(group)
        const end = font.readUInt32BE(group + 4)
        for (let c = start; c <= end; c++) codepoints.add(c)
      }
    }
  }
  return codepoints
}

const font = fs.readFileSync(fontSource)
const fontCodepoints = readCodepoints(font)

const missing = uniconsConfig.filter(
  icon => !icon.unicode || !fontCodepoints.has(parseInt(icon.unicode, 16))
)
if (missing.length) {
  throw new Error(
    `${missing.length} icons have no glyph in ${FONT_FILE}: ${missing
      .slice(0, 10)
      .map(icon => icon.name)
      .join(', ')}`
  )
}

fontTargets.forEach(target => {
  fs.makeTreeSync(path.dirname(target))
  fs.writeFileSync(target, font)
})

fs.removeSync(iconsComponentPath)
fs.mkdirSync(iconsComponentPath)

const indexJs = ['import "./registerFont";']

uniconsConfig.forEach(icon => {
  const baseName = `uil-${icon.name}`
  const location = path.join(iconsComponentPath, `${baseName}.js`)
  const name = upperCamelCase(baseName)

  const template = `import createIcon from "../createIcon";

export default createIcon("\\u{${icon.unicode.toLowerCase()}}", "${name}");
`
  fs.writeFileSync(location, template, 'utf-8')

  indexJs.push(`export { default as ${name} } from './icons/${baseName}'`)
})

fs.writeFileSync(iconsIndexPath, indexJs.join('\n'), 'utf-8')

console.log(`Generated ${uniconsConfig.length} icon components using ${FONT_FILE}.`)
