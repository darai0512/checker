import { execSync, exec } from 'node:child_process'
import {
  setTimeout,
} from 'node:timers/promises';
const chars = 'abcdefghijklmnopqrstuvwxyz1234567890-'.split('')
const lastIdx = chars.length - 1
// multi-process, multi thread
const reFirst3 = /^(.)\1\1/
const re4 = /(.)\1\1\1+/

let execKey = (process.env.KEY || 'lu7g0').trim()  // llml* - lu7g0
const path = process.env.TARGET
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
    if (cursor < key.length - 1) console.log(key.slice(0, cursor) + '*'.repeat(key.length - cursor))
    return next(key, cursor, chars.indexOf(key.slice(cursor - 1, cursor))) + chars[0]
  }
  index += 1
  idxes[cursor - 1] = index
  return key.slice(0, cursor-1) + chars[index]
}


const len = execKey.length
while (true) {
  execKey = next(execKey, len)

  // skip
  if (reFirst3.test(execKey) || re4.test(execKey)) continue

  exec(`ssh-keygen -y -P "${execKey}" -f ${path}`, (error, stdout, stderr) => {
    if (error) {
      if (!error.message.includes('incorrect passphrase supplied to decrypt private key')) console.log(execKey, error)
      return
    }
    console.log(execKey, stdout)
    process.exit(0);
  })
  await setTimeout(20)

  // log
}