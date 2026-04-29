import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  ActivitySquare, 
  AlertTriangle,
  PlusCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navigation = [
    { name: "Tableau de bord", href: "/", icon: LayoutDashboard },
    { name: "Patients", href: "/patients", icon: Users },
    { name: "Moniteur de Risque", href: "/risk-monitor", icon: AlertTriangle },
  ];

  return (
    <div className="flex min-h-screen w-full bg-slate-50/50">
      <aside className="w-64 border-r bg-white flex flex-col hidden md:flex shrink-0">
        <div className="h-16 flex items-center px-6 border-b">
          <ActivitySquare className="h-6 w-6 text-teal-600 mr-2" />
          <span className="font-semibold text-lg text-slate-900 tracking-tight">Dorian EAPA</span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors",
                    isActive
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-teal-600" : "text-slate-400")} />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <Link href="/patients/new">
            <div className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md cursor-pointer transition-colors">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nouveau Patient
            </div>
          </Link>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b bg-white flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center">
            <ActivitySquare className="h-6 w-6 text-teal-600 mr-2" />
            <span className="font-semibold text-lg">Dorian EAPA</span>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
