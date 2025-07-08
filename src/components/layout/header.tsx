import Link from 'next/link';
import { ModelVerseIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="#" className="flex items-center gap-2">
            <ModelVerseIcon className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">ModelVerse</span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
            <Link
              href="#"
              className="rounded-md px-3 py-2 text-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Models
            </Link>
            <Link
              href="#"
              className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Chat
            </Link>
            <Link
              href="#"
              className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Rankings
            </Link>
            <Link
              href="#"
              className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Enterprise
            </Link>
            <Link
              href="#"
              className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Docs
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" className="hidden rounded-full sm:inline-flex">
            Sign in
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-card p-6">
              <nav className="grid gap-6 text-lg font-medium">
                <Link href="#" className="flex items-center gap-3 text-lg font-semibold">
                  <ModelVerseIcon className="h-6 w-6 text-primary" />
                  <span>ModelVerse</span>
                </Link>
                <Link href="#" className="hover:text-foreground">
                  Models
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Chat
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Rankings
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Enterprise
                </Link>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Docs
                </Link>
                <div className="border-t pt-6">
                  <Button variant="outline" className="w-full rounded-full">Sign in</Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
