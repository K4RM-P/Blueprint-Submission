import { PublicFooter } from "@/components/shell/public-footer";
import { PublicHeader } from "@/components/shell/public-header";
import { hasSession } from "@/lib/auth";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const signedIn = await hasSession();
  return (
    <div data-expression="3" className="flex min-h-full flex-1 flex-col overflow-x-clip">
      <PublicHeader dashboardHref={signedIn ? "/dashboard" : null} />
      <div id="main" className="flex flex-1 flex-col">
        {children}
      </div>
      <PublicFooter />
    </div>
  );
}
