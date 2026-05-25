import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 rounded-full w-11 h-11 shadow-lg border-border/50 glass opacity-80 hover:opacity-100 transition-all duration-300"
      title="回到顶部"
    >
      <ArrowUp className="w-4 h-4" />
    </Button>
  );
}
