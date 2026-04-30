"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

export function RadarProfile({
  physical,
  psychological,
  motivation,
  autonomy
}: {
  physical: number;
  psychological: number;
  motivation: number;
  autonomy: number;
}) {
  const data = [
    { axis: "Physique", value: physical },
    { axis: "Psychologique", value: psychological },
    { axis: "Motivation", value: motivation },
    { axis: "Autonomie", value: autonomy }
  ];

  return (
    <div className="h-64 w-full rounded-xl bg-white p-3 shadow">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="axis" />
          <Radar dataKey="value" stroke="#2563eb" fill="#60a5fa" fillOpacity={0.5} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
