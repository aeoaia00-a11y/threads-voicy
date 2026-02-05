"use client";

import {
  Home,
  Search,
  PenSquare,
  FileText,
  BarChart3,
  Calendar,
  Users,
  TrendingUp,
  FlaskConical,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/", label: "ダッシュボード", icon: Home },
  { href: "/research", label: "競合リサーチ", icon: Search },
  { href: "/generate", label: "投稿生成", icon: PenSquare },
  { href: "/posts", label: "投稿管理", icon: FileText },
  { href: "/analytics", label: "分析", icon: BarChart3 },
  { href: "/calendar", label: "カレンダー", icon: Calendar },
  { href: "/competitors", label: "競合監視", icon: Users },
  { href: "/trends", label: "トレンド", icon: TrendingUp },
  { href: "/ab-test", label: "A/Bテスト", icon: FlaskConical },
];

const bottomItems = [{ href: "/settings", label: "設定", icon: Settings }];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <ul className="space-y-1">
            {bottomItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
