
import { Button } from "@/components/ui/button"
import { User, Dumbbell, BarChart3, MessageCircle, Sun, Moon } from "lucide-react"
import { useTab } from "@/contexts/TabContext"

export default function Sidebar({ darkMode, setDarkMode }) {
  const { setTab } = useTab()
  return (
    <aside className="hidden md:flex flex-col bg-[#1f2937] dark:bg-[#161b22] text-gray-100 p-4 w-56">
      <nav className="flex flex-col gap-2">
        <Button variant="ghost" className="justify-start gap-2" onClick={() => setTab("perfil")}><User size={16} /> Perfil</Button>
        <Button variant="ghost" className="justify-start gap-2" onClick={() => setTab("planos")}><Dumbbell size={16} /> Planos</Button>
        <Button variant="ghost" className="justify-start gap-2" onClick={() => setTab("progresso")}><BarChart3 size={16} /> Progresso</Button>
        <Button variant="ghost" className="justify-start gap-2" onClick={() => setTab("chat")}><MessageCircle size={16} /> Chat</Button>
        <Button onClick={() => setDarkMode(!darkMode)} variant="outline" className="justify-start gap-2">
          {darkMode ? <Sun size={16} /> : <Moon size={16} />} {darkMode ? "Claro" : "Escuro"}
        </Button>
      </nav>
    </aside>
  )
}
