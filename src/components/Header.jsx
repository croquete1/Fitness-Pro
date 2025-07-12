function Header() {
  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-sm">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-sm md:px-6 2xl:px-11">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Painel de Controlo</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-700">
            U
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
