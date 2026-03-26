"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from "recharts";

interface Props {
  data: { date: string; value: number }[];
  color?: string;
  height?: number;
}

export function SparklineChart({ data, color = "#3b82f6", height = 40 }: Props) {
  if (!data || data.length < 2) return <div className="text-gray-600 text-xs">No data</div>;

  const first = data[0].value;
  const last = data[data.length - 1].value;
  const lineColor = last >= first ? "#22c55e" : "#ef4444";

  return (
    <div style={{ height, width: 120 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <YAxis domain={["dataMin", "dataMax"]} hide />
          <Tooltip
            contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 11 }}
            labelStyle={{ color: "#94a3b8" }}
            formatter={(v) => [Number(v).toFixed(2), ""]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color === "auto" ? lineColor : color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
