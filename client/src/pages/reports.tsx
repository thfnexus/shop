import { useKhata } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function Reports() {
  const { khatas } = useKhata();

  // Sort by total descending for the chart
  const data = [...khatas]
    .sort((a, b) => b.total - a.total)
    .slice(0, 10) // Top 10 debtors
    .map(k => ({
      name: k.name,
      amount: k.total
    }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-heading font-bold">Reports</h2>
        <p className="text-muted-foreground">Financial insights and analysis.</p>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Top Outstanding Accounts</CardTitle>
            <CardDescription>Customers with the highest pending balances</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {data.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data available for reports yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₨${value}`}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
