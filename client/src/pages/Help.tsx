import { Layout } from "@/components/Layout";
import { Construction } from "lucide-react";

export default function Help() {
  return (
    <Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-orange-500/10 flex items-center justify-center border-2 border-orange-500/50 animate-pulse">
          <Construction className="w-12 h-12 text-orange-500" />
        </div>
        <div>
          <h1 className="text-4xl font-display font-bold text-orange-500">WORK IN PROGRESS</h1>
          <p className="text-muted-foreground mt-4 text-xl max-w-lg mx-auto">
            The help center is currently under construction. <br />
            Our support droids are working hard to build this section.
          </p>
          <p className="mt-8 text-sm font-mono text-white/30">ERR_404_CONTENT_NOT_FOUND</p>
        </div>
      </div>
    </Layout>
  );
}
