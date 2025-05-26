import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function CategoryDropdownMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full px-3 py-1 bg-muted text-xs">
          <div className="w-full"></div>
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-32">
        <DropdownMenuItem>Environmental</DropdownMenuItem>
        <DropdownMenuItem>Infrastracture</DropdownMenuItem>
        <DropdownMenuItem>Basic Services</DropdownMenuItem>
        <DropdownMenuItem>Crime and Order</DropdownMenuItem>
        <DropdownMenuItem>Miscellaneous</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
