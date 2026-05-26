import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Users, Music4 } from 'lucide-react'
import DjCard from '../components/DjCard'

export default function SetList({ sets, djs = [], festivais = [], generos = [], onDeleteSet }) {
	const navigate = useNavigate()

	// Estados dos filtros simplificados
	const [djSearch, setDjSearch] = useState('')
	const [festivalSearch, setFestivalSearch] = useState('')
	const [selectedYear, setSelectedYear] = useState('')
	const [isDjOpen, setIsDjOpen] = useState(false)
	const [isFestivalOpen, setIsFestivalOpen] = useState(false)
	const [activeDjIndex, setActiveDjIndex] = useState(-1)
	const [activeFestivalIndex, setActiveFestivalIndex] = useState(-1)

	const djAutocompleteRef = useRef(null)
	const festivalAutocompleteRef = useRef(null)

	const getFestivalYear = (festival) => {
		if (!festival) return ''

		const explicitYear = String(festival.ano ?? '').trim()
		if (explicitYear !== '') return explicitYear.slice(0, 4)

		const fullDate = String(festival.data ?? festival.date ?? '').trim()
		return fullDate.length >= 4 ? fullDate.slice(0, 4) : ''
	}

	// Lógica de filtragem unificada
	const filteredSets = sets.filter((set) => {
		const dj = djs.find((entry) => entry.id === set.djId)
		const festival = festivais.find((entry) => entry.id === set.festivalId)

		const matchesDj = djSearch === '' || (dj?.nome ?? '').toLowerCase().includes(djSearch.toLowerCase())

		const matchesFestival = festivalSearch === '' || (festival?.nome ?? '').toLowerCase().includes(festivalSearch.toLowerCase())

		const normalizedSelectedYear = selectedYear.trim()
		const festivalYear = getFestivalYear(festival)
		const matchesDate = normalizedSelectedYear === '' || festivalYear.includes(normalizedSelectedYear)

		return matchesDj && matchesFestival && matchesDate
	})
	const nomesDjs = Array.from(new Set(djs.map((dj) => dj.nome).filter(Boolean)))
	const nomesFestivais = Array.from(new Set(festivais.map((festival) => festival.nome).filter(Boolean)))
	const anosDisponiveis = useMemo(() => {
		return Array.from(
			new Set(
				sets
					.map((set) => {
						const festival = festivais.find((entry) => entry.id === set.festivalId)
						return getFestivalYear(festival)
					})
					.filter((year) => year !== '' && /^\d{4}$/.test(year)),
			),
		).sort((anoA, anoB) => Number(anoB) - Number(anoA))
	}, [festivais, sets])

	const djOptions = useMemo(() => {
		const term = djSearch.trim().toLowerCase()
		if (term === '') return nomesDjs.slice(0, 8)
		return nomesDjs.filter((nome) => nome.toLowerCase().includes(term)).slice(0, 8)
	}, [nomesDjs, djSearch])

	const festivalOptions = useMemo(() => {
		const term = festivalSearch.trim().toLowerCase()
		if (term === '') return nomesFestivais.slice(0, 8)
		return nomesFestivais.filter((nome) => nome.toLowerCase().includes(term)).slice(0, 8)
	}, [nomesFestivais, festivalSearch])

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (djAutocompleteRef.current && !djAutocompleteRef.current.contains(event.target)) {
				setIsDjOpen(false)
				setActiveDjIndex(-1)
			}

			if (festivalAutocompleteRef.current && !festivalAutocompleteRef.current.contains(event.target)) {
				setIsFestivalOpen(false)
				setActiveFestivalIndex(-1)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const handleDjKeyDown = (event) => {
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			if (!isDjOpen) {
				setIsDjOpen(true)
				setActiveDjIndex(0)
				return
			}

			setActiveDjIndex((prev) => {
				if (djOptions.length === 0) return -1
				return prev < djOptions.length - 1 ? prev + 1 : 0
			})
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault()
			if (!isDjOpen) {
				setIsDjOpen(true)
				setActiveDjIndex(djOptions.length > 0 ? djOptions.length - 1 : -1)
				return
			}

			setActiveDjIndex((prev) => {
				if (djOptions.length === 0) return -1
				return prev > 0 ? prev - 1 : djOptions.length - 1
			})
		}

		if (event.key === 'Enter' && isDjOpen && activeDjIndex >= 0 && djOptions[activeDjIndex]) {
			event.preventDefault()
			setDjSearch(djOptions[activeDjIndex])
			setIsDjOpen(false)
			setActiveDjIndex(-1)
		}

		if (event.key === 'Escape') {
			setIsDjOpen(false)
			setActiveDjIndex(-1)
		}
	}

	const handleFestivalKeyDown = (event) => {
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			if (!isFestivalOpen) {
				setIsFestivalOpen(true)
				setActiveFestivalIndex(0)
				return
			}

			setActiveFestivalIndex((prev) => {
				if (festivalOptions.length === 0) return -1
				return prev < festivalOptions.length - 1 ? prev + 1 : 0
			})
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault()
			if (!isFestivalOpen) {
				setIsFestivalOpen(true)
				setActiveFestivalIndex(festivalOptions.length > 0 ? festivalOptions.length - 1 : -1)
				return
			}

			setActiveFestivalIndex((prev) => {
				if (festivalOptions.length === 0) return -1
				return prev > 0 ? prev - 1 : festivalOptions.length - 1
			})
		}

		if (event.key === 'Enter' && isFestivalOpen && activeFestivalIndex >= 0 && festivalOptions[activeFestivalIndex]) {
			event.preventDefault()
			setFestivalSearch(festivalOptions[activeFestivalIndex])
			setIsFestivalOpen(false)
			setActiveFestivalIndex(-1)
		}

		if (event.key === 'Escape') {
			setIsFestivalOpen(false)
			setActiveFestivalIndex(-1)
		}
	}

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
					<div className="flex flex-col" ref={djAutocompleteRef}>
						<label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1.5">
							<Users size={12} /> Pesquisar / Selecionar DJ
						</label>
						<div className="relative">
							<input
								type="text"
								placeholder="Digita o nome do DJ..."
								value={djSearch}
								onChange={(e) => {
									setDjSearch(e.target.value)
									setIsDjOpen(true)
									setActiveDjIndex(-1)
								}}
								onFocus={() => setIsDjOpen(true)}
								onKeyDown={handleDjKeyDown}
								className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-gray-100 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
							/>
							{isDjOpen && djOptions.length > 0 && (
								<ul className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-xl border border-slate-200 bg-white/95 py-1 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
									{djOptions.map((nome, index) => (
										<li key={nome}>
											<button
												type="button"
												onMouseDown={(event) => {
													event.preventDefault()
													setDjSearch(nome)
													setIsDjOpen(false)
													setActiveDjIndex(-1)
												}}
												className={`w-full px-3 py-2 text-left text-sm transition-colors ${activeDjIndex === index ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-100' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/80'}`}
											>
												{nome}
											</button>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>

					{/* Filtro de Festival */}
					<div className="flex flex-col" ref={festivalAutocompleteRef}>
						<label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1.5">
							<Music4 size={12} /> Pesquisar / Selecionar Festival
						</label>
						<div className="relative">
							<input
								type="text"
								placeholder="Digita o nome do festival..."
								value={festivalSearch}
								onChange={(e) => {
									setFestivalSearch(e.target.value)
									setIsFestivalOpen(true)
									setActiveFestivalIndex(-1)
								}}
								onFocus={() => setIsFestivalOpen(true)}
								onKeyDown={handleFestivalKeyDown}
								className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-gray-100 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
							/>
							{isFestivalOpen && festivalOptions.length > 0 && (
								<ul className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-xl border border-slate-200 bg-white/95 py-1 shadow-lg backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
									{festivalOptions.map((nome, index) => (
										<li key={nome}>
											<button
												type="button"
												onMouseDown={(event) => {
													event.preventDefault()
													setFestivalSearch(nome)
													setIsFestivalOpen(false)
													setActiveFestivalIndex(-1)
												}}
												className={`w-full px-3 py-2 text-left text-sm transition-colors ${activeFestivalIndex === index ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-100' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/80'}`}
											>
												{nome}
											</button>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>

					{/* Filtro de Data */}
					<div className="flex flex-col">
						<label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1.5">
							Filtrar por Ano
						</label>
						<input
							type="text"
							list="anos-lista"
							placeholder="Todos os anos"
							value={selectedYear}
							onChange={(e) => setSelectedYear(e.target.value)}
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