/**
 * SRT Parser — Phân tích file .srt thành danh sách subtitle entries
 */

export interface SrtEntry {
  index: number;
  startTime: string;   // "00:00:01,000"
  endTime: string;     // "00:00:04,000"
  startMs: number;     // milliseconds
  endMs: number;
  text: string;        // Nội dung subtitle
}

/** Parse SRT string thành mảng SrtEntry */
export function parseSrt(content: string): SrtEntry[] {
  const blocks = content.trim().split(/\n\s*\n/);
  const entries: SrtEntry[] = [];

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 3) continue;

    const index = parseInt(lines[0].trim(), 10);
    const timeLine = lines[1].trim();
    const text = lines.slice(2).join('\n').replace(/<[^>]+>/g, '').trim(); // strip HTML tags

    const timeMatch = timeLine.match(
      /(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/
    );
    if (!timeMatch) continue;

    const [, startTime, endTime] = timeMatch;
    entries.push({
      index,
      startTime,
      endTime,
      startMs: srtTimeToMs(startTime),
      endMs: srtTimeToMs(endTime),
      text,
    });
  }

  return entries;
}

/** Chuyển "00:01:23,456" → milliseconds */
export function srtTimeToMs(time: string): number {
  const [hms, ms] = time.split(',');
  const [h, m, s] = hms.split(':').map(Number);
  return (h * 3600 + m * 60 + s) * 1000 + Number(ms);
}

/** Export entries trở lại SRT format (sau khi dịch) */
export function entriesToSrt(entries: SrtEntry[]): string {
  return entries
    .map(e => `${e.index}\n${e.startTime} --> ${e.endTime}\n${e.text}`)
    .join('\n\n');
}

/** Download string dưới dạng file */
export function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
