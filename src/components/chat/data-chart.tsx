"use client";

import * as React from 'react';
import { Bar, BarChart, Line, LineChart, Area, AreaChart, Pie, PieChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

type DataChartProps = {
  data: Record<string, any>[];
  chartType: 'bar' | 'line' | 'area' | 'pie' | 'none';
  title: string;
};

export function DataChart({ data, chartType, title }: DataChartProps) {
  const { keys, categoricalKey, numericalKeys } = React.useMemo(() => {
    if (!data || data.length === 0) {
      return { keys: [], categoricalKey: null, numericalKeys: [] };
    }
    const allKeys = Object.keys(data[0]);
    const catKey = allKeys.find(key => typeof data[0][key] === 'string' || key.toLowerCase().includes('date')) || allKeys[0];
    const numKeys = allKeys.filter(key => typeof data[0][key] === 'number' && key !== catKey);
    return { keys: allKeys, categoricalKey: catKey, numericalKeys: numKeys };
  }, [data]);

  if (!data || data.length === 0 || !categoricalKey || numericalKeys.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Cannot visualize this data.</div>;
  }

  const chartConfig = numericalKeys.reduce((acc, key, index) => {
    acc[key] = {
      label: key,
      color: `hsl(var(--chart-${(index % 5) + 1}))`,
    };
    return acc;
  }, {} as any);

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey={categoricalKey} tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend content={<ChartLegendContent />} />
            {numericalKeys.map(key => (
              <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={4} />
            ))}
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey={categoricalKey} tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend content={<ChartLegendContent />} />
            {numericalKeys.map(key => (
              <Line key={key} type="monotone" dataKey={key} stroke={`var(--color-${key})`} strokeWidth={2} dot={true} />
            ))}
          </LineChart>
        );
        case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey={categoricalKey} tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend content={<ChartLegendContent />} />
            {numericalKeys.map(key => (
                 <Area key={key} type="monotone" dataKey={key} stackId="1" stroke={`var(--color-${key})`} fill={`var(--color-${key})`} fillOpacity={0.4} strokeWidth={2} dot={true} />
            ))}
          </AreaChart>
        );
      case 'pie':
        // Pie charts typically visualize a single numerical value across categories.
        // We'll use the first numerical key.
        const valueKey = numericalKeys[0];
        return (
            <PieChart>
                 <Tooltip content={<ChartTooltipContent nameKey={categoricalKey} />} />
                 <Legend content={<ChartLegendContent />} />
                 <Pie
                    data={data}
                    dataKey={valueKey}
                    nameKey={categoricalKey}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill={`var(--color-${valueKey})`}
                    labelLine={false}
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                 >
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                    ))}
                 </Pie>
            </PieChart>
        );
      default:
        return <div className="flex items-center justify-center h-full text-muted-foreground">Unsupported chart type.</div>;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-center font-semibold mb-4">{title}</h3>
      <ChartContainer config={chartConfig} className="w-full h-full">
        {renderChart()}
      </ChartContainer>
    </div>
  );
}
