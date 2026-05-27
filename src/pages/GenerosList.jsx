import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, PlusCircle, Search, Trash2 } from 'lucide-react'

export default function GenerosList({ generos = [], handleDeleteGenero }) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredGeneros = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase()

    if (normalizedTerm === '') {
      return generos
    }

    return (generos ?? []).filter((genero) => String(genero?.nome ?? '').toLowerCase().includes(normalizedTerm))
  }, [generos, searchTerm])

  return (
    <div className="w-full p-8 md:p-12 flex flex-col gap-8 bg-transparent relative z-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full w-fit">
            Catálogo
          </span>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-2">Géneros</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Géneros disponíveis para associação aos DJs.
          </p>
        </div>

        <button
          type="button"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5 text-sm flex items-center gap-2"
          onClick={() => navigate('/generos/adicionar')}
        >
          <PlusCircle size={16} />
          Adicionar Género
        </button>
      </div>

      <div className="bg-white/40 dark:bg-slate-950/30 backdrop-blur-md border border-slate-200/50 dark:border-white/5 p-6 rounded-2xl shadow-xl">
        <label
          htmlFor="genero-search"
          className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 block"
        >
          Pesquisar géneros
        </label>
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            id="genero-search"
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nome do género"
            className="w-full rounded-xl border border-slate-200 bg-white/80 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
          />
        </div>
      </div>

      {filteredGeneros.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGeneros.map((genero) => (
            <article
              key={genero.id}
              className="group relative bg-white/60 border border-slate-200/60 text-slate-900 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] backdrop-blur-md dark:bg-slate-900/40 dark:border-white/10 dark:text-slate-100"
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_34%)] opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => navigate(`/generos/adicionar?edit=${genero.id}`)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-400/30 hover:bg-purple-400/10 hover:text-purple-700 focus-visible:border-purple-400/40 focus-visible:bg-purple-400/10 focus-visible:text-purple-700 dark:border-white/10 dark:bg-slate-950/55 dark:text-slate-200 dark:shadow-black/20 dark:hover:text-purple-200 dark:focus-visible:text-purple-200"
                  aria-label="Editar género"
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteGenero && handleDeleteGenero(genero.id)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-400/30 hover:bg-rose-400/10 hover:text-rose-700 focus-visible:border-rose-400/40 focus-visible:bg-rose-400/10 focus-visible:text-rose-700 dark:border-white/10 dark:bg-slate-950/55 dark:text-slate-200 dark:shadow-black/20 dark:hover:text-rose-200 dark:focus-visible:text-rose-200"
                  aria-label="Eliminar género"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="relative flex h-full min-h-[92px] flex-col justify-center pr-16">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-500/80 dark:text-purple-300/80">
                    Género
                  </p>
                  <h2 className="mt-2 mb-0 text-xl font-black text-slate-900 dark:text-white">{genero.nome}</h2>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="w-full p-12 text-center bg-white/10 dark:bg-slate-950/10 backdrop-blur-sm rounded-2xl border border-dashed border-slate-300/60 dark:border-slate-700/40">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhum género corresponde à pesquisa atual.
          </p>
        </div>
      )}
    </div>
  )
}
