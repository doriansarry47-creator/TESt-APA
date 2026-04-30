"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface TrendPoint {
  stage: "T0" | "T1" | "T2";
  globalScore: number;
}

export function ProgressChart({ points }: { points: TrendPoint[] }) {
  return (
    <div className="h-64 w-full rounded-xl bg-white p-3 shadow">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <XAxis dataKey="stage" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Line type="monotone" dataKey="globalScore" stroke="#059669" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
