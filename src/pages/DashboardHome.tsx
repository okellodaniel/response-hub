import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';

const DashboardHome = () => {
  const navigate = useNavigate();
  const { records } = useSearch();
  
  const completedSearches = records.filter(r => r.status === 'completed').length;
  const pendingSearches = records.filter(r => r.status === 'pending').length;

  const stats = [
    {
      title: 'Total Searches',
      value: records.length,
      icon: Search,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Completed',
      value: completedSearches,
      icon: CheckCircle,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      title: 'Pending',
      value: pendingSearches,
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your searches.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Get started with your most common tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={() => navigate('/dashboard/searches')} className="gap-2">
            <Search className="w-4 h-4" />
            View All Searches
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard/searches')}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Add New Search
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardHome;
