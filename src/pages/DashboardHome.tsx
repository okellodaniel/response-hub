import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Newspaper,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  TrendingUp,
  FileText,
  BarChart3,
} from 'lucide-react';
import { useSearch } from '@/contexts/SearchContext';
import { useGeneralNews } from '@/contexts/GeneralNewsContext';
import { useUser } from '@clerk/clerk-react';
import { format, isToday } from 'date-fns';

// ─── Mini progress bar ─────────────────────────────────────────────────────────
const ProgressBar = ({ value, max, color }: { value: number; max: number; color: string }) => {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
      <div
        className={`progress-bar-fill h-full rounded-full transition-all duration-500 ${color}`}
        style={{ '--progress-width': `${pct}%` } as React.CSSProperties}
      />
    </div>
  );
};

// ─── Stat card ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
}

const StatCard = ({ title, value, subtitle, icon: Icon, iconBg, iconColor, onClick }: StatCardProps) => (
  <Card
    className={`border-0 shadow-sm transition-all duration-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}`}
    onClick={onClick}
  >
    <CardContent className="pt-5 pb-4 px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">{title}</p>
          <p className="text-3xl font-bold text-foreground leading-none">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl shrink-0 ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

// ─── Main component ────────────────────────────────────────────────────────────
const DashboardHome = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { records: adverseRecords } = useSearch();
  const { records: generalRecords } = useGeneralNews();

  // Adverse news metrics
  const adverseTotal = adverseRecords.length;
  const adverseCompleted = adverseRecords.filter(r => r.status === 'completed').length;
  const adversePending = adverseRecords.filter(r => r.status === 'pending').length;
  const adverseErrors = adverseRecords.filter(r => r.status === 'error').length;
  const adverseToday = adverseRecords.filter(r => isToday(new Date(r.createdAt))).length;

  // General news metrics
  const generalTotal = generalRecords.length;
  const generalArticlesFound = generalRecords.reduce((sum, r) => sum + r.resultsCount, 0);
  const generalAvgResults = generalTotal > 0 ? (generalArticlesFound / generalTotal).toFixed(1) : '0';
  const generalToday = generalRecords.filter(r => isToday(new Date(r.createdAt))).length;

  // Combined
  const totalSearches = adverseTotal + generalTotal;

  // Recent items
  const recentAdverse = [...adverseRecords]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentGeneral = [...generalRecords]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const adverseStatusColors = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    completed: 'bg-success/10 text-success border-success/20',
    error: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const firstName = user?.firstName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'there';

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Welcome banner ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl gradient-primary p-6 text-white shadow-glow">
        <div className="relative z-10">
          <p className="text-sm font-medium text-white/70 mb-1">Good to see you,</p>
          <h1 className="text-2xl font-bold">{firstName}</h1>
          <p className="text-white/70 text-sm mt-1">
            {totalSearches === 0
              ? 'No searches yet — run your first one below.'
              : `You have ${totalSearches} search${totalSearches !== 1 ? 'es' : ''} across both modules.`}
          </p>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 -right-2 w-28 h-28 rounded-full bg-white/5" />
      </div>

      {/* ── Top-level stats ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard
          title="Total Searches"
          value={totalSearches}
          subtitle="Both modules"
          icon={BarChart3}
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />
        <StatCard
          title="Adverse News"
          value={adverseTotal}
          subtitle={`${adverseToday} today`}
          icon={AlertTriangle}
          iconBg="bg-destructive/10"
          iconColor="text-destructive"
          onClick={() => navigate('/dashboard/searches')}
        />
        <StatCard
          title="General News"
          value={generalTotal}
          subtitle={`${generalToday} today`}
          icon={Newspaper}
          iconBg="bg-accent/10"
          iconColor="text-accent"
          onClick={() => navigate('/dashboard/general-news')}
        />
        <StatCard
          title="Articles Found"
          value={generalArticlesFound}
          subtitle={`~${generalAvgResults} per search`}
          icon={FileText}
          iconBg="bg-success/10"
          iconColor="text-success"
        />
      </div>

      {/* ── Detail panels ───────────────────────────────────────────────────── */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* Adverse News panel */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-destructive/10">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                <CardTitle className="text-base">Adverse News</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/searches')} className="text-xs h-7 px-2">
                View all <ChevronRight className="w-3 h-3 ml-0.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status breakdown */}
            <div className="space-y-2.5 p-4 bg-muted/40 rounded-xl">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Completed
                </span>
                <span className="font-semibold">{adverseCompleted}</span>
              </div>
              <ProgressBar value={adverseCompleted} max={adverseTotal} color="bg-success" />

              <div className="flex items-center justify-between text-sm mt-1">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-warning" /> Pending
                </span>
                <span className="font-semibold">{adversePending}</span>
              </div>
              <ProgressBar value={adversePending} max={adverseTotal} color="bg-warning" />

              {adverseErrors > 0 && (
                <>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <XCircle className="w-3.5 h-3.5 text-destructive" /> Errors
                    </span>
                    <span className="font-semibold">{adverseErrors}</span>
                  </div>
                  <ProgressBar value={adverseErrors} max={adverseTotal} color="bg-destructive" />
                </>
              )}
            </div>

            {/* Recent list */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Recent</p>
              {recentAdverse.length > 0 ? (
                <div className="space-y-1.5">
                  {recentAdverse.map(record => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate('/dashboard/searches')}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{record.names}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(record.createdAt), 'MMM d, HH:mm')}</p>
                      </div>
                      <Badge variant="outline" className={`ml-2 text-xs shrink-0 ${adverseStatusColors[record.status]}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Search className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No adverse news searches yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* General News panel */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-accent/10">
                  <Newspaper className="w-4 h-4 text-accent" />
                </div>
                <CardTitle className="text-base">General News</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/general-news')} className="text-xs h-7 px-2">
                View all <ChevronRight className="w-3 h-3 ml-0.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-muted/40 rounded-xl">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Searches Run</p>
                <p className="text-2xl font-bold text-foreground">{generalTotal}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Articles Found</p>
                <p className="text-2xl font-bold text-foreground">{generalArticlesFound}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Avg Results</p>
                <p className="text-2xl font-bold text-foreground">{generalAvgResults}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Searched Today</p>
                <p className="text-2xl font-bold text-foreground">{generalToday}</p>
              </div>
            </div>

            {/* Recent list */}
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Recent</p>
              {recentGeneral.length > 0 ? (
                <div className="space-y-1.5">
                  {recentGeneral.map(record => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate('/dashboard/general-news')}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{record.query}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(record.createdAt), 'MMM d, HH:mm')}</p>
                      </div>
                      <Badge variant="outline" className="ml-2 text-xs shrink-0 bg-accent/10 text-accent border-accent/20">
                        {record.resultsCount} result{record.resultsCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Newspaper className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No general news searches yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Quick actions ───────────────────────────────────────────────────── */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>Jump into your most common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1.5 border-destructive/20 hover:bg-destructive/5 hover:border-destructive/40"
              onClick={() => navigate('/dashboard/searches')}
            >
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-xs">Adverse News</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1.5 border-accent/20 hover:bg-accent/5 hover:border-accent/40"
              onClick={() => navigate('/dashboard/general-news')}
            >
              <Newspaper className="w-4 h-4 text-accent" />
              <span className="text-xs">General News</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1.5"
              onClick={() => navigate('/dashboard/searches')}
            >
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs">New Adverse Search</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3 flex-col gap-1.5"
              onClick={() => navigate('/dashboard/general-news')}
            >
              <FileText className="w-4 h-4 text-success" />
              <span className="text-xs">New General Search</span>
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default DashboardHome;
