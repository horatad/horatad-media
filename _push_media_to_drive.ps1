# _push_media_to_drive.ps1 — push คลัง media-sources จาก C:\ ขึ้น Google Drive (backup เมื่อพร้อม)
# กลยุทธ์: ทำงานบน C:\ (เทสเร็ว) → รันสคริปต์นี้เพื่อ push ขึ้น Drive เมื่อต้องการ backup/master
# robocopy /E (ทุก subfolder) /XO (ข้ามไฟล์เก่ากว่า = incremental) · ไม่ลบของบน Drive (ปลอดภัย)
# รัน:  powershell -ExecutionPolicy Bypass -File _push_media_to_drive.ps1

$src = "C:\horatad-media\media-sources"
$dst = "G:\My Drive\horatad-media\media-sources"

if (-not (Test-Path $src)) { Write-Host "ไม่พบ source: $src" -ForegroundColor Red; exit 1 }
if (-not (Test-Path "G:\My Drive")) { Write-Host "ไม่พบ G:\My Drive (Google Drive ไม่ได้ mount?)" -ForegroundColor Red; exit 1 }
New-Item -ItemType Directory -Force -Path $dst | Out-Null

Write-Host "Push media-sources → Drive" -ForegroundColor Cyan
Write-Host "  จาก: $src"
Write-Host "  ไป : $dst`n"

# /MT:8 = 8 thread · /R:2 /W:2 = retry 2 ครั้ง รอ 2 วิ · /NFL /NDL /NP = log สั้น
robocopy $src $dst /E /XO /R:2 /W:2 /MT:8 /NFL /NDL /NP
$rc = $LASTEXITCODE

# robocopy: code 0-7 = สำเร็จ (0=ไม่มีอะไรเปลี่ยน, 1=copy แล้ว) · >=8 = error
if ($rc -lt 8) {
    Write-Host "`n✓ push เสร็จ (robocopy code $rc) — media-sources ขึ้น Drive แล้ว" -ForegroundColor Green
    Write-Host "  รอ Google Drive sync ขึ้นคลาวด์ (ดูไอคอน tray = Up to date)"
} else {
    Write-Host "`n⚠️ robocopy error (code $rc) — เช็ค path/สิทธิ์" -ForegroundColor Red
}
