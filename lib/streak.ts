function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// 오늘(또는 오늘 미완료 시 어제)부터 거꾸로 연속된 날짜 수를 센다.
export function calcStreak(completedDates: string[]): number {
  const set = new Set(completedDates);
  const cursor = new Date();

  if (!set.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let count = 0;
  while (set.has(dateKey(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}
