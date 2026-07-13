import type { SupabaseClient } from "@supabase/supabase-js";
import type { RoadmapData } from "./types";

function csvCell(v: string): string {
  const s = v ?? "";
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function csvRow(cells: string[]): string {
  return cells.map(csvCell).join(",") + "\r\n";
}

export async function buildExportCsv(
  db: SupabaseClient,
  userId: string,
  roadmap: RoadmapData,
): Promise<string> {
  let csv = "﻿" + csvRow(["유형", "날짜", "항목", "내용"]);

  roadmap.dislikes.forEach((v) => (csv += csvRow(["로드맵", "", "안 좋아하는 것", v])));
  roadmap.likes.forEach((v) => (csv += csvRow(["로드맵", "", "좋아하는 것", v])));
  if (roadmap.compass) csv += csvRow(["로드맵", "", "나침반", roadmap.compass]);
  roadmap.realizations.forEach((v) => (csv += csvRow(["로드맵", "", "깨달음", v])));

  const [{ data: goalRows }, { data: actionRows }] = await Promise.all([
    db
      .from("short_term_goals")
      .select("date, no, specific, measurable, agreed, realistic, timely, is_important")
      .eq("user_id", userId)
      .order("date")
      .order("no"),
    db.from("daily_actions").select("date, content").eq("user_id", userId).order("date"),
  ]);

  (goalRows ?? []).forEach((r) => {
    const label = `SMART 목표 #${r.no}${r.is_important ? " (중요)" : ""}`;
    const parts = [
      r.specific && `S:${r.specific}`,
      r.measurable && `M:${r.measurable}`,
      r.agreed && `A:${r.agreed}`,
      r.realistic && `R:${r.realistic}`,
      r.timely && `T:${r.timely}`,
    ].filter(Boolean);
    csv += csvRow(["데일리", r.date as string, label, parts.join(" / ")]);
  });

  (actionRows ?? []).forEach((r) => {
    csv += csvRow(["데일리", r.date as string, "오늘의 실행", (r.content as string) ?? ""]);
  });

  return csv;
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
