// setup5.js — ตรวจไฟล์ + render Shorts60 (YouTube Shorts vertical 9:16)
// run:  node setup5.js            → ตรวจไฟล์ + แสดง render command
//       node setup5.js --render   → ตรวจแล้ว render เลย
const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');

const root = __dirname;
const need = [
  'src/scenes/Shorts60.jsx',
  'src/TextOverlay.jsx',
  'src/scenes/FullEpicycle.jsx',
];

console.log('— Shorts60 setup check —');
let ok = true;
for (const f of need) {
  const e = fs.existsSync(path.join(root, f));
  console.log((e ? '✓' : '✗') + ' ' + f);
  if (!e) ok = false;
}

// register ใน Root.jsx
const rootJsx = fs.readFileSync(path.join(root, 'src/Root.jsx'), 'utf8');
const reg = rootJsx.includes('id="Shorts60"');
console.log((reg ? '✓' : '✗') + ' Shorts60 registered ใน Root.jsx (1080×1920, 1800f)');
if (!reg) ok = false;

// เพลง (optional)
const music = fs.existsSync(path.join(root, 'public/music.mp3'));
if (music) {
  console.log('✓ public/music.mp3 พบ — ตั้ง MUSIC_FILE=\'music.mp3\' ใน Shorts60.jsx เพื่อเปิดเสียง');
} else {
  console.log('⚠ public/music.mp3 ยังไม่มี — คลิปจะเงียบ (วางเพลง royalty-free แล้วตั้ง MUSIC_FILE ใน Shorts60.jsx)');
}

if (!ok) { console.log('\n✗ ไฟล์ไม่ครบ — แก้ก่อน render'); process.exit(1); }

const cmd = 'npx remotion render src/index.js Shorts60 out/shorts60.mp4';
console.log('\n▶ render command:\n  ' + cmd);
if (process.argv.includes('--render')) {
  console.log('\nrendering...');
  execSync(cmd, {cwd: root, stdio: 'inherit'});
  console.log('✓ done → out/shorts60.mp4');
}
