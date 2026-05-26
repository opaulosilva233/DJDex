import { CalendarDays, MapPin, Pencil, Star, Trash2, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const fallbackImageDataUrl =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="80" fill="%23e2e8f0"/><circle cx="80" cy="64" r="28" fill="%2394a3b8"/><path d="M28 136c11-21 31-32 52-32s41 11 52 32" fill="%2394a3b8"/></svg>'

function formatDate(value) {
  if (!value) return 'Data indisponível'

  const parts = String(value).split('-')
  if (parts.length !== 3) return value

  const [year, month, day] = parts
  const date = new Date(Number(year), Number(month) - 1, Number(day))

  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatScore(value) {
  const score = Number(value)
  if (Number.isNaN(score)) return '0.0'
  return Number.isInteger(score) ? String(score) : score.toFixed(1)
}

export default function DjCard({ set, djs = [], festivais = [], generos = [], onDelete }) {
  const navigate = useNavigate()
  const dj = djs.find((entry) => entry.id === set.djId)
  const festival = festivais.find((entry) => entry.id === set.festivalId)
  const djGeneros = generos.filter((genero) => Array.isArray(dj?.generoIds) && dj.generoIds.includes(genero.id))
  const djImagemSrc = dj?.imagem || '/images/default-dj.png'
  const scoreValue = Number(set.avaliacao ?? 0)
  const scorePercent = Math.max(0, Math.min(100, scoreValue * 10))
  const formattedDate = formatDate(set.data)

  function handleImageError(event) {
    if (event.currentTarget.dataset.fallbackApplied !== 'true') {
      event.currentTarget.dataset.fallbackApplied = 'true'
      event.currentTarget.src = fallbackImageDataUrl
    }
  }

  return (
    <article className="group relative w-[320px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 p-5 text-slate-100 shadow-[0_18px_55px_rgba(2,6,23,0.42)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/20 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-cyan-400/5 opacity-70" />
      <div className="pointer-events-none absolute -top-20 right-[-3.5rem] h-40 w-40 rounded-full bg-purple-500/10 blur-3xl transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex h-full flex-col gap-5">
        <div className="flex items-start gap-4">
          <img
            src={djImagemSrc}
            alt={dj?.nome ?? 'DJ'}
            onError={handleImageError}
            className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-1 ring-white/10 shadow-lg shadow-black/30"
          />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400">
              <UserRound size={13} className="text-cyan-300" />
              <span>Artista</span>
            </div>

            <h2 className="truncate text-xl font-bold tracking-wide text-white">
              {set.nome ?? dj?.nome ?? 'Set sem nome'}
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-sm font-medium text-cyan-200">
                {dj?.nome ?? 'DJ desconhecido'}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300">
                {festival?.nome ?? 'Festival desconhecido'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {djGeneros.length > 0 ? (
            djGeneros.map((genero) => (
              <span
                key={genero.id}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300"
              >
                {genero.nome}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">
              Sem géneros definidos
            </span>
          )}
        </div>

        <div className="grid gap-2 rounded-2xl border border-white/5 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <MapPin size={14} className="text-purple-300" />
            <span>{festival?.local ?? 'Local desconhecido'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <CalendarDays size={14} className="text-purple-300" />
            <span>{formattedDate}</span>
            <span className="text-slate-500">•</span>
            <span>{set.hora ?? '--:--'}</span>
          </div>
        </div>

        {set.avaliacao !== undefined && set.avaliacao !== null && (
          <div className="grid gap-2 rounded-2xl border border-white/5 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Avaliação</span>
              <div className="flex items-end gap-1 font-mono text-2xl font-black leading-none text-white">
                <Star size={16} className="mb-0.5 text-fuchsia-300" fill="currentColor" />
                <span>{formatScore(set.avaliacao)}</span>
                <span className="ml-1 text-sm font-semibold text-slate-500">/10</span>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800/80 ring-1 ring-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 shadow-[0_0_18px_rgba(217,70,239,0.45)] transition-all duration-500"
                style={{ width: `${scorePercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            {formattedDate}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/sets/editar/${set.id}`)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition-colors duration-200 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-200"
              aria-label="Editar set"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(set.id)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition-colors duration-200 hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-200"
              aria-label="Eliminar set"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}