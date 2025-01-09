import { execSync, exec } from 'node:child_process'
import {
  setTimeout,
} from 'node:timers/promises';
// done 3 with -
// done 4: abcdefghijklmnopqrstuvwxyz1234567890
// mnopqrstu + v
// 5: eeee* ~ enj3*, 数字のみ 000** - 027**, 111** - 669**
// 7: eeeeee* ~ eeenjq*
const chars = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('')
const path = process.env.TARGET
const start = process.env.START ? Number(process.env.START) : (new Date()).getHours() * 2
for (let i = 0;i < start;i++) {
  const key = chars.shift()
  chars.push(key)
}
for (let len = 5;len<6;len++) {
  console.log('check len: ', len)
  await nestAsync('', len)
  console.log('checked len: ', len)
}
// ssh-keygen -p -f path
async function nestAsync(key, len) {
  if (len === 5 && key.slice(0,3) === 'eee') return
  for (const c of chars) {
    let execKey = key + c
    if (execKey.length !== len) {
      await nestAsync(execKey, len)
      continue
    }
    // if (Number(execKey)) continue
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