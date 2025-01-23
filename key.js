import { exec } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { setTimeout } from 'node:timers/promises'
const chars = 'abcdefghijklmnopqrstuvwxyz1234567890-'.split('')
const lastIdx = chars.length - 1
const reFirst3 = /^(.)\1\1/
const re4 = /(.)\1\1\1+/

// llml* ~ l4k** t3c0* v5ee* x7gj* z9it* 2ajx* 4cme* 6emt* 0is2* bku2* dmvm* foyb* js4m* foxd* hqzb* nw7u* py9s* r1a9*
let execKey = 't8a--'
let output = 0
if (process.env.LIST) {
  try {
    const bef = readFileSync(process.env.LIST, 'utf8')
    const key = bef.trim().replaceAll('*', '-')
    execKey = key.length === execKey.length ? key : execKey
    output = process.env.LIST
  } catch(e) {
    console.error(e)
  }
}
console.error(`start: ${execKey}`)
const targetPath = process.env.TARGET
const idxes = [
  chars.indexOf(execKey.slice(0, 1)) || 0,
  chars.indexOf(execKey.slice(1, 2)) || 0,
  chars.indexOf(execKey.slice(2, 3)) || 0,
  chars.indexOf(execKey.slice(3, 4)) || 0,
  chars.indexOf(execKey.slice(4, 5)) || 0,
]

function next(key, cursor) {
  let index = idxes[cursor - 1]
  if (index === lastIdx) {
    idxes[cursor - 1] = 0
    cursor -= 1
    if (cursor < key.length - 1) writeFileSync(output, key.slice(0, cursor) + '*'.repeat(key.length - cursor))
    return next(key, cursor, chars.indexOf(key.slice(cursor - 1, cursor))) + chars[0]
  }
  index += 1
  idxes[cursor - 1] = index
  return key.slice(0, cursor-1) + chars[index]
}


const len = execKey.length
let c = 1
const stop = 280000 // 360000 = 4 * 60 * 60 * 1000 / 40
// todo multi-process, multi thread
while (c++ < stop) {
  execKey = next(execKey, len)

  // skip
  if (reFirst3.test(execKey) || re4.test(execKey)) continue

  exec(`ssh-keygen -y -P "${execKey}" -f ${targetPath}`, (error, stdout, stderr) => {
    // if (!error.message.includes('incorrect passphrase supplied to decrypt private key')) console.error(execKey, error)
    if (error) return
    console.error(execKey, stdout)
    process.exit(1)
  })
  await setTimeout(25)
}
process.exit(0)
