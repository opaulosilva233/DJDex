import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	Cell,
	CartesianGrid,
	Legend,
	Pie,
	PieChart,
	PolarAngleAxis,
	PolarGrid,
	PolarRadiusAxis,
	Radar,
	RadarChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts'
import { User, Calendar, MapPin, BarChart2, TrendingUp, Info, Search, X, LayoutDashboard, Music, Sliders, Headphones, Ticket, Users, Flame } from 'lucide-react'

const pieColors = ['#a855f7', '#06b6d4', '#ec4899', '#10b981', '#f43f5e', '#14b8a6', '#6366f1']

export default function EstatisticasPage({ sets = [], djs = [], festivais = [], generos = [], darkMode = true }) {
	const [activeTab, setActiveTab] = useState('geral')
	const [selectedDjId, setSelectedDjId] = useState('')
	const [djSearchTerm, setDjSearchTerm] = useState('')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [modalDjData, setModalDjData] = useState(null)
	const [showAllDjs, setShowAllDjs] = useState(false)

	// Configurar DJ selecionado padrão caso não esteja definido
	useEffect(() => {
		if (djs.length > 0 && (!selectedDjId || !djs.some(dj => dj.id === selectedDjId))) {
			setSelectedDjId(djs[0].id)
		}
	}, [djs, selectedDjId])

	// Calculations for the "Geral" dashboard
	const kpis = useMemo(() => {
		const totalSets = sets.length

		const uniqueFestivals = new Set(sets.map((s) => s.festivalId).filter(Boolean)).size

		const uniqueDjs = new Set(sets.map((s) => s.djId).filter(Boolean)).size

		// Compute most popular genre based on sets seen
		const genreCounts = {}
		sets.forEach((set) => {
			const dj = djs.find((d) => d.id === set.djId)
			if (dj && Array.isArray(dj.generoIds)) {
				dj.generoIds.forEach((gid) => {
					genreCounts[gid] = (genreCounts[gid] || 0) + 1
				})
			}
		})

		let topGenreName = 'Nenhum'
		let maxCount = 0
		Object.entries(genreCounts).forEach(([gid, count]) => {
			if (count > maxCount) {
				maxCount = count
				const genre = generos.find((g) => g.id === gid)
				if (genre) {
					topGenreName = genre.nome
				}
			}
		})

		return {
			totalSets,
			uniqueFestivals,
			uniqueDjs,
			topGenreName,
		}
	}, [sets, djs, generos])

	// List of DJs sorted by number of sets
	const topDjsList = useMemo(() => {
		const counts = {}
		sets.forEach((s) => {
			if (s.djId) {
				counts[s.djId] = (counts[s.djId] || 0) + 1
			}
		})

		return djs
			.map((dj) => ({
				...dj,
				count: counts[dj.id] || 0,
			}))
			.filter((dj) => dj.count > 0)
			.sort((a, b) => b.count - a.count || a.nome.localeCompare(b.nome, 'pt'))
	}, [sets, djs])

	const displayedTopDjs = showAllDjs ? topDjsList : topDjsList.slice(0, 10)

	// Sets list for the DJ shown in the modal
	const modalSets = useMemo(() => {
		if (!modalDjData) return []
		return sets
			.filter((s) => s.djId === modalDjData.id)
			.map((s) => {
				const festival = festivais.find((f) => f.id === s.festivalId)
				return {
					id: s.id,
					festivalNome: festival ? festival.nome : 'Set Individual',
					data: s.data || 'Sem data',
					hora: s.hora || s.horaInicio || '',
					avaliacao: s.avaliacao !== null && s.avaliacao !== undefined && s.avaliacao !== '' 
						? Number(s.avaliacao) 
						: null,
				}
			})
			.sort((a, b) => {
				const dateA = new Date(`${a.data}T${a.hora || '00:00'}`)
				const dateB = new Date(`${b.data}T${b.hora || '00:00'}`)
				return dateB - dateA // Newest first
			})
	}, [sets, modalDjData, festivais])

	// Estatísticas agregadas do modal
	const modalStats = useMemo(() => {
		if (!modalDjData || modalSets.length === 0) return { count: 0, avg: '—' }
		const count = modalSets.length
		const ratedSets = modalSets.filter((s) => s.avaliacao !== null)
		const avg = ratedSets.length > 0
			? (ratedSets.reduce((acc, s) => acc + s.avaliacao, 0) / ratedSets.length).toFixed(1)
			: '—'
		return { count, avg }
	}, [modalSets, modalDjData])

	const getRatingBadge = (rating) => {
		if (rating === null || rating === undefined) {
			return <span className="text-slate-500 font-medium">—</span>
		}

		let colorClasses = "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
		if (rating >= 9.0) {
			colorClasses = "bg-amber-400/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
		} else if (rating >= 7.5) {
			colorClasses = "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20"
		} else if (rating >= 5.0) {
			colorClasses = "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20"
		}

		return (
			<span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colorClasses}`}>
				{rating.toFixed(1)}/10
			</span>
		)
	}

	// Festival frequency data for the bar chart
	const festivalFreqData = useMemo(() => {
		const counts = {}
		sets.forEach((s) => {
			if (s.festivalId) {
				counts[s.festivalId] = (counts[s.festivalId] || 0) + 1
			}
		})

		return festivais
			.map((f) => ({
				name: f.nome,
				quantidade: counts[f.id] || 0,
			}))
			.filter((item) => item.quantidade > 0)
			.sort((a, b) => b.quantidade - a.quantidade || a.name.localeCompare(b.name, 'pt'))
			.slice(0, 10)
	}, [sets, festivais])

	// 1. Distribuição de Avaliações do DJ Selecionado (de 1 a 10)
	const djRatingDistribution = useMemo(() => {
		const distribution = Array.from({ length: 10 }, (_, index) => ({
			nota: `${index + 1}`,
			quantidade: 0,
		}))

		if (!selectedDjId) return distribution

		sets.forEach((set) => {
			if (set.djId === selectedDjId && set.avaliacao !== null && set.avaliacao !== undefined && set.avaliacao !== '') {
				const rounded = Math.round(Number(set.avaliacao))
				if (rounded >= 1 && rounded <= 10) {
					distribution[rounded - 1].quantidade++
				}
			}
		})

		return distribution
	}, [sets, selectedDjId])

	// 2. Sets por Festival
	const setsPorFestival = useMemo(() => {
		const contagemFestivais = sets.reduce((accumulator, set) => {
			const festival = festivais.find((entry) => entry.id === set.festivalId)

			if (!festival) {
				return accumulator
			}

			const currentCount = accumulator.get(festival.id) ?? { name: festival.nome, quantidade: 0 }
			accumulator.set(festival.id, {
				name: festival.nome,
				quantidade: currentCount.quantidade + 1,
			})

			return accumulator
		}, new Map())

		return Array.from(contagemFestivais.values()).sort((left, right) => {
			if (right.quantidade !== left.quantidade) {
				return right.quantidade - left.quantidade
			}

			return left.name.localeCompare(right.name, 'pt')
		})
	}, [sets, festivais])

	// 3. BPM por Género
	const bpmPorGenero = useMemo(() => {
		return generos.map((g) => ({
			name: g.nome,
			bpm: Number(g.bpm) || 120,
		})).sort((a, b) => b.bpm - a.bpm)
	}, [generos])

	// 4. Perfil de Intensidade / Energia (Radar Data)
	const radarData = useMemo(() => {
		const data = [
			{ subject: 'Intensidade' },
			{ subject: 'BPM Médio' },
			{ subject: 'Sets Registados' },
		]

		djs.forEach((dj) => {
			const djGenres = generos.filter((g) => dj.generoIds?.includes(g.id))
			const avgIntensidade = djGenres.length > 0
				? djGenres.reduce((acc, g) => acc + (Number(g.intensidade) || 5), 0) / djGenres.length
				: 5
			data[0][dj.id] = Number(avgIntensidade.toFixed(1))

			const avgBpm = djGenres.length > 0
				? djGenres.reduce((acc, g) => acc + (Number(g.bpm) || 120), 0) / djGenres.length
				: 120
			const normalizedBpm = Math.min(10, Math.max(0, ((avgBpm - 60) / 140) * 10))
			data[1][dj.id] = Number(normalizedBpm.toFixed(1))

			const djSets = sets.filter((s) => s.djId === dj.id)
			const setsRating = Math.min(10, djSets.length * 2)
			data[2][dj.id] = Number(setsRating.toFixed(1))
		})

		return data
	}, [sets, djs, generos])

	// Obter DJ selecionado
	const selectedDj = useMemo(() => {
		return djs.find((dj) => dj.id === selectedDjId)
	}, [djs, selectedDjId])

	const selectedDjColor = useMemo(() => {
		const idx = djs.findIndex((dj) => dj.id === selectedDjId)
		return idx !== -1 ? pieColors[idx % pieColors.length] : '#a855f7'
	}, [djs, selectedDjId])

	// Histórico e Rastreio do DJ selecionado
	const djHistoryData = useMemo(() => {
		if (!selectedDjId) return []

		return sets
			.filter((s) => s.djId === selectedDjId)
			.map((s) => {
				const festival = festivais.find((f) => f.id === s.festivalId)
				return {
					id: s.id,
					data: s.data || 'Sem data',
					hora: s.hora || s.horaInicio || '',
					festivalNome: festival ? festival.nome : 'Set Individual',
					local: festival ? festival.local : 'Desconhecido',
					avaliacao: s.avaliacao !== null && s.avaliacao !== undefined && s.avaliacao !== '' 
						? Number(s.avaliacao) 
						: null,
				}
			})
			.sort((a, b) => {
				const dateTimeA = new Date(`${a.data}T${a.hora || '00:00'}`)
				const dateTimeB = new Date(`${b.data}T${b.hora || '00:00'}`)
				return dateTimeA - dateTimeB
			})
	}, [sets, selectedDjId, festivais])

	// Filtrar os sets que têm avaliações para o gráfico histórico do DJ
	const djChartData = useMemo(() => {
		return djHistoryData
			.filter((item) => item.avaliacao !== null)
			.map((item) => ({
				...item,
				// Formatado para exibir no eixo X de forma curta
				exibicao: `${item.data.split('-').reverse().slice(0, 2).join('/')} - ${item.festivalNome.substring(0, 10)}...`,
			}))
	}, [djHistoryData])

	// DJs filtrados pela pesquisa
	const filteredDjs = useMemo(() => {
		if (!djSearchTerm.trim()) return djs
		const term = djSearchTerm.toLowerCase()
		return djs.filter((dj) => {
			const djGenres = generos
				.filter((g) => dj.generoIds?.includes(g.id))
				.map((g) => g.nome)
				.join(' ')
			return (
				dj.nome.toLowerCase().includes(term) ||
				(dj.biografia && dj.biografia.toLowerCase().includes(term)) ||
				djGenres.toLowerCase().includes(term)
			)
		})
	}, [djs, djSearchTerm, generos])

	// Abas configuradas
	const tabs = [
		{ id: 'geral', label: 'Geral', icon: LayoutDashboard },
		{ id: 'djs', label: 'DJs', icon: Music },
		{ id: 'festivais', label: 'Festivais', icon: Calendar },
		{ id: 'locais', label: 'Locais', icon: MapPin },
		{ id: 'generos', label: 'Géneros', icon: Sliders },
	]

	return (
		<div className="w-full p-8 md:p-12 flex flex-col gap-8 bg-transparent relative z-10">
			{/* Cabeçalho */}
			<div className="flex flex-col gap-1">
				<span className="text-xs font-bold tracking-widest text-purple-500 uppercase">ANÁLISE</span>
				<h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Estatísticas</h1>
				<p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl">
					Explora as métricas da tua coleção, analisa a distribuição de notas e monitoriza o histórico de atuações dos teus DJs favoritos.
				</p>
			</div>

			{/* Barra de Navegação Interna Horizontal */}
			<div className="flex items-center border-b border-slate-200 dark:border-slate-800 pb-3 gap-2 overflow-x-auto scrollbar-none">
				{tabs.map((tab) => {
					const isActive = activeTab === tab.id
					const Icon = tab.icon
					return (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							type="button"
							className={`px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 border backdrop-blur-md focus:outline-none whitespace-nowrap cursor-pointer flex items-center gap-2 group ${
								isActive
									? 'bg-purple-600/10 text-purple-600 dark:text-purple-400 border-purple-500/30 dark:border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.08)] dark:shadow-[0_0_15px_rgba(168,85,247,0.15)] font-medium'
									: 'bg-white/40 dark:bg-slate-900/20 text-slate-500 dark:text-slate-400 border-slate-200/50 dark:border-transparent hover:bg-white/60 dark:hover:bg-slate-900/40 hover:text-slate-700 dark:hover:text-slate-200'
							}`}
						>
							{Icon && <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110 text-purple-600 dark:text-purple-400' : 'group-hover:scale-110 text-slate-400 dark:text-slate-500'}`} />}
							<span>{tab.label}</span>
						</button>
					)
				})}
			</div>

			{/* Conteúdo das Abas */}
			<div className="w-full">
				
				{/* 1. ABA GERAL (Dashboard Principal) */}
				{activeTab === 'geral' && (
					<div className="flex flex-col gap-8 animate-fadeIn">
						
						{/* Fila de KPIs Rápidos */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{/* Card 1: Total Sets */}
							<div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 group">
								<div className="flex flex-col gap-1 min-w-0">
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sets Assistidos</span>
									<span className="text-2xl font-black text-slate-900 dark:text-white">{kpis.totalSets}</span>
								</div>
								<div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-500/20 dark:border-purple-500/30 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(168,85,247,0.1)] shrink-0">
									<Headphones className="w-5 h-5" />
								</div>
							</div>
							{/* Card 2: Festivals */}
							<div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 group">
								<div className="flex flex-col gap-1 min-w-0">
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Festivais Únicos</span>
									<span className="text-2xl font-black text-slate-900 dark:text-white">{kpis.uniqueFestivals}</span>
								</div>
								<div className="p-3 bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-xl border border-pink-500/20 dark:border-pink-500/30 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(236,72,153,0.1)] shrink-0">
									<Ticket className="w-5 h-5" />
								</div>
							</div>
							{/* Card 3: DJs */}
							<div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 group">
								<div className="flex flex-col gap-1 min-w-0">
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">DJs Vistos</span>
									<span className="text-2xl font-black text-slate-900 dark:text-white">{kpis.uniqueDjs}</span>
								</div>
								<div className="p-3 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-xl border border-cyan-500/20 dark:border-cyan-500/30 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(6,182,212,0.1)] shrink-0">
									<Users className="w-5 h-5" />
								</div>
							</div>
							{/* Card 4: Top Genre */}
							<div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 group">
								<div className="flex flex-col gap-1 min-w-0">
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Género Mais Ouvido</span>
									<span className="text-2xl font-black text-purple-600 dark:text-purple-400 truncate">{kpis.topGenreName}</span>
								</div>
								<div className="p-3 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 rounded-xl border border-fuchsia-500/20 dark:border-fuchsia-500/30 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(217,70,239,0.1)] shrink-0">
									<Flame className="w-5 h-5" />
								</div>
							</div>
						</div>

						{/* Grid Principal de duas colunas */}
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
							
							{/* Bloco Top 10 DJs Interativo (6 colunas) */}
							<div className="lg:col-span-6 flex flex-col gap-6">
								<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
									<div>
										<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
											<User className="text-purple-500 dark:text-purple-400 w-5 h-5" />
											Top DJs Registados
										</h2>
										<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
											Lista dos DJs com mais sets registados na base de dados (clica para ver o histórico).
										</p>
									</div>

									<div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto pr-1">
										{displayedTopDjs.length > 0 ? (
											displayedTopDjs.map((dj, index) => {
												const djGenres = generos
													.filter((g) => dj.generoIds?.includes(g.id))
													.map((g) => g.nome)
													.join(', ') || 'Sem géneros'

												const initials = dj.nome
													.split(' ')
													.filter(Boolean)
													.slice(0, 2)
													.map((part) => part.charAt(0).toUpperCase())
													.join('')

												return (
													<div
														key={dj.id}
														onClick={() => {
															setModalDjData(dj)
															setIsModalOpen(true)
														}}
														className="hover:bg-slate-100/60 dark:hover:bg-white/5 cursor-pointer rounded-xl p-2.5 transition-all flex justify-between items-center border border-transparent hover:border-slate-200/50 dark:hover:border-white/5 active:scale-[0.99]"
													>
														<div className="flex items-center gap-3 min-w-0">
															<span className="text-xs font-bold text-slate-500 w-5 text-right shrink-0">{index + 1}.</span>
															{/* Avatar */}
															<div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-400/20 text-xs font-bold text-slate-700 dark:text-slate-200 ring-1 ring-slate-200 dark:ring-white/10">
																{dj.imagem ? (
																	<img src={dj.imagem} alt={dj.nome} className="h-full w-full object-cover" />
																) : (
																	initials
																)}
															</div>
															{/* DJ Info */}
															<div className="min-w-0">
																<p className="text-xs font-bold text-slate-900 dark:text-white truncate">{dj.nome}</p>
																<p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{djGenres}</p>
															</div>
														</div>
														<span className="text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-lg px-2.5 py-1 shrink-0 ml-2">
															{dj.count} {dj.count === 1 ? 'set' : 'sets'}
														</span>
													</div>
												)
											})
										) : (
											<p className="text-xs text-slate-500 italic text-center py-8">Nenhum set registado na base de dados.</p>
										)}
									</div>

									{topDjsList.length > 10 && (
										<button
											type="button"
											onClick={() => setShowAllDjs(!showAllDjs)}
											className="mt-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 rounded-xl py-2.5 w-full cursor-pointer focus:outline-none"
										>
											{showAllDjs ? 'Mostrar menos' : `Mostrar mais (${topDjsList.length - 10} adicionais)`}
										</button>
									)}
								</section>
							</div>

							{/* Bloco Frequência de Festivais (6 colunas) */}
							<div className="lg:col-span-6 flex flex-col gap-6">
								<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
									<div>
										<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
											<BarChart2 className="text-cyan-500 dark:text-cyan-400 w-5 h-5" />
											Frequência de Festivais
										</h2>
										<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
											Frequência de atuações assistidas em cada festival (Top 10).
										</p>
									</div>

									{festivalFreqData.length > 0 ? (
										<div style={{ width: '100%', height: '340px' }}>
											<ResponsiveContainer width="100%" height="100%">
												<BarChart data={festivalFreqData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
													<defs>
														<linearGradient id="festivalCountGradient" x1="0" y1="0" x2="1" y2="0">
															<stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
															<stop offset="100%" stopColor="#0891b2" stopOpacity={0.15} />
														</linearGradient>
													</defs>
													<CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#cbd5e1'} opacity={darkMode ? 0.2 : 0.4} horizontal={false} />
													<XAxis type="number" allowDecimals={false} tick={{ fill: darkMode ? '#cbd5e1' : '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
													<YAxis dataKey="name" type="category" tick={{ fill: darkMode ? '#cbd5e1' : '#475569', fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
													<Tooltip
														contentStyle={{
															backgroundColor: darkMode ? '#0f172a' : '#ffffff',
															borderColor: darkMode ? '#334155' : '#e2e8f0',
															borderRadius: '12px',
															color: darkMode ? '#fff' : '#0f172a',
															fontSize: '11px',
															boxShadow: darkMode ? '0 10px 25px -5px rgba(0, 0, 0, 0.3)' : '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
														}}
														cursor={{ fill: darkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)' }}
													/>
													<Bar dataKey="quantidade" name="Sets" fill="url(#festivalCountGradient)" radius={[0, 4, 4, 0]} barSize={16} />
												</BarChart>
											</ResponsiveContainer>
										</div>
									) : (
										<p className="text-xs text-slate-500 italic text-center py-10">Nenhum festival registado com sets.</p>
									)}
								</section>
							</div>
						</div>
					</div>
				)}

				{activeTab === 'djs' && (
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
						
						{/* Coluna Esquerda: Todos os Gráficos Empilhados (7 colunas) */}
						<div className="lg:col-span-7 flex flex-col gap-8">
							
							{/* 1. Distribuição de Avaliações */}
							<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
								<div>
									<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
										<BarChart2 className="text-purple-500 dark:text-purple-400 w-5 h-5" />
										Distribuição de Avaliações de {selectedDj?.nome}
									</h2>
									<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
										Quantidade total de sets pontuados em cada nota de 1 a 10 para este DJ.
									</p>
								</div>

								<div style={{ width: '100%', height: '300px' }}>
									<ResponsiveContainer width="100%" height="100%">
										<BarChart data={djRatingDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
											<defs>
												<linearGradient id="globalRatingGradient" x1="0" y1="0" x2="0" y2="1">
													<stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
													<stop offset="100%" stopColor="#6366f1" stopOpacity={0.15} />
												</linearGradient>
											</defs>
											<CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#cbd5e1'} opacity={darkMode ? 0.25 : 0.45} vertical={false} />
											<XAxis
												dataKey="nota"
												tick={{ fill: darkMode ? '#cbd5e1' : '#475569', fontSize: 11, fontFamily: 'sans-serif' }}
												axisLine={{ stroke: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)' }}
												tickLine={false}
											/>
											<YAxis
												allowDecimals={false}
												tick={{ fill: darkMode ? '#cbd5e1' : '#475569', fontSize: 11, fontFamily: 'sans-serif' }}
												axisLine={{ stroke: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)' }}
												tickLine={false}
											/>
											<Tooltip
												cursor={{ fill: darkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)' }}
												contentStyle={{
													backgroundColor: darkMode ? '#0f172a' : '#ffffff',
													borderColor: darkMode ? '#334155' : '#e2e8f0',
													borderRadius: '12px',
													color: darkMode ? '#fff' : '#0f172a',
													fontSize: '12px',
													boxShadow: darkMode ? '0 10px 25px -5px rgba(0, 0, 0, 0.3)' : '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
												}}
												itemStyle={{ color: darkMode ? '#a855f7' : '#7c3aed' }}
												labelStyle={{ fontWeight: 'bold', color: darkMode ? '#fff' : '#0f172a' }}
												labelFormatter={(value) => `Nota: ${value}`}
											/>
											<Bar
												dataKey="quantidade"
												fill="url(#globalRatingGradient)"
												radius={[4, 4, 0, 0]}
												barSize={24}
											/>
										</BarChart>
									</ResponsiveContainer>
								</div>
							</section>

							{/* 2. Perfil de Intensidade / Energia por DJ */}
							<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
								<div>
									<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
										<BarChart2 className="text-purple-500 dark:text-purple-400 w-5 h-5" />
										Perfil de Intensidade / Energia por DJ
									</h2>
									<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
										Comparação de perfil baseada na Intensidade dos géneros, BPM e Sets registados.
									</p>
								</div>

								<div style={{ width: '100%', height: '300px' }}>
									<ResponsiveContainer width="100%" height="100%">
										<RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
											<PolarGrid stroke={darkMode ? '#334155' : '#cbd5e1'} opacity={0.6} />
											<PolarAngleAxis dataKey="subject" tick={{ fill: darkMode ? '#cbd5e1' : '#475569', fontSize: 12, fontWeight: 600, fontFamily: 'sans-serif' }} />
											<PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: darkMode ? '#94a3b8' : '#475569' }} />
											{selectedDj && (
												<Radar
													key={selectedDj.id}
													name={selectedDj.nome}
													dataKey={selectedDj.id}
													stroke={selectedDjColor}
													fill={selectedDjColor}
													fillOpacity={0.15}
												/>
											)}
											<Tooltip
												contentStyle={{
													backgroundColor: darkMode ? '#0f172a' : '#ffffff',
													borderColor: darkMode ? '#334155' : '#e2e8f0',
													borderRadius: '12px',
													color: darkMode ? '#fff' : '#0f172a',
												}}
												itemStyle={{ color: darkMode ? '#fff' : '#0f172a' }}
											/>
											<Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif', marginTop: '10px', color: darkMode ? '#cbd5e1' : '#475569' }} />
										</RadarChart>
									</ResponsiveContainer>
								</div>
							</section>

							{/* 3. Gráfico Interativo de Avaliações do DJ Selecionado */}
							{selectedDjId && selectedDj && (
								<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-6 animate-fadeIn">
									<div>
										<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
											<TrendingUp className="text-cyan-400 w-5 h-5" />
											Histórico de Avaliações de {selectedDj.nome}
										</h2>
										<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
											Evolução das notas atribuídas aos sets deste DJ ao longo do tempo.
										</p>
									</div>

									{djChartData.length > 0 ? (
										<div style={{ width: '100%', height: '220px' }}>
											<ResponsiveContainer width="100%" height="100%">
												<AreaChart data={djChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
													<defs>
														<linearGradient id="djHistoryGradient" x1="0" y1="0" x2="0" y2="1">
															<stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
															<stop offset="100%" stopColor="#06b6d4" stopOpacity={0.0} />
														</linearGradient>
													</defs>
													<CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#cbd5e1'} opacity={darkMode ? 0.2 : 0.4} vertical={false} />
													<XAxis
														dataKey="exibicao"
														tick={{ fill: darkMode ? '#94a3b8' : '#475569', fontSize: 9, fontFamily: 'sans-serif' }}
														axisLine={{ stroke: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)' }}
														tickLine={false}
													/>
													<YAxis
														domain={[0, 10]}
														tick={{ fill: darkMode ? '#94a3b8' : '#475569', fontSize: 10, fontFamily: 'sans-serif' }}
														axisLine={{ stroke: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)' }}
														tickLine={false}
													/>
													<Tooltip
														contentStyle={{
															backgroundColor: darkMode ? '#0f172a' : '#ffffff',
															borderColor: darkMode ? '#334155' : '#e2e8f0',
															borderRadius: '12px',
															color: darkMode ? '#fff' : '#0f172a',
															fontSize: '12px',
															boxShadow: darkMode ? '0 10px 25px -5px rgba(0, 0, 0, 0.3)' : '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
														}}
														itemStyle={{ color: darkMode ? '#06b6d4' : '#0891b2' }}
														labelFormatter={(label, items) => {
															const item = items[0]?.payload
															return item ? `${item.data} - ${item.festivalNome}` : ''
														}}
													/>
													<Area
														type="monotone"
														dataKey="avaliacao"
														name="Nota"
														stroke="#06b6d4"
														strokeWidth={2.5}
														fill="url(#djHistoryGradient)"
														dot={{ fill: '#06b6d4', stroke: darkMode ? '#0f172a' : '#ffffff', strokeWidth: 1.5, r: 4 }}
														activeDot={{ r: 6, strokeWidth: 0 }}
													/>
												</AreaChart>
											</ResponsiveContainer>
										</div>
									) : (
										<div className="flex flex-col items-center justify-center py-10 text-center gap-2 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-100/50 dark:bg-slate-950/20">
											<Info className="w-8 h-8 text-slate-400 dark:text-slate-500" />
											<p className="text-sm text-slate-700 dark:text-slate-400 font-medium">Sem avaliações registadas</p>
											<p className="text-xs text-slate-500 max-w-xs">
												Adiciona avaliações aos sets de {selectedDj.nome} para visualizar o gráfico.
											</p>
										</div>
									)}
								</section>
							)}
						</div>

						{/* Coluna Direita: Seletor de DJs Estilo Form e Presenças (5 colunas) */}
						<div className="lg:col-span-5 flex flex-col gap-8">
							
							{/* Seletor do DJ Estilo Form */}
							<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
								<div className="flex items-center gap-3">
									<div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-600 dark:text-purple-400">
										<User className="w-5 h-5" />
									</div>
									<div>
										<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight">
											Selecionar DJ
										</h2>
										<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
											Pesquisa e escolhe um artista para atualizar as métricas.
										</p>
									</div>
								</div>

								{/* Barra de Pesquisa */}
								<div className="relative">
									<Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
									<input
										type="text"
										value={djSearchTerm}
										onChange={(e) => setDjSearchTerm(e.target.value)}
										placeholder="Pesquisar artista ou género..."
										className="w-full rounded-xl border border-slate-200 bg-white/80 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all"
									/>
								</div>

								{/* Lista de DJs com Scroll */}
								<div className="flex max-h-[300px] flex-col gap-2 overflow-y-auto p-1 pb-3">
									{filteredDjs.length > 0 ? (
										filteredDjs.map((dj) => {
											const isSelected = selectedDjId === dj.id
											const djGenresList = generos
												.filter((g) => dj.generoIds?.includes(g.id))
												.map((g) => g.nome)
												.join(', ') || 'Sem géneros'

											const initials = dj.nome
												.split(' ')
												.filter(Boolean)
												.slice(0, 2)
												.map((part) => part.charAt(0).toUpperCase())
												.join('')

											return (
												<button
													key={dj.id}
													type="button"
													onClick={() => setSelectedDjId(dj.id)}
													className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border p-2 text-left transition-all duration-100 transition-transform active:scale-[0.98] focus:outline-none ${
														isSelected
															? 'border-purple-500/40 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.08)] dark:shadow-[0_0_15px_rgba(168,85,247,0.15)] text-slate-900 dark:text-white'
															: 'border-transparent bg-slate-100/40 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:border-purple-500/30 hover:bg-purple-500/5 dark:hover:bg-purple-500/10'
													}`}
												>
													{/* Avatar */}
													<div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500/25 to-cyan-400/25 text-sm font-bold text-slate-700 dark:text-white ring-1 ring-slate-200 dark:ring-white/20">
														{dj.imagem ? (
															<img src={dj.imagem} alt={dj.nome} className="h-full w-full object-cover" />
														) : (
															initials
														)}
													</div>

													{/* Conteúdo */}
													<div className="min-w-0 flex-1">
														<div className="flex items-center justify-between gap-2">
															<p className="truncate text-sm font-bold text-slate-900 dark:text-white">{dj.nome}</p>
															{isSelected && (
																<span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400 whitespace-nowrap">
																	Selecionado
																</span>
															)}
														</div>
														<p className="truncate text-[11px] leading-4 text-slate-500 dark:text-slate-400 mt-1">{djGenresList}</p>
													</div>
												</button>
											)
										})
									) : (
										<div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-100/40 dark:bg-slate-950/20">
											Nenhum DJ encontrado para a pesquisa.
										</div>
									)}
								</div>
							</section>

							{/* Tabela de Rastreio Horas/Locais (Histórico de Presenças) */}
							{selectedDjId && selectedDj && (
								<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-4 animate-fadeIn">
									<div>
										<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
											<Calendar className="text-purple-500 dark:text-purple-400 w-5 h-5" />
											Histórico de Presenças
										</h2>
										<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
											Lista de sets e eventos em que assististe à atuação do DJ.
										</p>
									</div>

									{djHistoryData.length > 0 ? (
										<div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/5">
											<table className="w-full text-left text-sm border-collapse">
												<thead>
													<tr className="bg-slate-100/60 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-white/10">
														<th className="py-3 px-4">Data e Hora</th>
														<th className="py-3 px-4">Festival / Edição</th>
														<th className="py-3 px-4 flex items-center gap-1">
															<MapPin className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
															Local
														</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
													{djHistoryData.map((item) => (
														<tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
															<td className="py-3.5 px-4 text-slate-800 dark:text-slate-300 font-medium">
																{item.data.split('-').reverse().join('/')} 
																{item.hora && <span className="text-slate-500 font-normal"> às {item.hora}</span>}
															</td>
															<td className="py-3.5 px-4 text-purple-600 dark:text-purple-300 font-semibold">
																{item.festivalNome}
															</td>
															<td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
																{item.local}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									) : (
										<div className="flex flex-col items-center justify-center py-10 text-center gap-2 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-100/50 dark:bg-slate-950/20">
											<Calendar className="w-8 h-8 text-slate-400 dark:text-slate-500" />
											<p className="text-sm text-slate-700 dark:text-slate-400 font-medium">Nenhuma presença registada</p>
											<p className="text-xs text-slate-500 max-w-xs">
												Não existem sets associados a {selectedDj.nome} no histórico.
											</p>
										</div>
									)}
								</section>
							)}
						</div>
					</div>
				)}

				{activeTab === 'festivais' && (
					<div className="grid grid-cols-1 gap-8 animate-fadeIn">
						<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
							<div>
								<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
									<BarChart2 className="text-purple-500 dark:text-purple-400 w-5 h-5" />
									Sets por Festival
								</h2>
								<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
									Distribuição de atuações por cada festival registado.
								</p>
							</div>

							{setsPorFestival.length > 0 ? (
								<div style={{ width: '100%', height: '320px' }}>
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={setsPorFestival}
												dataKey="quantidade"
												nameKey="name"
												cx="50%"
												cy="50%"
												innerRadius="65%"
												outerRadius="85%"
												paddingAngle={4}
												stroke={darkMode ? 'rgba(15, 23, 42, 0.8)' : '#ffffff'}
												strokeWidth={3}
												label={{ fill: darkMode ? '#cbd5e1' : '#475569', fontSize: 11, fontFamily: 'sans-serif' }}
												labelLine={{ stroke: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.15)' }}
											>
												{setsPorFestival.map((entry, index) => (
													<Cell key={`cell-${entry.name}`} fill={pieColors[index % pieColors.length]} />
												))}
											</Pie>
											<Tooltip
												contentStyle={{
													backgroundColor: darkMode ? '#0f172a' : '#ffffff',
													borderColor: darkMode ? '#334155' : '#e2e8f0',
													borderRadius: '12px',
													color: darkMode ? '#fff' : '#0f172a',
												}}
												itemStyle={{ color: darkMode ? '#fff' : '#0f172a' }}
											/>
										</PieChart>
									</ResponsiveContainer>
								</div>
							) : (
								<div className="text-sm text-slate-500 italic py-10 text-center">Nenhum set registado em festivais.</div>
							)}
						</section>
					</div>
				)}

				{activeTab === 'locais' && (
					<div className="text-slate-600 dark:text-slate-400 font-medium py-12 text-center bg-white/60 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 backdrop-blur-md rounded-2xl animate-fadeIn">
						Estatísticas de Locais em breve...
					</div>
				)}

				{activeTab === 'generos' && (
					<div className="grid grid-cols-1 gap-8 animate-fadeIn">
						<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
							<div>
								<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
									<TrendingUp className="text-cyan-500 dark:text-cyan-400 w-5 h-5" stroke="#22d3ee" />
									Espectro de Ritmo (BPM por Género)
								</h2>
								<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
									Mapeamento do andamento/velocidade (BPM) de cada género registado.
								</p>
							</div>

							{bpmPorGenero.length > 0 ? (
								<div style={{ width: '100%', height: '320px' }}>
									<ResponsiveContainer width="100%" height="100%">
										<AreaChart data={bpmPorGenero}>
											<defs>
												<linearGradient id="bpmGradient" x1="0" y1="0" x2="0" y2="1">
													<stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
													<stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
												</linearGradient>
											</defs>
											<CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#cbd5e1'} opacity={darkMode ? 0.3 : 0.5} vertical={false} />
											<XAxis
												dataKey="name"
												tick={{ fill: darkMode ? '#cbd5e1' : '#475569', fontSize: 11, fontFamily: 'sans-serif' }}
												axisLine={{ stroke: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)' }}
												tickLine={false}
											/>
											<YAxis
												domain={['auto', 'auto']}
												tick={{ fill: darkMode ? '#cbd5e1' : '#475569', fontSize: 11, fontFamily: 'sans-serif' }}
												axisLine={{ stroke: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)' }}
												tickLine={false}
											/>
											<Tooltip
												contentStyle={{
													backgroundColor: darkMode ? '#0f172a' : '#ffffff',
													borderColor: darkMode ? '#334155' : '#e2e8f0',
													borderRadius: '12px',
													color: darkMode ? '#fff' : '#0f172a',
												}}
												itemStyle={{ color: darkMode ? '#fff' : '#0f172a' }}
											/>
											<Area type="monotone" dataKey="bpm" stroke="#06b6d4" strokeWidth={2} fill="url(#bpmGradient)" />
										</AreaChart>
									</ResponsiveContainer>
								</div>
							) : (
								<div className="text-sm text-slate-500 italic py-10 text-center">Nenhum género registado.</div>
							)}
						</section>
					</div>
				)}
			</div>

			{/* Modal de Presenças Flutuante de Vidro Espesso */}
			{isModalOpen && modalDjData && createPortal(
				(() => {
					const modalDjInitials = modalDjData.nome
						.split(' ')
						.filter(Boolean)
						.slice(0, 2)
						.map((part) => part.charAt(0).toUpperCase())
						.join('')

					return (
						<div
							className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-modal-overlay"
							onClick={() => {
								setIsModalOpen(false)
								setModalDjData(null)
							}}
						>
							<div
								className="bg-white/95 dark:bg-slate-950/85 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 rounded-2xl max-w-2xl w-full relative z-50 shadow-2xl flex flex-col gap-5 animate-modal-content"
								onClick={(e) => e.stopPropagation()}
							>
								{/* Cabeçalho do Modal */}
								<div className="flex justify-between items-start gap-4">
									<div className="flex items-center gap-3">
										{/* Avatar do DJ no Modal */}
										<div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-400/20 text-sm font-bold text-slate-700 dark:text-slate-200 ring-1 ring-slate-200 dark:ring-white/10 shadow-lg">
											{modalDjData.imagem ? (
												<img src={modalDjData.imagem} alt={modalDjData.nome} className="h-full w-full object-cover" />
											) : (
												modalDjInitials
											)}
										</div>
										<div>
											<h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
												Histórico de {modalDjData.nome}
											</h3>
											{/* Mini KPIs do DJ no Cabeçalho */}
											<div className="flex gap-2.5 items-center mt-1.5">
												<span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-full px-2.5 py-0.5 flex items-center gap-1">
													{modalStats.count} {modalStats.count === 1 ? 'set' : 'sets'}
												</span>
												<span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 rounded-full px-2.5 py-0.5 flex items-center gap-1">
													Média: {modalStats.avg}
												</span>
											</div>
										</div>
									</div>
									<button
										type="button"
										onClick={() => {
											setIsModalOpen(false)
											setModalDjData(null)
										}}
										className="text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white rounded-full p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
									>
										<X className="w-5 h-5" />
									</button>
								</div>

								{/* Tabela de Presenças no Modal */}
								<div className="max-h-[380px] overflow-y-auto rounded-xl border border-slate-200 dark:border-white/5 pr-1">
									{modalSets.length > 0 ? (
										<table className="w-full text-left text-sm border-collapse">
											<thead>
												<tr className="bg-slate-100/60 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-white/10">
													<th className="py-2.5 px-3.5">Festival / Edição</th>
													<th className="py-2.5 px-3.5">Data e Hora</th>
													<th className="py-2.5 px-3.5 text-center">Nota</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
												{modalSets.map((set) => (
													<tr key={set.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
														<td className="py-3 px-3.5 text-purple-600 dark:text-purple-300 font-semibold">{set.festivalNome}</td>
														<td className="py-3 px-3.5 text-slate-800 dark:text-slate-300">
															{set.data.split('-').reverse().join('/')}
															{set.hora && <span className="text-slate-500 font-normal"> às {set.hora}</span>}
														</td>
														<td className="py-3 px-3.5 text-center">
															{getRatingBadge(set.avaliacao)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									) : (
										<div className="text-center py-8 text-xs text-slate-500">
											Nenhum set registado para este DJ.
										</div>
									)}
								</div>
							</div>
						</div>
					)
				})()
			, document.body)}
		</div>
	)
}
