import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar";
import Command from "@/lib/components/sidebar-command";
import Setting from "@/lib/components/sidebar-config";
import Files from "@/lib/components/sidebar-files";
import { ComponentProps, useEffect, useState } from "react";

let items = [
  Files,
]

export default function Sidebar_({ ...props }: ComponentProps<typeof Sidebar>) {
  const { setOpen, open } = useSidebar()
  const [activeIndex, setActiveIndex] = useState(0)
  const [content, setContent] = useState(null);

  useEffect(() => {
    localStorage.setItem("sidebar:open", `${open}`)
  }, [open])

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row sticky page-h"
      {...props}
    >
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-0">
              <SidebarMenu>
                {items.map((Item, i) => (
                  <span
                    key={i}
                    onClick={() => {
                      setActiveIndex(i)
                      //@ts-ignore
                      setOpen((o) => !o)
                    }}>
                    {/*@ts-ignore*/}
                    <Item active={activeIndex == i} setContent={setContent} />
                  </span>
                ))}
                <Command />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Setting />
        </SidebarFooter>
      </Sidebar>

      <Sidebar collapsible="none" className="flex-1 flex m-0">
        <SidebarContent>
          {content}
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </Sidebar>
  )
}
