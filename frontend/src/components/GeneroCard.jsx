import { useState } from 'react'
import { Pencil, Trash2, Gauge, MapPin } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function GeneroCard({ genero, onEdit, onDelete }) {
  const { isAuthenticated } = useAuth()
  const [isHovered, setIsHovered] = useState(false)

  // Resolve distinct colors for default mock genres to make UI vibrant
  const defaultColors = {
    g1: '#f97316', // Orange for Hardstyle
    g2: '#ef4444', // Red for Rawstyle
    g3: '#06b6d4', // Cyan for Hardcore
    g4: '#ec4899', // Pink for Frenchcore
  }
  const color = genero.cor || defaultColors[genero.id] || '#a855f7'

  // Resolve acronym/sigla from form or dynamically generate it
  const getSigla = (genero) => {
    if (genero.sigla) return genero.sigla.toUpperCase()
    const nome = genero.nome || ''
    if (!nome) return 'GEN'
    if (nome.toLowerCase().includes('hardstyle')) return 'HDS'
    if (nome.toLowerCase().includes('rawstyle')) return 'RWS'
    if (nome.toLowerCase().includes('hardcore')) return 'HDC'
    if (nome.toLowerCase().includes('frenchcore')) return 'FRC'
    return nome.slice(0, 3).toUpperCase()
  }
  const sigla = getSigla(genero)

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/60 p-5 text-slate-900 shadow-[0_18px_55px_rgba(15,23,42,0.12)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-100 select-none h-[136px] w-full max-w-[380px] justify-self-center"
      style={{
        borderColor: isHovered ? `${color}50` : undefined,
        boxShadow: isHovered ? `0 0 20px ${color}25` : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background soft glow gradient - MATCHING FESTIVAL CARD EXACTLY */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.08),transparent_30%,rgba(99,102,241,0.05))] opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
      <div 
        className="pointer-events-none absolute -left-16 top-4 h-40 w-40 rounded-full blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" 
        style={{ backgroundColor: `${color}10` }}
      />
      <div 
        className="pointer-events-none absolute -bottom-14 right-[-3rem] h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" 
      />

      {/* Action Buttons (Top Right, matching FestivalCard/DjCard exactly) */}
      {isAuthenticated && (
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-400/30 hover:bg-purple-400/10 hover:text-purple-700 focus-visible:border-purple-400/40 focus-visible:bg-purple-400/10 focus-visible:text-purple-700 dark:border-white/10 dark:bg-slate-950/55 dark:text-slate-200 dark:shadow-black/20 dark:hover:text-purple-200 dark:focus-visible:text-purple-200"
            aria-label="Editar género"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-700 focus-visible:border-rose-400/40 focus-visible:bg-rose-400/10 focus-visible:text-rose-700 dark:border-white/10 dark:bg-slate-950/55 dark:text-slate-200 dark:shadow-black/20 dark:hover:text-rose-200 dark:focus-visible:text-rose-200"
            aria-label="Eliminar género"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}

      {/* Content wrapper with the exact same spacing and layout as FestivalCard */}
      <div className="relative flex h-full items-center gap-4 pr-12">
        
        {/* Avatar / Icon Circle */}
        <div
          className="h-20 w-20 shrink-0 rounded-full border border-slate-200/80 flex items-center justify-center shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_18px_40px_rgba(15,23,42,0.14)] dark:border-white/10 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_18px_40px_rgba(0,0,0,0.35)] transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${color}30, ${color}10)`,
            borderColor: `${color}40`
          }}
        >
          <span
            className="text-base font-black tracking-wider uppercase font-sans"
            style={{ color: color }}
          >
            {sigla}
          </span>
        </div>

        {/* Right Section: text and metrics */}
        <div className="flex flex-col justify-between h-full py-0.5 flex-1 min-w-0">
          {/* Text Section */}
          <div className="min-w-0">
            <h2 className="truncate text-xl font-black leading-none text-slate-900 dark:text-white">
              {genero.nome}
            </h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Gauge size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
              <span>{genero.bpm || 120} BPM</span>
            </p>
          </div>

          {/* Bottom Metrics: Intensidade Progress Bar + Origem Badge */}
          <div className="mt-auto flex flex-col gap-2 w-full">
            {/* Intensidade Bar */}
            <div className="flex items-center gap-2 w-full max-w-[180px]">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
                Intensidade
              </span>
              <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-300/10 dark:border-white/5">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${(genero.intensidade || 5) * 10}%`,
                    backgroundColor: color,
                    boxShadow: `0 0 6px ${color}60`
                  }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 shrink-0">
                {genero.intensidade || 5}/10
              </span>
            </div>

            {/* Badges Row */}
            {genero.origem && (
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-slate-300/40 bg-slate-500/10 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin size={10} className="text-slate-400 dark:text-slate-500" />
                  <span>{genero.origem}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
