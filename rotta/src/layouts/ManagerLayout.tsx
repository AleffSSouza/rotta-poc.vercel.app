import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'

export default function ManagerLayout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="min-h-dvh lg:flex">
      <div className="sticky top-0 hidden h-dvh lg:block">
        <Sidebar />
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 animate-fade-in bg-ink-950/50" onClick={() => setOpen(false)} />
          <div className="relative h-full w-64 animate-slide-in-right">
            <Sidebar onNavigate={() => setOpen(false)} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <Header onMenu={() => setOpen(true)} />
        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
