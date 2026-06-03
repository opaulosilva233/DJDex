import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import GeneroCard from '../components/GeneroCard'


export default function GenerosList({ generos = [], handleDeleteGenero }) {
  const { isAuthenticated } = useAuth()
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

        {isAuthenticated && (
          <button
            type="button"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5 text-sm flex items-center gap-2"
            onClick={() => navigate('/generos/adicionar')}
          >
            <PlusCircle size={16} />
            Adicionar Género
          </button>
        )}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredGeneros.map((genero) => (
            <GeneroCard
              key={genero.id}
              genero={genero}
              onEdit={() => navigate(`/generos/adicionar?edit=${genero.id}`)}
              onDelete={() => handleDeleteGenero && handleDeleteGenero(genero.id)}
            />
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
