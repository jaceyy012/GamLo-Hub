import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CinematicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
}

export function CinematicCard({ children, className, delay = 0, ...props }: CinematicCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card border border-white/5",
        "shadow-lg shadow-black/50 hover:shadow-primary/20 hover:border-primary/30",
        "transition-all duration-300 group",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-0 pointer-events-none" />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  );
}
