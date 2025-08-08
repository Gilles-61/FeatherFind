
"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Languages } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import type { Locale } from "@/lib/i18n"

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  const handleLanguageChange = (value: string) => {
    setLocale(value as Locale);
  };
  
  return (
    <div className="flex items-center gap-2 p-2 rounded-md hover:bg-sidebar-accent">
       <Languages className="h-5 w-5 text-sidebar-foreground" />
       <div className="group-data-[collapsible=icon]:hidden">
        <Select value={locale} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[180px] h-9 border-0 bg-transparent focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
            </SelectContent>
        </Select>
       </div>
    </div>
  )
}
