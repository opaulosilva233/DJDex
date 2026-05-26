import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'
import DjCard from '../components/DjCard'

export default function SetList({ sets, djs = [], festivais = [], generos = [], onDeleteSet }) {
	const navigate = useNavigate()

	const [djSearch, setDjSearch] = useState('')
	const [festivalSearch, setFestivalSearch] = useState('')
	const [selectedYear, setSelectedYear] = useState('')
	const filteredSets = useMemo(() => {
		const djTerm = djSearch.trim().toLowerCase()
		const festivalTerm = festivalSearch.trim().toLowerCase()
		const yearTerm = selectedYear.trim()

		return (sets ?? []).filter((set) => {
			const dj = djs.find((entry) => entry.id === set.djId)
			const festival = festivais.find((entry) => entry.id === set.festivalId)
			const setYear = String(set.data ?? '').slice(0, 4)

			const matchesDj = djTerm === '' || (dj?.nome ?? '').toLowerCase().includes(djTerm)
			const matchesFestival = festivalTerm === '' || (festival?.nome ?? '').toLowerCase().includes(festivalTerm)
			const matchesYear = yearTerm === '' || setYear === yearTerm

			return matchesDj && matchesFestival && matchesYear
		})
	}, [djs, festivais, festivalSearch, selectedYear, sets, djSearch])
	const anosDisponiveis = useMemo(() => {
		return Array.from(
			new Set(
				(sets ?? [])
					.map((set) => {
						return String(set.data ?? '').slice(0, 4)
					})
					.filter(Boolean),
			),
		).sort((anoA, anoB) => Number(anoB) - Number(anoA))
	}, [sets])

	return (
		<div className="w-full p-8 md:p-12 flex flex-col gap-8 bg-transparent relative z-10">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<span className="text-xs font-bold uppercase tracking-widest text-purple-500 bg-purple-500/10 px-3 py-1 rounded-full w-fit">
						Biblioteca
					</span>
					<h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-2">
						Sets Gravados
					</h1>
					<p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
						Todos os sets atualmente carregados na aplicação.
					</p>
				</div>
				<div>
					<button
						type="button"
						className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5 text-sm flex items-center gap-2"
						onClick={() => navigate('/adicionar')}
					>
						<PlusCircle size={16} />
						Adicionar Set
					</button>
				</div>
			</div>

			<div className="bg-white/40 dark:bg-slate-950/30 backdrop-blur-md border border-slate-200/50 dark:border-white/5 p-6 rounded-2xl flex flex-col gap-4 shadow-xl">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="flex flex-col gap-2">
						<label htmlFor="dj-filter" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
							DJ
						</label>
						<input
							id="dj-filter"
							type="text"
							placeholder="Todos os DJs"
							value={djSearch}
							onChange={(event) => setDjSearch(event.target.value)}
							className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-gray-100 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
						/>
					</div>

					<div className="flex flex-col gap-2">
						<label htmlFor="festival-filter" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
							Festival
						</label>
						<input
							id="festival-filter"
							type="text"
							placeholder="Todos os festivais"
							value={festivalSearch}
							onChange={(event) => setFestivalSearch(event.target.value)}
							className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-gray-100 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
						/>
					</div>

					<div className="flex flex-col gap-2">
						<label htmlFor="ano-filter" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
							Ano
						</label>
						<input
							id="ano-filter"
							type="text"
							list="anos-lista"
							placeholder="Todos os anos"
							value={selectedYear}
							onChange={(event) => setSelectedYear(event.target.value)}
							className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-gray-100 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
						/>
						<datalist id="anos-lista">
							{anosDisponiveis.map((year) => (
								<option key={year} value={year} />
							))}
						</datalist>
					</div>
				</div>
			</div>

			{filteredSets.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center">
					{filteredSets.map((set) => (
						<DjCard key={set.id} set={set} djs={djs} festivais={festivais} generos={generos} onDelete={onDeleteSet} />
					))}
				</div>
			) : (
				<div className="w-full p-12 text-center bg-white/10 dark:bg-slate-950/10 backdrop-blur-sm rounded-2xl border border-dashed border-slate-700/40">
					<p className="text-sm text-slate-400">Nenhum set corresponde aos filtros selecionados.</p>
				</div>
			)}
		</div>
	)
}