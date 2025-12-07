'use client';

import { useChartData, ChartPoint } from '@/hooks/useChartData';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { Loader2, Moon } from 'lucide-react';
import { useMemo } from 'react';

interface MoonChartProps {
  tokenAddress: string;
  totalSold: bigint;
}

export default function MoonChart({ tokenAddress, totalSold }: MoonChartProps) {
  const { data, isLoading } = useChartData(tokenAddress, totalSold);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg shadow-xl text-xs">
          <p className="text-gray-400 mb-1">{label}</p>
          <p className="text-yellow-400 font-bold">
            Price: ${Number(payload[0].value).toFixed(6)}
          </p>
          <p className="text-purple-400">
            MCap: ${(Number(payload[0].payload.mcap)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  const formattedData = useMemo(() => {
    return data.map(d => ({
        ...d,
        formattedTime: d.timestamp > 0 
            ? format(new Date(d.timestamp * 1000), 'HH:mm:ss') 
            : `Blk ${d.block}`
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-[#111] rounded-xl border border-white/5">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
        <div className="h-[400px] w-full flex flex-col items-center justify-center bg-[#111] rounded-xl border border-white/5 text-gray-500 gap-4">
            <Moon className="w-12 h-12 text-gray-700" />
            <p>No trades yet. Be the first to launch!</p>
        </div>
    );
  }

  return (
    <div className="h-[400px] w-full bg-[#111] rounded-xl border border-white/5 p-4 overflow-hidden relative">
      <h3 className="text-sm text-gray-400 mb-4 ml-2">Price History (USD)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis 
            dataKey="formattedTime" 
            stroke="#666" 
            tick={{fontSize: 10}}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="#666" 
            tick={{fontSize: 10}} 
            domain={['auto', 'auto']}
            tickFormatter={(value) => value.toFixed(6)}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#FFD700" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

