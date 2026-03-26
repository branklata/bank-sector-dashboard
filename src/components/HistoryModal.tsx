"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface Props {
  title: string;
  data: { date: string; value: number }[];
  onClose: () => void;
}

export function HistoryModal({ title, data, onClose }: Props) {
  if (!data || data.length < 2) return null;

  const first = data[0].value;
  const last = data[data.length - 1].value;
  const color = last >= first ? "#22c55e" : "#ef4444";
  const changePct = ((last - first) / first * 100).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 w-[700px] max-w-[90vw] max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-sm text-gray-400">
              12-Month History &middot; <span style={{ color }}>{changePct}%</span> over period
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer>
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(d) => {
                const parts = d.split("-");
                return `${parts[1]}/${parts[0].slice(2)}`;
              }} />
              <YAxis stroke="#64748b" fontSize={11} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#94a3b8" }}
                formatter={(v) => [Number(v).toFixed(2), title]}
              />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#grad-${title})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex gap-4 text-xs text-gray-400">
          <span>Start: <span className="text-white font-mono">{first.toFixed(2)}</span></span>
          <span>Current: <span className="text-white font-mono">{last.toFixed(2)}</span></span>
          <span>High: <span className="text-white font-mono">{Math.max(...data.map(d => d.value)).toFixed(2)}</span></span>
          <span>Low: <span className="text-white font-mono">{Math.min(...data.map(d => d.value)).toFixed(2)}</span></span>
        </div>
      </div>
    </div>
  );
}
