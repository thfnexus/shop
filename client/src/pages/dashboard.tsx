import { useKhata } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowUpRight, ArrowDownLeft, Users, Wallet, ArrowRight } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { khatas } = useKhata();

  const totalReceivable = khatas.reduce((acc, k) => acc + k.total, 0);
  const totalCustomers = khatas.length;
  
  // Calculate recent activity (mock logic - just getting latest entries from all khatas)
  const recentActivity = khatas
    .flatMap(k => k.entries.map(e => ({ ...e, customerName: k.name, khataId: k.id })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-heading font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your business finances</p>
        </div>
        <Link href="/khatas">
          <Button>View All Khatas <ArrowRight className="ml-2 h-4 w-4" /></Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receivable</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">₨ {totalReceivable.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total outstanding amount
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Khatas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total customers recorded
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{recentActivity.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In the last few days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest transactions across all accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity found.</p>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      activity.type === 'credit' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {activity.type === 'credit' ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{activity.customerName}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.item} • {format(new Date(activity.date), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className={`font-mono font-medium ${
                    activity.type === 'credit' ? 'text-destructive' : 'text-success'
                  }`}>
                    {activity.type === 'credit' ? '+' : '-'} ₨ {activity.price.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
