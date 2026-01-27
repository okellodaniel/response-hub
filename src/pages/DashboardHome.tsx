import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const DashboardHome = () => {
  const navigate = useNavigate();
  const { records } = useSearch();

  const completedSearches = records.filter(r => r.status === 'completed').length;
  const pendingSearches = records.filter(r => r.status === 'pending').length;

  // Get 5 most recent searches
  const recentSearches = [...records]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

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

  const statusColors = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    completed: 'bg-success/10 text-success border-success/20',
    error: 'bg-destructive/10 text-destructive border-destructive/20',
  };

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

      <div className="grid gap-6 md:grid-cols-1">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with your most common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button onClick={() => navigate('/dashboard/searches')} className="gap-2 justify-start">
              <Search className="w-4 h-4" />
              View All Searches
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard/searches')} className="justify-start">
              <TrendingUp className="w-4 h-4 mr-2" />
              Add New Search
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Searches</CardTitle>
              <CardDescription>
                Your 5 most recent search records
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/searches')}>
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentSearches.length > 0 ? (
              <div className="space-y-3">
                {recentSearches.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/dashboard/searches')}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        {record.names}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(record.createdAt), 'MMM d, HH:mm')}
                      </div>
                    </div>
                    <Badge variant="outline" className={statusColors[record.status]}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No searches yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/dashboard/searches')}
                >
                  Create your first search
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
