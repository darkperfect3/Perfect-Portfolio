import { Link } from "wouter";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(190_90%_50%/0.04)_0%,transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center max-w-md"
      >
        <div className="mb-8">
          <span className="text-[120px] font-heading font-bold leading-none text-primary/10 select-none block">
            404
          </span>
        </div>

        <h1 className="text-3xl font-heading font-bold tracking-tight mb-4">
          Page not found
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-10">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" className="h-12 px-8 rounded-full gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" /> Go Home
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="h-12 px-8 rounded-full gap-2 border-border/50 hover:bg-secondary/50"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
