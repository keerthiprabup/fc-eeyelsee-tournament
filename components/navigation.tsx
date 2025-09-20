"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, BarChart3, Camera, Users, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  { name: "Tournament", href: "/", icon: Trophy },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Stats", href: "/results", icon: BarChart3 },
  // { name: "Gallery", href: "/gallery", icon: Camera },
  { name: "Teams", href: "/teams", icon: Users },
  // { name: "Live Updates", href: "/live", icon: Settings },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="bg-card border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Trophy className="w-6 h-6 text-primary" />
            FC EEYELSEE
          </Link>

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
                  className={cn("flex items-center gap-2", isActive && "bg-primary text-primary-foreground")}
                >
                  <Link href={item.href}>
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                </Button>
              )
            })}
          </div>

          {/* Mobile menu button - simplified for now */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
