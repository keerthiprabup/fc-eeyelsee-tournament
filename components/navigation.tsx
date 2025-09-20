"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet"
import { Trophy, Calendar, BarChart3, Users, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  { name: "Tournament", href: "/", icon: Trophy },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Stats", href: "/results", icon: BarChart3 },
  { name: "Teams", href: "/teams", icon: Users },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Trophy className="w-6 h-6 text-primary" />
            FC EEYELSEE
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Button
                  key={item.name}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className={cn(
                    "flex items-center gap-2",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <Link href={item.href}>
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                </Button>
              )
            })}
          </div>

          {/* Mobile Navigation Drawer */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <SheetHeader className="font-bold text-lg mb-4">Menu</SheetHeader>
                <div className="flex flex-col gap-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                      <Button
                        key={item.name}
                        variant={isActive ? "default" : "ghost"}
                        asChild
                        className={cn(
                          "justify-start flex items-center gap-2",
                          isActive && "bg-primary text-primary-foreground"
                        )}
                      >
                        <Link href={item.href}>
                          <Icon className="w-4 h-4" />
                          {item.name}
                        </Link>
                      </Button>
                    )
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
