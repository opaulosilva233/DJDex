import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, PlusCircle, Search, Trash2 } from 'lucide-react'

const fallbackImageDataUrl =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="80" fill="%23e2e8f0"/><path d="M36 106l22-30 16 18 18-24 32 36H36Z" fill="%2394a3b8"/><circle cx="60" cy="58" r="10" fill="%2394a3b8"/></svg>'

export default function FestivaisList({ festivais = [], handleDeleteFestival }) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredFestivais = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase()

    return (festivais ?? []).filter((festival) => {
      if (normalizedTerm === '') return true

      const nome = String(festival?.nome ?? '').toLowerCase()
      const local = String(festival?.local ?? '').toLowerCase()
      const ano = String(festival?.ano ?? '').toLowerCase()

      return nome.includes(normalizedTerm) || local.includes(normalizedTerm) || ano.includes(normalizedTerm)
    })
  }, [festivais, searchTerm])

  function handleImageError(event) {
    if (event.currentTarget.dataset.fallbackApplied !== 'true') {
      event.currentTarget.dataset.fallbackApplied = 'true'
      event.currentTarget.src = fallbackImageDataUrl
    }
  }

  return (
    <div className="w-full p-8 md:p-12 flex flex-col gap-8 bg-transparent relative z-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full w-fit">
            Catálogo
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-2">
            Festivais
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Festivais registados na aplicação.
          </p>
        </div>

        <button
          type="button"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5 text-sm flex items-center gap-2"
          onClick={() => navigate('/festivais/adicionar')}
        >
          <PlusCircle size={16} />
          Adicionar Festival
        </button>
      </div>

      <div className="bg-white/40 dark:bg-slate-950/30 backdrop-blur-md border border-slate-200/50 dark:border-white/5 p-6 rounded-2xl shadow-xl">
        <label
          htmlFor="festival-search"
          className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 block"
        >
          Pesquisar Festivais
        </label>
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            id="festival-search"
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nome, localização ou ano"
            className="w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
          />
        </div>
      </div>

      {filteredFestivais.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFestivais.map((festival) => (
            <article
              key={festival.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/60 p-6 text-slate-900 shadow-[0_18px_55px_rgba(15,23,42,0.12)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-100"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_34%),linear-gradient(145deg,rgba(255,255,255,0.08),transparent_30%,rgba(99,102,241,0.05))] opacity-80 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="pointer-events-none absolute -left-16 top-4 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="pointer-events-none absolute -bottom-14 right-[-3rem] h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="absolute right-4 top-4 z-20 flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
                <button
                  type="button"
                  onClick={() => navigate(`/festivais/adicionar?edit=${festival.id}`)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-400/30 hover:bg-purple-400/10 hover:text-purple-700 focus-visible:border-purple-400/40 focus-visible:bg-purple-400/10 focus-visible:text-purple-700 dark:border-white/10 dark:bg-slate-950/55 dark:text-slate-200 dark:shadow-black/20 dark:hover:text-purple-200 dark:focus-visible:text-purple-200"
                  aria-label="Editar Festival"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteFestival && handleDeleteFestival(festival.id)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-700 focus-visible:border-rose-400/40 focus-visible:bg-rose-400/10 focus-visible:text-rose-700 dark:border-white/10 dark:bg-slate-950/55 dark:text-slate-200 dark:shadow-black/20 dark:hover:text-rose-200 dark:focus-visible:text-rose-200"
                  aria-label="Eliminar Festival"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="relative flex h-full flex-col gap-5 pr-16">
                <div className="flex min-w-0 items-start gap-4">
                  <img
                    src={festival.imagem || '/images/default-festival.png'}
                    alt={festival.nome}
                    onError={handleImageError}
                    className="h-20 w-20 shrink-0 rounded-full border border-slate-200/80 object-cover shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_18px_40px_rgba(15,23,42,0.14)] dark:border-white/10 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_18px_40px_rgba(0,0,0,0.35)]"
                  />

                  <div className="min-w-0 pt-1">
                    <h2 className="truncate text-xl font-black leading-none text-slate-900 dark:text-white">
                      {festival.nome}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {festival.local || 'Local por definir'}
                    </p>
                  </div>
                </div>

                <div className="mt-auto flex flex-wrap gap-2">
                  <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-200">
                    {festival.ano || 'Ano por definir'}
                  </span>
                  {festival.local ? (
                    <span className="rounded-full border border-slate-300/40 bg-slate-500/10 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {festival.local}
                    </span>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="w-full p-12 text-center bg-white/10 dark:bg-slate-950/10 backdrop-blur-sm rounded-2xl border border-dashed border-slate-300/60 dark:border-slate-700/40">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {festivais.length === 0
              ? 'Ainda não existem festivais.'
              : 'Nenhum festival corresponde à pesquisa atual.'}
          </p>
        </div>
      )}
    </div>
  )
}
