import { execSync, exec } from 'node:child_process'
import {
  setTimeout,
} from 'node:timers/promises';
const chars = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('')  // len 3 with -, b***
// const chars = '1234567890'.split('') // 000** - 027**, 111** - 669**
const path = process.env.TARGET
const start = process.env.START ? Number(process.env.START) : (new Date()).getHours() * 2
for (let i = 0;i < start;i++) {
  const key = chars.shift()
  chars.push(key)
}
console.log(chars)
for (let len = 4;len<6;len++) {
  console.log('check len: ', len)
  await nestAsync('', len)
  console.log('checked len: ', len)
}
// ssh-keygen -p -f path
async function nestAsync(key, len) {
  if (len === 4 && key.slice(0,1) === 'b') return
  for (const c of chars) {
    let execKey = key + c
    if (execKey.length !== len) {
      await nestAsync(execKey, len)
      continue
    }
    if (Number(execKey)) continue
    await setTimeout(30)
    exec(`ssh-keygen -y -P "${execKey}" -f ${path}`, (error, stdout, stderr) => {
      if (error) {
        if (!error.message.includes('incorrect passphrase supplied to decrypt private key')) console.log(execKey, error)
        return
      }
      console.log(execKey, stdout)
      process.exit(0);
    })
  }
  if (len - key.length >= 2) console.log(key + '*'.repeat(len - key.length))
}