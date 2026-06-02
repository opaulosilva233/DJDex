import { Clock, Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const fallbackImageDataUrl =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="80" fill="%23e2e8f0"/><circle cx="80" cy="64" r="28" fill="%2394a3b8"/><path d="M28 136c11-21 31-32 52-32s41 11 52 32" fill="%2394a3b8"/></svg>'

function getDateTicketParts(value) {
  if (!value) {
    return { day: '--', month: '---', year: '----' }
  }

  const parts = String(value).split('-')
  if (parts.length !== 3) {
    return { day: '--', month: '---', year: '----' }
  }

  const [year, month, day] = parts
  const date = new Date(Number(year), Number(month) - 1, Number(day))

  if (Number.isNaN(date.getTime())) {
    return { day: '--', month: '---', year: '----' }
  }

  const monthLabel = new Intl.DateTimeFormat('pt-PT', { month: 'short' })
    .format(date)
    .replace('.', '')
    .toUpperCase()

  return {
    day,
    month: monthLabel,
    year,
  }
}

function formatScore(value) {
  const score = Number(value)
  if (Number.isNaN(score)) return '0.0'
  return Number.isInteger(score) ? String(score) : score.toFixed(1)
}

export default function DjCard({ set, djs = [], festivais = [], onDelete }) {
  const navigate = useNavigate()
  const dj = djs.find((entry) => entry.id === set.djId)
  const festival = festivais.find((entry) => entry.id === set.festivalId)
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
    <article className="group relative justify-self-center w-full max-w-[420px] overflow-hidden rounded-[1.6rem] border border-slate-200/60 bg-white/60 p-5 text-slate-900 shadow-[0_18px_55px_rgba(15,23,42,0.12)] backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-2 hover:border-cyan-400/40 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.14),0_26px_80px_rgba(168,85,247,0.18)] focus-within:border-cyan-400/40 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-100 dark:shadow-[0_18px_55px_rgba(2,6,23,0.42)] dark:hover:shadow-[0_0_0_1px_rgba(34,211,238,0.14),0_26px_80px_rgba(168,85,247,0.28)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.08),transparent_36%),linear-gradient(145deg,rgba(255,255,255,0.05),transparent_35%,rgba(168,85,247,0.04))] opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -left-16 top-6 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute -top-20 right-[-3.5rem] h-44 w-44 rounded-full bg-purple-500/15 blur-3xl opacity-60 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-x-8 bottom-0 h-16 rounded-full bg-fuchsia-500/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          type="button"
          onClick={() => navigate(`/sets/editar/${set.id}`)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-700 focus-visible:border-cyan-400/40 focus-visible:bg-cyan-400/10 focus-visible:text-cyan-700 dark:border-white/10 dark:bg-slate-950/55 dark:text-slate-200 dark:shadow-black/20 dark:hover:text-cyan-200 dark:focus-visible:text-cyan-200"
          aria-label="Editar set"
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(set.id)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-700 focus-visible:border-rose-400/40 focus-visible:bg-rose-400/10 focus-visible:text-rose-700 dark:border-white/10 dark:bg-slate-950/55 dark:text-slate-200 dark:shadow-black/20 dark:hover:text-rose-200 dark:focus-visible:text-rose-200"
          aria-label="Eliminar set"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="relative flex h-full flex-col gap-5 pr-4 pt-1 md:pr-2">
        <div className="flex min-w-0 items-start gap-4">
          <img
            src={djImagemSrc}
            alt={dj?.nome ?? 'DJ'}
            onError={handleImageError}
            className="h-20 w-20 shrink-0 rounded-full border border-slate-200/80 object-cover shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_18px_40px_rgba(15,23,42,0.14)] dark:border-white/10 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_18px_40px_rgba(0,0,0,0.35)]"
          />

          <div className="min-w-0 pt-1">
            <h2 className="truncate text-xl font-black leading-none text-slate-900 dark:text-white">
              {dj?.nome ?? 'DJ desconhecido'}
            </h2>
            <p className="mt-2 truncate text-sm font-medium text-slate-600 dark:text-purple-300/80">
              {festival?.nome ?? 'Festival desconhecido'}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white/45 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
            <Clock size={14} className="text-cyan-600 dark:text-cyan-300" />
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold tracking-wide text-slate-900 dark:text-slate-100">
                {startTime}
              </span>
              <span className="text-slate-400 dark:text-slate-500">-</span>
              <span className="font-semibold tracking-wide text-slate-900 dark:text-slate-100">
                {resolvedEndTime}
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                Duração
              </div>
              <div className="mt-1 text-lg font-black text-cyan-700 dark:text-cyan-300">
                {durationLabel}
              </div>
            </div>

            <div className="flex items-end gap-1.5 pb-1">
              <span className="h-4 w-1.5 animate-[pulse_1.1s_ease-in-out_infinite] rounded-full bg-gradient-to-t from-purple-500 via-fuchsia-400 to-cyan-300" />
              <span className="h-6 w-1.5 animate-[pulse_1.25s_ease-in-out_infinite] rounded-full bg-gradient-to-t from-cyan-500 via-cyan-300 to-purple-400 [animation-delay:120ms]" />
              <span className="h-3 w-1.5 animate-[pulse_0.95s_ease-in-out_infinite] rounded-full bg-gradient-to-t from-purple-400 via-violet-300 to-cyan-300 [animation-delay:240ms]" />
              <span className="h-5 w-1.5 animate-[pulse_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-t from-cyan-400 via-fuchsia-300 to-purple-500 [animation-delay:360ms]" />
            </div>
          </div>
        </div>

        <div className="mt-auto rounded-2xl border border-slate-200/60 bg-white/45 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-950/35 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="grid grid-cols-[1fr_auto] items-center gap-4">
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                Data
              </div>
              <div className="mt-2 flex items-start gap-3">
                <span className="text-3xl font-extrabold leading-none text-cyan-700 dark:text-cyan-400">
                  {dateTicket.day}
                </span>
                <span className="mt-0.5 flex flex-col leading-none">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-700 dark:text-slate-300">
                    {dateTicket.month}
                  </span>
                  <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">
                    {dateTicket.year}
                  </span>
                </span>
              </div>
            </div>

            {set.avaliacao !== undefined && set.avaliacao !== null && (
              <div className="text-right justify-self-end">
                <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
                  Avaliação
                </div>
                <div className="mt-2 text-sm font-black text-slate-900 dark:text-white">
                  {formatScore(set.avaliacao)}/10
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200/80 ring-1 ring-slate-200/60 dark:bg-slate-800/80 dark:ring-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-400 shadow-[0_0_18px_rgba(217,70,239,0.42)] transition-all duration-500 ease-out group-hover:brightness-110"
              style={{ width: `${scorePercent}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  )
}