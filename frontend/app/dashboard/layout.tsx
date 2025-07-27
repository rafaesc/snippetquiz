import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth0 } from "../../lib/auth0";

async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the user session from Auth0
  const session  = await auth0.getSession();
  
  // If there's no user or there's an error, redirect to login
  if (!session) {
    redirect("/auth/login");
  }


  return (
    <div className="min-h-screen flex flex-col">
      {/* Dashboard Header/Navigation */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="LinkWrite logo"
              width={100}
              height={20}
              priority
            />
            <span className="font-semibold">Dashboard</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link 
              href="/dashboard" 
              className="text-sm hover:text-gray-600 dark:hover:text-gray-300"
            >
              Overview
            </Link>
            <Link 
              href="/dashboard/content" 
              className="text-sm hover:text-gray-600 dark:hover:text-gray-300"
            >
              Content
            </Link>
            <Link 
              href="/dashboard/settings" 
              className="text-sm hover:text-gray-600 dark:hover:text-gray-300"
            >
              Settings
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm">{session.user.name || session.user.email}</span>
              <Link 
                href="/auth/logout" 
                className="text-sm hover:text-gray-600 dark:hover:text-gray-300"
              >
                Logout
              </Link>
            </div>
          </nav>
        </div>
      </header>
      
      {/* Dashboard Content */}
      <div className="flex-1 container mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;