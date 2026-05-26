import { Clock, Pencil, Star, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const fallbackImageDataUrl =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="80" fill="%23e2e8f0"/><circle cx="80" cy="64" r="28" fill="%2394a3b8"/><path d="M28 136c11-21 31-32 52-32s41 11 52 32" fill="%2394a3b8"/></svg>'

function getDateTicketParts(value) {
  if (!value) {
    return { day: '--', monthYear: 'data indisponível' }
  }

  const parts = String(value).split('-')
  if (parts.length !== 3) {
    return { day: '--', monthYear: String(value) }
  }

  const [year, month, day] = parts
  const date = new Date(Number(year), Number(month) - 1, Number(day))

  if (Number.isNaN(date.getTime())) {
    return { day: '--', monthYear: String(value) }
  }

  const formatted = new Intl.DateTimeFormat('pt-PT', {
    month: 'short',
    year: 'numeric',
  }).format(date)

  return {
    day,
    monthYear: formatted.toUpperCase(),
  }
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
  const dateTicket = getDateTicketParts(set.data)
  const startTime = set.horaInicio ?? set.hora ?? '--:--'
  const endTime = set.horaFim ?? null

  function parseTimeToMinutes(value) {
    if (!value || typeof value !== 'string') return null

    const normalized = value.trim()
    const [hoursPart, minutesPart] = normalized.split(':')
    const hours = Number(hoursPart)
    const minutes = Number(minutesPart)

    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null

    return hours * 60 + minutes
  }

  function formatMinutes(totalMinutes) {
    if (totalMinutes === null || Number.isNaN(totalMinutes) || totalMinutes < 0) {
      return '--'
    }

    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    if (hours === 0) {
      return `${minutes}m`
    }

    if (minutes === 0) {
      return `${hours}h`
    }

    return `${hours}h ${minutes}m`
  }

  function getEndTimeFromStart(startValue) {
    const startMinutes = parseTimeToMinutes(startValue)
    if (startMinutes === null) return '--:--'

    const totalMinutes = startMinutes + 90
    const normalizedMinutes = totalMinutes % (24 * 60)
    const hours = String(Math.floor(normalizedMinutes / 60)).padStart(2, '0')
    const minutes = String(normalizedMinutes % 60).padStart(2, '0')

    return `${hours}:${minutes}`
  }

  const resolvedEndTime = endTime ?? getEndTimeFromStart(startTime)
  const startMinutes = parseTimeToMinutes(startTime)
  const endMinutes = parseTimeToMinutes(resolvedEndTime)
  const durationMinutes =
    startMinutes !== null && endMinutes !== null
      ? (endMinutes - startMinutes + 24 * 60) % (24 * 60)
      : null
  const durationLabel = formatMinutes(durationMinutes)

  function handleImageError(event) {
    if (event.currentTarget.dataset.fallbackApplied !== 'true') {
      event.currentTarget.dataset.fallbackApplied = 'true'
      event.currentTarget.src = fallbackImageDataUrl
    }
  }

  return (
    <article className="group relative w-[320px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 p-5 text-slate-100 shadow-[0_18px_55px_rgba(2,6,23,0.42)] backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-2 hover:border-cyan-400/40 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.14),0_26px_80px_rgba(168,85,247,0.28)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.08),transparent_36%),linear-gradient(145deg,rgba(255,255,255,0.05),transparent_35%,rgba(168,85,247,0.04))] opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -left-16 top-6 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -top-20 right-[-3.5rem] h-44 w-44 rounded-full bg-purple-500/15 blur-3xl opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-x-8 bottom-0 h-16 rounded-full bg-fuchsia-500/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute right-3 top-3 z-20 flex items-center gap-2 opacity-50 transition-opacity duration-200 group-hover:opacity-100">
        <button
          type="button"
          onClick={() => navigate(`/sets/editar/${set.id}`)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-950/50 text-slate-200 shadow-lg shadow-black/20 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-200 focus-visible:border-cyan-400/40 focus-visible:bg-cyan-400/10 focus-visible:text-cyan-200"
          aria-label="Editar set"
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(set.id)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-slate-950/50 text-slate-200 shadow-lg shadow-black/20 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-200 focus-visible:border-rose-400/40 focus-visible:bg-rose-400/10 focus-visible:text-rose-200"
          aria-label="Eliminar set"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="relative flex h-full flex-col gap-5">
        <div className="space-y-4 pr-14">
          <div className="flex min-w-0 items-start gap-4">
            <img
              src={djImagemSrc}
              alt={dj?.nome ?? 'DJ'}
              onError={handleImageError}
              className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-1 ring-white/10 shadow-lg shadow-black/30"
            />

            <div className="min-w-0 space-y-1 pt-1">
              <h2 className="truncate text-lg font-bold tracking-wide text-white">
                {dj?.nome ?? 'DJ desconhecido'}
              </h2>
              <p className="truncate text-base font-semibold text-white/90">
                {set.nome ?? 'Set sem nome'}
              </p>
              <p className="truncate text-sm font-medium text-purple-300/80">
                {festival?.nome ?? 'Festival desconhecido'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
              <div className="text-right leading-none">
                <div className="text-3xl font-black leading-none text-cyan-400 dark:text-purple-400">
                  {dateTicket.day}
                </div>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] uppercase tracking-widest text-slate-400">
                  {dateTicket.monthYear.split(' ').slice(0, -1).join(' ') || dateTicket.monthYear}
                </span>
                <span className="text-[11px] uppercase tracking-widest text-slate-400">
                  {dateTicket.monthYear.split(' ').slice(-1).join(' ')}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-slate-200">
                <Clock size={13} className="text-cyan-300" />
                <span className="font-semibold">{startTime}</span>
                <span className="text-slate-500">→</span>
                <span className="font-semibold">{resolvedEndTime}</span>
              </div>
              <span className="h-1 w-1 rounded-full bg-white/30" />
              <div className="text-slate-200">
                <span className="text-slate-400">Duração:</span>{' '}
                <span className="font-semibold text-cyan-300">{durationLabel}</span>
              </div>
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

        {set.avaliacao !== undefined && set.avaliacao !== null && (
          <div className="grid gap-3 rounded-2xl border border-white/5 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/10 text-fuchsia-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-sm">
                  <Star size={15} className="text-fuchsia-300" fill="currentColor" />
                </span>
                <span>Avaliação</span>
              </div>
              <div className="flex items-end gap-1 font-mono text-2xl font-black leading-none text-white">
                <span>{formatScore(set.avaliacao)}</span>
                <span className="ml-1 text-sm font-semibold text-slate-500">/10</span>
              </div>
            </div>
            <div className="flex items-center gap-3 pb-1">
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const filled = scoreValue >= index * 2 + 2

                  return (
                    <span
                      key={`score-block-${index}`}
                      className={`h-2.5 w-2.5 rounded-sm transition-all duration-300 ${filled ? 'bg-gradient-to-t from-purple-400 to-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.35)]' : 'bg-white/10'}`}
                    />
                  )
                })}
              </div>
            </div>
            <div className="-mx-4 -mb-4 mt-1 overflow-hidden rounded-b-2xl border-t border-white/5 bg-slate-900/50">
              <div className="h-2.5 overflow-hidden bg-slate-800/80 ring-1 ring-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_18px_rgba(217,70,239,0.48)] transition-all duration-500 ease-out group-hover:brightness-110"
                  style={{ width: `${scorePercent}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}