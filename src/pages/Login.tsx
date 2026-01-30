import { SignIn } from '@clerk/clerk-react';
import WaveBackground from '@/components/WaveBackground';
import { Search } from 'lucide-react';

const Login = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Wave Design */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary/5 to-accent/5 items-center justify-center">
        <WaveBackground />
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Search className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">SearchHub</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Your powerful API search dashboard for managing and tracking person records.
          </p>
        </div>
      </div>

      {/* Right Panel - Clerk Sign In */}
      <div className="flex-1 flex items-center justify-center p-8">
        <SignIn routing="hash" forceRedirectUrl="/dashboard" />
      </div>
    </div>
  );
};

export default Login;
