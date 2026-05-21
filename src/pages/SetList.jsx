import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Calendar, Users, Music4 } from 'lucide-react'
import DjCard from '../components/DjCard'

export default function SetList({ sets, djs = [], festivais = [], generos = [], onDeleteSet }) {
	const navigate = useNavigate()

	// Estados dos filtros simplificados
	const [djSearch, setDjSearch] = useState('')
	const [festivalSearch, setFestivalSearch] = useState('')
	const [selectedYear, setSelectedYear] = useState('')

	// Lógica de filtragem unificada
	const filteredSets = sets.filter((set) => {
		const dj = djs.find((entry) => entry.id === set.djId)
		const festival = festivais.find((entry) => entry.id === set.festivalId)

		// Filtro por DJ (compara o ID selecionado ou o texto digitado)
		const matchesDj = djSearch === '' ||
			(dj?.id === djSearch) ||
			(dj?.nome ?? '').toLowerCase().includes(djSearch.toLowerCase())

		// Filtro por Festival (compara o ID selecionado ou o texto digitado)
		const matchesFestival = festivalSearch === '' ||
			(festival?.id === festivalSearch) ||
			(festival?.nome ?? '').toLowerCase().includes(festivalSearch.toLowerCase())

		// Filtro por Ano
		const setYear = set.data ? set.data.split('-')[0] : (festival?.ano?.toString() ?? '')
		const matchesYear = selectedYear === '' || setYear === selectedYear

		return matchesDj && matchesFestival && matchesYear
	})

	// Extrair anos únicos para o filtro de data
	const anosDisponiveis = Array.from(new Set(sets.map(s => s.data ? s.data.split('-')[0] : '').filter(Boolean)))

	return (
		<div className="w-full p-8 md:p-12 flex flex-col gap-8 bg-transparent relative z-10">
			
			{/* Cabeçalho da Página */}
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

			{/* Barra de Filtros Inteligente (Glassmorphism) */}
			<div className="bg-white/40 dark:bg-slate-950/30 backdrop-blur-md border border-slate-200/50 dark:border-white/5 p-6 rounded-2xl shadow-xl flex flex-col gap-4">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					
					{/* Filtro de DJ */}
					<div className="flex flex-col">
						<label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1.5">
							<Users size={12} /> Pesquisar / Selecionar DJ
						</label>
						<select
							value={djSearch}
							onChange={(e) => setDjSearch(e.target.value)}
							className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm text-gray-900 dark:border-slate-800 dark:bg-slate-900/60 dark:text-gray-100 focus:outline-none focus:border-purple-500/50"
						>
							<option value="">Todos os DJs</option>
							{djs.map((dj) => (
								<option key={dj.id} value={dj.id}>{dj.nome}</option>
							))}
						</select>
					</div>

					{/* Filtro de Festival */}
					<div className="flex flex-col">
						<label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1.5">
							<Music4 size={12} /> Pesquisar / Selecionar Festival
						</label>
						<select
							value={festivalSearch}
							onChange={(e) => setFestivalSearch(e.target.value)}
							className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm text-gray-900 dark:border-slate-200 dark:border-slate-800 dark:bg-slate-900/60 dark:text-gray-100 focus:outline-none focus:border-purple-500/50"
						>
							<option value="">Todos os Festivais</option>
							{festivais.map((fest) => (
								<option key={fest.id} value={fest.id}>{fest.nome}</option>
							))}
						</select>
					</div>

					{/* Filtro de Ano */}
					<div className="flex flex-col">
						<label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1.5">
							<Calendar size={12} /> Filtrar por Ano
						</label>
						<select
							value={selectedYear}
							onChange={(e) => setSelectedYear(e.target.value)}
							className="w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5 text-sm text-gray-900 dark:border-slate-200 dark:border-slate-800 dark:bg-slate-900/60 dark:text-gray-100 focus:outline-none focus:border-purple-500/50"
						>
							<option value="">Todos os anos</option>
							{anosDisponiveis.map((year) => (
								<option key={year} value={year}>{year}</option>
							))}
						</select>
					</div>

				</div>
			</div>

			{/* Grelha de Cartões Organizada */}
			{filteredSets.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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