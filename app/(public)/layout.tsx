import { PublicFooter } from "@/components/shell/public-footer";
import { PublicHeader } from "@/components/shell/public-header";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-expression="3" className="flex min-h-full flex-1 flex-col overflow-x-clip">
      <PublicHeader />
      <div id="main" className="flex flex-1 flex-col">
        {children}
      </div>
      <PublicFooter />
    </div>
  );
}
