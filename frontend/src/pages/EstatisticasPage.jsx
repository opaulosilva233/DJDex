import { useState, useMemo, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../services/api'
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
import { User, Calendar, MapPin, BarChart2, TrendingUp, Info, Search, X, LayoutDashboard, Music, Sliders, Headphones, Ticket, Users, Flame, Building2, Navigation, Star, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, Trophy, Award, Sparkles, History, Crown, PieChart as LucidePieChart } from 'lucide-react'

const pieColors = ['#a855f7', '#06b6d4', '#ec4899', '#10b981', '#f43f5e', '#14b8a6', '#6366f1', '#f59e0b', '#8b5cf6', '#3b82f6']

function getFestivalLocalAndYear(festival) {
	if (!festival) return { local: 'Local desconhecido', ano: 'Ano por definir' }
	if (Array.isArray(festival.edicoes) && festival.edicoes.length > 0) {
		const sorted = [...festival.edicoes].sort((a, b) => (Number(b.ano) || 0) - (Number(a.ano) || 0))
		return {
			local: sorted[0].local || festival.local || 'Local desconhecido',
			ano: sorted[0].ano || festival.ano || 'Ano por definir'
		}
	}
	return {
		local: festival.local || 'Local desconhecido',
		ano: festival.ano || 'Ano por definir'
	}
}

function getFestivalAvatar(festival) {
	if (festival?.imagem) {
		return <img src={festival.imagem} alt={festival.nome} className="h-full w-full object-cover" />
	}
	if (!festival?.nome) return 'FE'
	return festival.nome
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join('')
}

function getDjAvatar(dj) {
	if (dj?.imagem) {
		return <img src={dj.imagem} alt={dj.nome} className="h-full w-full object-cover" />
	}
	if (!dj?.nome) return 'DJ'
	return dj.nome
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join('')
}

// ──────────────────────────────────────────────
// Aba Locais — Análise Geográfica dos Festivais
// ──────────────────────────────────────────────
function LocaisTab({ sets = [], festivais = [], djs = [], darkMode = true }) {
	// 1. Contagem de sets por Cidade
	const cidadesData = useMemo(() => {
		const counts = {}
		sets.forEach((s) => {
			if (!s.festivalId) return
			const festival = festivais.find((f) => f.id === s.festivalId)
			if (!festival) return
			// Resolve cidade: tenta edicoes[].local, fallback para festival.local
			let cidade = festival.local || ''
			if (s.edicaoId) {
				const edicao = festival.edicoes?.find((e) => e.id === s.edicaoId)
				if (edicao && edicao.local) cidade = edicao.local
			} else if (Array.isArray(festival.edicoes) && festival.edicoes.length > 0) {
				// Encontrar a edição pelo ano do set
				const ano = s.data ? Number(s.data.substring(0, 4)) : null
				const edicao = ano
					? festival.edicoes.find((e) => Number(e.ano) === ano) || festival.edicoes[0]
					: festival.edicoes[0]
				if (edicao && edicao.local) cidade = edicao.local
			}
			if (!cidade) return
			counts[cidade] = (counts[cidade] || 0) + 1
		})
		return Object.entries(counts)
			.map(([name, sets]) => ({ name, sets }))
			.sort((a, b) => b.sets - a.sets)
	}, [sets, festivais])

	// 2. Recintos únicos (venues)
	const recintos = useMemo(() => {
		const seen = new Set()
		const list = []
		festivais.forEach((f) => {
			const addLocal = (local, cidade) => {
				if (!local || seen.has(local)) return
				seen.add(local)
				list.push({ local, cidade: cidade || f.local || '' })
			}
			if (Array.isArray(f.edicoes) && f.edicoes.length > 0) {
				f.edicoes.forEach((e) => addLocal(e.local, f.local || ''))
			} else if (f.local) {
				addLocal(f.local, f.local)
			}
		})
		return list
	}, [festivais])

	// 3. Tabela de Rotas: Cidade / Recinto | Festival | Ano | Nº Sets
	const routesTable = useMemo(() => {
		const rows = []
		festivais.forEach((f) => {
			const festivalSets = sets.filter((s) => s.festivalId === f.id)
			if (festivalSets.length === 0) return

			// Agrupar por ano
			const byYear = {}
			festivalSets.forEach((s) => {
				const ano = s.data ? s.data.substring(0, 4) : '—'
				byYear[ano] = byYear[ano] || { ano, sets: 0, local: '' }
				byYear[ano].sets++

				// Resolver local/recinto para este ano
				if (!byYear[ano].local) {
					if (s.edicaoId) {
						const edicao = f.edicoes?.find((e) => e.id === s.edicaoId)
						byYear[ano].local = edicao?.local || f.local || '—'
					} else if (Array.isArray(f.edicoes) && f.edicoes.length > 0) {
						const edicao = f.edicoes.find((e) => String(e.ano) === ano) || f.edicoes[0]
						byYear[ano].local = edicao?.local || f.local || '—'
					} else {
						byYear[ano].local = f.local || '—'
					}
				}
			})

			Object.values(byYear)
				.sort((a, b) => b.ano - a.ano)
				.forEach(({ ano, sets: numSets, local }) => {
					// Derive cidade do local (se tiver espaço, usa o local completo)
					const cidade = f.local || local || '—'
					rows.push({
						id: `${f.id}-${ano}`,
						cidade,
						recinto: local !== cidade ? local : local,
						festival: f.nome,
						ano,
						numSets,
					})
				})
		})
		return rows.sort((a, b) => b.ano - a.ano || a.festival.localeCompare(b.festival, 'pt'))
	}, [sets, festivais])

	const tooltipStyle = {
		backgroundColor: darkMode ? '#0f172a' : '#ffffff',
		borderColor: darkMode ? '#334155' : '#e2e8f0',
		borderRadius: '12px',
		color: darkMode ? '#fff' : '#0f172a',
		fontSize: '11px',
		boxShadow: darkMode ? '0 10px 25px -5px rgba(0, 0, 0, 0.3)' : '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
	}

	const emptyMap = cidadesData.length === 0

	return (
		<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">

			{/* ── Coluna Esquerda: Cidades mais Visitadas (5 colunas) ── */}
			<div className="lg:col-span-5 flex flex-col gap-6">
				<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-6 h-full">
					<div>
						<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
							<MapPin className="text-cyan-500 dark:text-cyan-400 w-5 h-5" />
							Cidades mais Visitadas
						</h2>
						<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
							Número de sets assistidos agrupados por cidade de realização do festival.
						</p>
					</div>

					{emptyMap ? (
						<div className="flex flex-col items-center justify-center py-16 text-center gap-3 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-100/40 dark:bg-slate-950/20 flex-1">
							<MapPin className="w-8 h-8 text-slate-400 dark:text-slate-500" />
							<p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Sem dados geográficos</p>
							<p className="text-xs text-slate-500 max-w-xs">
								Adiciona festivais com a informação de cidade/local para visualizar este gráfico.
							</p>
						</div>
					) : (
						<div style={{ width: '100%', height: `${Math.max(200, cidadesData.length * 52)}px` }}>
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={cidadesData}
									layout="vertical"
									margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
								>
									<defs>
										<linearGradient id="cidadeGradient" x1="0" y1="0" x2="1" y2="0">
											<stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
											<stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.25} />
										</linearGradient>
									</defs>
									<CartesianGrid
										strokeDasharray="3 3"
										stroke={darkMode ? '#334155' : '#cbd5e1'}
										opacity={darkMode ? 0.2 : 0.4}
										horizontal={false}
									/>
									<XAxis
										type="number"
										allowDecimals={false}
										tick={{ fill: darkMode ? '#cbd5e1' : '#475569', fontSize: 10 }}
										axisLine={false}
										tickLine={false}
									/>
									<YAxis
										dataKey="name"
										type="category"
										tick={{ fill: darkMode ? '#cbd5e1' : '#475569', fontSize: 11, fontWeight: 600 }}
										axisLine={false}
										tickLine={false}
										width={110}
									/>
									<Tooltip
										contentStyle={tooltipStyle}
										cursor={{ fill: darkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
										formatter={(value) => [`${value} set${value !== 1 ? 's' : ''}`, 'Sets Assistidos']}
									/>
									<Bar
										dataKey="sets"
										name="Sets"
										fill="url(#cidadeGradient)"
										radius={[0, 6, 6, 0]}
										barSize={20}
									/>
								</BarChart>
							</ResponsiveContainer>
						</div>
					)}
				</section>
			</div>

			{/* ── Coluna Direita: Recintos & Tabela de Rotas (7 colunas) ── */}
			<div className="lg:col-span-7 flex flex-col gap-6">

				{/* Bloco de Recintos / Venues */}
				<div className="bg-white/5 border border-white/5 rounded-2xl p-6 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border-slate-200/60 dark:border-white/5 shadow-xl">
					<div className="flex items-center gap-2 mb-4">
						<div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 shrink-0">
							<MapPin className="w-4 h-4" />
						</div>
						<div>
							<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight">
								Recintos &amp; Venues
							</h2>
							<p className="text-xs text-slate-500 dark:text-slate-400">
								Localizações exatas dos festivais registados na base de dados.
							</p>
						</div>
					</div>

					{recintos.length > 0 ? (
						<div className="flex flex-wrap gap-2">
							{recintos.map((r, i) => (
								<span
									key={i}
									className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100/80 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-700 dark:hover:text-cyan-300 transition-all duration-200 cursor-default shadow-sm"
								>
									<Building2 className="w-3 h-3 text-cyan-500 dark:text-cyan-400 shrink-0" />
									<span>{r.local}</span>
									{r.cidade && r.cidade !== r.local && (
										<span className="text-slate-400 dark:text-slate-500 font-normal">· {r.cidade}</span>
									)}
								</span>
							))}
						</div>
					) : (
						<p className="text-xs text-slate-500 italic py-4 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-100/40 dark:bg-slate-950/20">
							Nenhum recinto registado ainda.
						</p>
					)}
				</div>

				{/* Tabela de Rotas de Festivais */}
				<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-4 flex-1">
					<div>
						<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
							<BarChart2 className="text-purple-500 dark:text-purple-400 w-5 h-5" />
							Distribuição Geográfica
						</h2>
						<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
							Mapeamento de cada festival por cidade, recinto, edição e número de sets registados.
						</p>
					</div>

					{routesTable.length > 0 ? (
						<div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/5">
							<table className="w-full text-left text-sm border-collapse">
								<thead>
									<tr className="bg-slate-100/60 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
										<th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
											Cidade / Recinto
										</th>
										<th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
											Festival
										</th>
										<th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">
											Ano
										</th>
										<th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-center">
											Nº Sets
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
									{routesTable.map((row) => (
										<tr
											key={row.id}
											className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors"
										>
											<td className="py-3.5 px-4">
												<div className="flex items-center gap-2">
													<Navigation className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 shrink-0 mt-0.5" />
													<div>
														<p className="text-slate-800 dark:text-slate-200 font-semibold text-xs leading-tight">
															{row.cidade}
														</p>
														{row.recinto && row.recinto !== row.cidade && (
															<p className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5 leading-tight">
																{row.recinto}
															</p>
														)}
													</div>
												</div>
											</td>
											<td className="py-3.5 px-4 text-purple-600 dark:text-purple-300 font-semibold text-xs">
												{row.festival}
											</td>
											<td className="py-3.5 px-4 text-center">
												<span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2.5 py-0.5 rounded-full">
													{row.ano}
												</span>
											</td>
											<td className="py-3.5 px-4 text-center">
												<span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full">
													{row.numSets} {row.numSets === 1 ? 'set' : 'sets'}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-12 text-center gap-3 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-100/40 dark:bg-slate-950/20">
							<BarChart2 className="w-8 h-8 text-slate-400 dark:text-slate-500" />
							<p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Sem rotas registadas</p>
							<p className="text-xs text-slate-500 max-w-xs">
								Adiciona sets associados a festivais para visualizar a distribuição geográfica.
							</p>
						</div>
					)}
				</section>
			</div>
		</div>
	)
}

export default function EstatisticasPage({ sets = [], djs = [], festivais = [], generos = [], darkMode = true }) {
	const [activeTab, setActiveTab] = useState('geral')
	const [selectedDjId, setSelectedDjId] = useState('')
	const [djSearchTerm, setDjSearchTerm] = useState('')
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [modalDjData, setModalDjData] = useState(null)
	const [showAllDjs, setShowAllDjs] = useState(false)
	const [selectedFestivalId, setSelectedFestivalId] = useState('')
	const [isFestivalDropdownOpen, setIsFestivalDropdownOpen] = useState(false)
	const [festivalSearchTerm, setFestivalSearchTerm] = useState('')
	const festivalDropdownRef = useRef(null)
	const [selectedRecurringDjId, setSelectedRecurringDjId] = useState('')
	const [selectedGenreId, setSelectedGenreId] = useState('')
	const [genreChartMode, setGenreChartMode] = useState('ranking') // 'ranking' | 'donut'
	const [showAllGenreBars, setShowAllGenreBars] = useState(false)
	const [hoveredDonutGenre, setHoveredDonutGenre] = useState(null)
	const hallOfFameScrollRef = useRef(null)

	const scrollHallOfFame = (direction) => {
		if (hallOfFameScrollRef.current) {
			const offset = direction === 'left' ? -340 : 340
			hallOfFameScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
		}
	}
	const [estatisticas, setEstatisticas] = useState(null)
	const [loadingEst, setLoadingEst] = useState(true)

	useEffect(() => {
		let isMounted = true
		setLoadingEst(true)
		api.get('/estatisticas')
			.then((data) => {
				if (isMounted) {
					setEstatisticas(data)
					setLoadingEst(false)
				}
			})
			.catch((err) => {
				console.error('Erro ao carregar estatísticas:', err)
				if (isMounted) {
					setLoadingEst(false)
				}
			})
		return () => {
			isMounted = false
		}
	}, [])

	// Configurar DJ selecionado padrão caso não esteja definido
	useEffect(() => {
		if (djs.length > 0 && (!selectedDjId || !djs.some(dj => String(dj.id) === String(selectedDjId)))) {
			setSelectedDjId(String(djs[0].id))
		}
	}, [djs, selectedDjId])

	// Configurar Festival selecionado padrão caso não esteja definido
	useEffect(() => {
		if (festivais.length > 0 && (!selectedFestivalId || !festivais.some(f => String(f.id) === String(selectedFestivalId)))) {
			setSelectedFestivalId(String(festivais[0].id))
		}
	}, [festivais, selectedFestivalId])

	// Configurar Género selecionado padrão caso não esteja definido
	useEffect(() => {
		if (generos.length > 0 && (!selectedGenreId || !generos.some(g => String(g.id) === String(selectedGenreId)))) {
			setSelectedGenreId(String(generos[0].id))
		}
	}, [generos, selectedGenreId])

	// Fechar dropdown de festival ao clicar fora ou pressionar Escape
	useEffect(() => {
		if (!isFestivalDropdownOpen) return

		function handleClickOutside(event) {
			if (festivalDropdownRef.current && !festivalDropdownRef.current.contains(event.target)) {
				setIsFestivalDropdownOpen(false)
			}
		}

		function handleKeyDown(event) {
			if (event.key === 'Escape') {
				setIsFestivalDropdownOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		document.addEventListener('keydown', handleKeyDown)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [isFestivalDropdownOpen])

	// Festival selecionado e metadados
	const selectedFestival = useMemo(() => {
		return festivais.find((f) => String(f.id) === String(selectedFestivalId))
	}, [festivais, selectedFestivalId])

	const selectedFestivalInfo = useMemo(() => {
		return getFestivalLocalAndYear(selectedFestival)
	}, [selectedFestival])

	// Festivais filtrados pela pesquisa no seletor
	const filteredFestivais = useMemo(() => {
		if (!festivalSearchTerm.trim()) return festivais
		const term = festivalSearchTerm.toLowerCase()
		return festivais.filter((f) => {
			const info = getFestivalLocalAndYear(f)
			const searchString = `${f.nome ?? ''} ${info.local} ${info.ano}`.toLowerCase()
			return searchString.includes(term)
		})
	}, [festivais, festivalSearchTerm])

	// Calculations for the "Geral" dashboard
	const kpis = useMemo(() => {
		const totalSets = sets.length

		const uniqueFestivals = new Set(sets.map((s) => s.festivalId).filter(Boolean)).size

		const uniqueDjs = new Set(
			sets.flatMap((s) => [s.djId, s.dj2Id]).filter(Boolean).map(String)
		).size

		// Compute most popular genre based on sets seen
		const genreCounts = {}
		sets.forEach((set) => {
			if (set.djId) {
				const dj = djs.find((d) => String(d.id) === String(set.djId))
				if (dj && Array.isArray(dj.generoIds)) {
					dj.generoIds.forEach((gid) => {
						const key = String(gid)
						genreCounts[key] = (genreCounts[key] || 0) + 1
					})
				}
			}
			if (set.dj2Id) {
				const dj2 = djs.find((d) => String(d.id) === String(set.dj2Id))
				if (dj2 && Array.isArray(dj2.generoIds)) {
					dj2.generoIds.forEach((gid) => {
						const key = String(gid)
						genreCounts[key] = (genreCounts[key] || 0) + 1
					})
				}
			}
		})

		let topGenreName = 'Nenhum'
		let maxCount = 0
		Object.entries(genreCounts).forEach(([gid, count]) => {
			if (count > maxCount) {
				maxCount = count
				const genre = generos.find((g) => String(g.id) === String(gid))
				if (genre && genre.nome) {
					topGenreName = genre.nome
				}
			}
		})

		// Fallback: se nenhum set tiver género associado, verificar os géneros com mais DJs do backend
		if (topGenreName === 'Nenhum' && estatisticas?.djs_por_genero && estatisticas.djs_por_genero.length > 0) {
			const sortedByBackend = [...estatisticas.djs_por_genero].sort((a, b) => b.value - a.value)
			if (sortedByBackend[0] && sortedByBackend[0].name) {
				topGenreName = sortedByBackend[0].name
			}
		}

		return {
			totalSets,
			uniqueFestivals,
			uniqueDjs,
			topGenreName,
		}
	}, [sets, djs, generos, estatisticas])

	// Estatísticas de DJs por Género calculadas e ordenadas para visualização premium
	const djsPorGeneroSorted = useMemo(() => {
		if (!estatisticas?.djs_por_genero) return []
		return [...estatisticas.djs_por_genero].sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0) || a.name.localeCompare(b.name, 'pt'))
	}, [estatisticas])

	const totalDjsInGenres = useMemo(() => {
		return djsPorGeneroSorted.reduce((acc, item) => acc + (Number(item.value) || 0), 0)
	}, [djsPorGeneroSorted])

	const maxGenreDjValue = useMemo(() => {
		if (djsPorGeneroSorted.length === 0) return 1
		return Math.max(...djsPorGeneroSorted.map((g) => Number(g.value) || 0), 1)
	}, [djsPorGeneroSorted])

	// Dados otimizados para Donut Chart (Top 6 + Outros agrupados para clareza máxima)
	const donutGenreData = useMemo(() => {
		if (djsPorGeneroSorted.length <= 7) return djsPorGeneroSorted
		const top6 = djsPorGeneroSorted.slice(0, 6)
		const othersCount = djsPorGeneroSorted.slice(6).reduce((acc, item) => acc + (Number(item.value) || 0), 0)
		return [
			...top6,
			{ name: 'Outros Géneros', value: othersCount, isOther: true, countOthers: djsPorGeneroSorted.length - 6 }
		]
	}, [djsPorGeneroSorted])

	const displayedGenreBars = showAllGenreBars ? djsPorGeneroSorted : djsPorGeneroSorted.slice(0, 8)

	const handleSelectGenreByName = (genreName) => {
		if (!genreName || genreName === 'Outros Géneros') return
		const found = generos.find(
			(g) => g.nome?.toLowerCase() === genreName.toLowerCase() || genreName.toLowerCase().includes(g.nome?.toLowerCase())
		)
		if (found) {
			setSelectedGenreId(String(found.id))
			setActiveTab('generos')
		}
	}

	// 1. Linha do Tempo: Evolução de Sets ao Longo dos Anos
	const timelineData = useMemo(() => {
		const yearMap = {}
		sets.forEach((s) => {
			if (!s.data) return
			const ano = s.data.substring(0, 4)
			if (/^\d{4}$/.test(ano)) {
				yearMap[ano] = (yearMap[ano] || 0) + 1
			}
		})
		const sortedYears = Object.keys(yearMap).sort((a, b) => Number(a) - Number(b))
		return sortedYears.map((ano) => ({
			ano,
			sets: yearMap[ano],
		}))
	}, [sets])

	// 2. Termómetro Global de Avaliações & Distribuição de Satisfação
	const ratingOverview = useMemo(() => {
		const ratedSets = sets.filter((s) => s.avaliacao !== null && s.avaliacao !== undefined && s.avaliacao !== '')
		const totalRated = ratedSets.length
		if (totalRated === 0) {
			return {
				avg: '—',
				totalRated: 0,
				gold: { count: 0, percentage: 0 },
				excellent: { count: 0, percentage: 0 },
				regular: { count: 0, percentage: 0 },
			}
		}

		const sum = ratedSets.reduce((acc, s) => acc + Number(s.avaliacao), 0)
		const avg = (sum / totalRated).toFixed(1)

		let goldCount = 0 // 9.0 - 10
		let excellentCount = 0 // 7.5 - 8.9
		let regularCount = 0 // < 7.5

		ratedSets.forEach((s) => {
			const val = Number(s.avaliacao)
			if (val >= 9.0) goldCount++
			else if (val >= 7.5) excellentCount++
			else regularCount++
		})

		return {
			avg,
			totalRated,
			gold: {
				count: goldCount,
				percentage: Math.round((goldCount / totalRated) * 100),
			},
			excellent: {
				count: excellentCount,
				percentage: Math.round((excellentCount / totalRated) * 100),
			},
			regular: {
				count: regularCount,
				percentage: Math.round((regularCount / totalRated) * 100),
			},
		}
	}, [sets])

	// 3. Hall da Fama: Os Melhores Sets de Sempre (Top 10 com maior nota)
	const hallOfFameSets = useMemo(() => {
		return sets
			.filter((s) => s.avaliacao !== null && s.avaliacao !== undefined && s.avaliacao !== '')
			.map((s) => {
				const festival = festivais.find((f) => String(f.id) === String(s.festivalId))
				const dj1 = djs.find((d) => String(d.id) === String(s.djId))
				const dj2 = s.dj2Id ? djs.find((d) => String(d.id) === String(s.dj2Id)) : null
				const djName = dj1 ? (dj2 ? `${dj1.nome} B2B ${dj2.nome}` : dj1.nome) : 'DJ Desconhecido'
				const ano = s.data ? s.data.substring(0, 4) : (s.ano || '')
				const djGenres = dj1
					? generos
							.filter((g) => dj1.generoIds?.includes(g.id))
							.map((g) => g.nome)
							.slice(0, 2)
							.join(' · ')
					: ''

				return {
					...s,
					dj: dj1,
					dj2,
					djName,
					djGenres,
					festivalNome: festival ? festival.nome : (s.especial || 'Set Especial'),
					ano,
					numRating: Number(s.avaliacao),
				}
			})
			.sort((a, b) => b.numRating - a.numRating || (b.data || '').localeCompare(a.data || ''))
			.slice(0, 10)
	}, [sets, festivais, djs, generos])

	// List of DJs sorted by number of sets
	const topDjsList = useMemo(() => {
		const counts = {}
		sets.forEach((s) => {
			if (s.djId) {
				const id = String(s.djId)
				counts[id] = (counts[id] || 0) + 1
			}
			if (s.dj2Id) {
				const id = String(s.dj2Id)
				counts[id] = (counts[id] || 0) + 1
			}
		})

		return djs
			.map((dj) => ({
				...dj,
				count: counts[String(dj.id)] || 0,
			}))
			.filter((dj) => dj.count > 0)
			.sort((a, b) => b.count - a.count || a.nome.localeCompare(b.nome, 'pt'))
	}, [sets, djs])

	const displayedTopDjs = showAllDjs ? topDjsList : topDjsList.slice(0, 10)

	// Sets list for the DJ shown in the modal
	const modalSets = useMemo(() => {
		if (!modalDjData) return []
		return sets
			.filter((s) => String(s.djId) === String(modalDjData.id) || String(s.dj2Id) === String(modalDjData.id))
			.map((s) => {
				const festival = festivais.find((f) => String(f.id) === String(s.festivalId))
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
		const ratedSets = modalSets.filter((s) => s.avaliacao !== null && s.avaliacao !== undefined && s.avaliacao !== '')
		const avg = ratedSets.length > 0
			? (ratedSets.reduce((acc, s) => acc + Number(s.avaliacao), 0) / ratedSets.length).toFixed(1)
			: '—'
		return { count, avg }
	}, [modalSets, modalDjData])

	const getRatingBadge = (rating) => {
		if (rating === null || rating === undefined || rating === '') {
			return <span className="text-slate-500 font-medium">—</span>
		}

		const num = Number(rating)
		if (isNaN(num)) {
			return <span className="text-slate-500 font-medium">—</span>
		}

		let colorClasses = "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
		if (num >= 9.0) {
			colorClasses = "bg-amber-400/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
		} else if (num >= 7.5) {
			colorClasses = "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20"
		} else if (num >= 5.0) {
			colorClasses = "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20"
		}

		return (
			<span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colorClasses}`}>
				{num.toFixed(1)}/10
			</span>
		)
	}

	// Festival frequency data for the bar chart
	const festivalFreqData = useMemo(() => {
		const counts = {}
		sets.forEach((s) => {
			if (s.festivalId) {
				const id = String(s.festivalId)
				counts[id] = (counts[id] || 0) + 1
			}
		})

		return festivais
			.map((f) => ({
				name: f.nome,
				quantidade: counts[String(f.id)] || 0,
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
			if (
				(String(set.djId) === String(selectedDjId) || String(set.dj2Id) === String(selectedDjId)) &&
				set.avaliacao !== null &&
				set.avaliacao !== undefined &&
				set.avaliacao !== ''
			) {
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
			const festival = festivais.find((entry) => String(entry.id) === String(set.festivalId))

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
			const djGenres = generos.filter((g) => dj.generoIds?.some(gid => String(gid) === String(g.id)))
			const avgIntensidade = djGenres.length > 0
				? djGenres.reduce((acc, g) => acc + (Number(g.intensidade) || 5), 0) / djGenres.length
				: 5
			data[0][dj.id] = Number(avgIntensidade.toFixed(1))

			const avgBpm = djGenres.length > 0
				? djGenres.reduce((acc, g) => acc + (Number(g.bpm) || 120), 0) / djGenres.length
				: 120
			const normalizedBpm = Math.min(10, Math.max(0, ((avgBpm - 60) / 140) * 10))
			data[1][dj.id] = Number(normalizedBpm.toFixed(1))

			const djSets = sets.filter((s) => String(s.djId) === String(dj.id) || String(s.dj2Id) === String(dj.id))
			const setsRating = Math.min(10, djSets.length * 2)
			data[2][dj.id] = Number(setsRating.toFixed(1))
		})

		return data
	}, [sets, djs, generos])

	// Obter DJ selecionado
	const selectedDj = useMemo(() => {
		return djs.find((dj) => String(dj.id) === String(selectedDjId))
	}, [djs, selectedDjId])

	const selectedDjColor = useMemo(() => {
		const idx = djs.findIndex((dj) => String(dj.id) === String(selectedDjId))
		return idx !== -1 ? pieColors[idx % pieColors.length] : '#a855f7'
	}, [djs, selectedDjId])

	// Histórico e Rastreio do DJ selecionado
	const djHistoryData = useMemo(() => {
		if (!selectedDjId) return []

		return sets
			.filter((s) => String(s.djId) === String(selectedDjId) || String(s.dj2Id) === String(selectedDjId))
			.map((s) => {
				const festival = festivais.find((f) => String(f.id) === String(s.festivalId))
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
				.filter((g) => dj.generoIds?.some(gid => String(gid) === String(g.id)))
				.map((g) => g.nome)
				.join(' ')
			return (
				dj.nome.toLowerCase().includes(term) ||
				(dj.biografia && dj.biografia.toLowerCase().includes(term)) ||
				djGenres.toLowerCase().includes(term)
			)
		})
	}, [djs, djSearchTerm, generos])

	// Calculations for the selected festival in "Festivais" tab
	const festivalSets = useMemo(() => {
		if (!selectedFestivalId) return []
		return sets.filter((s) => String(s.festivalId) === String(selectedFestivalId))
	}, [sets, selectedFestivalId])

	const festivalBestSets = useMemo(() => {
		if (festivalSets.length === 0) return []
		return [...festivalSets]
			.filter((s) => s.avaliacao !== null && s.avaliacao !== undefined && s.avaliacao !== '')
			.sort((a, b) => {
				const diff = Number(b.avaliacao) - Number(a.avaliacao)
				if (diff !== 0) return diff
				const dateA = new Date(`${a.data || '2000-01-01'}T${a.hora || '00:00'}`)
				const dateB = new Date(`${b.data || '2000-01-01'}T${b.hora || '00:00'}`)
				return dateB - dateA
			})
	}, [festivalSets])

	const festivalKpis = useMemo(() => {
		if (festivalSets.length === 0) return { edicoes: 0, djs: 0, media: '—', bestRating: '—', bestDjName: '—' }
		
		// Unique years / editions attended
		const anos = festivalSets.map((s) => s.data ? s.data.substring(0, 4) : '').filter(Boolean)
		const edicoesCount = new Set(anos).size

		// Unique DJs seen in this festival (including B2B)
		const djIds = festivalSets.flatMap((s) => [s.djId, s.dj2Id]).filter(Boolean).map(String)
		const djsCount = new Set(djIds).size

		// Average rating of sets at this festival
		const ratedSets = festivalSets.filter((s) => s.avaliacao !== null && s.avaliacao !== undefined && s.avaliacao !== '')
		const media = ratedSets.length > 0
			? (ratedSets.reduce((acc, s) => acc + Number(s.avaliacao), 0) / ratedSets.length).toFixed(1)
			: '—'

		const topRatedSet = ratedSets.length > 0
			? [...ratedSets].sort((a, b) => Number(b.avaliacao) - Number(a.avaliacao))[0]
			: null

		const topDj = topRatedSet ? djs.find((d) => String(d.id) === String(topRatedSet.djId)) : null

		return {
			edicoes: edicoesCount,
			djs: djsCount,
			media,
			bestRating: topRatedSet ? Number(topRatedSet.avaliacao) : '—',
			bestDjName: topDj ? topDj.nome : '—',
		}
	}, [festivalSets, djs])

	const festivalTopDjs = useMemo(() => {
		if (festivalSets.length === 0) return []
		const counts = {}
		festivalSets.forEach((s) => {
			if (s.djId) {
				const id = String(s.djId)
				counts[id] = (counts[id] || 0) + 1
			}
			if (s.dj2Id) {
				const id = String(s.dj2Id)
				counts[id] = (counts[id] || 0) + 1
			}
		})
		return Object.entries(counts)
			.map(([djId, count]) => {
				const dj = djs.find((d) => String(d.id) === String(djId))
				return {
					name: dj ? dj.nome : 'Desconhecido',
					quantidade: count,
				}
			})
			.sort((a, b) => b.quantidade - a.quantidade || a.name.localeCompare(b.name, 'pt'))
			.slice(0, 10)
	}, [festivalSets, djs])

	// DJs com múltiplas presenças no festival selecionado (2+ sets)
	const festivalRecurringDjs = useMemo(() => {
		if (festivalSets.length === 0) return []
		
		const djSetMap = new Map()

		festivalSets.forEach((s) => {
			const addDjSet = (djId) => {
				if (!djId) return
				const idStr = String(djId)
				if (!djSetMap.has(idStr)) {
					djSetMap.set(idStr, [])
				}
				djSetMap.get(idStr).push(s)
			}

			addDjSet(s.djId)
			if (s.dj2Id) addDjSet(s.dj2Id)
		})

		const recurring = []
		djSetMap.forEach((setsList, djIdStr) => {
			if (setsList.length >= 2) {
				const djObj = djs.find((d) => String(d.id) === djIdStr)
				if (djObj) {
					const sortedSets = [...setsList].sort((a, b) => {
						const dateA = new Date(`${a.data || '2000-01-01'}T${a.hora || '00:00'}`)
						const dateB = new Date(`${b.data || '2000-01-01'}T${b.hora || '00:00'}`)
						return dateA - dateB
					})

					const ratedSets = sortedSets.filter((s) => s.avaliacao !== null && s.avaliacao !== undefined && s.avaliacao !== '')
					const avg = ratedSets.length > 0
						? (ratedSets.reduce((acc, s) => acc + Number(s.avaliacao), 0) / ratedSets.length).toFixed(1)
						: '—'
					const maxRating = ratedSets.length > 0
						? Math.max(...ratedSets.map((s) => Number(s.avaliacao)))
						: '—'

					recurring.push({
						dj: djObj,
						totalSets: setsList.length,
						ratedCount: ratedSets.length,
						avgRating: avg,
						maxRating,
						sets: sortedSets,
					})
				}
			}
		})

		return recurring.sort((a, b) => b.totalSets - a.totalSets || a.dj.nome.localeCompare(b.dj.nome, 'pt'))
	}, [festivalSets, djs])

	// Sincronizar o DJ recorrente selecionado
	useEffect(() => {
		if (festivalRecurringDjs.length > 0) {
			if (!selectedRecurringDjId || !festivalRecurringDjs.some((item) => String(item.dj.id) === String(selectedRecurringDjId))) {
				setSelectedRecurringDjId(String(festivalRecurringDjs[0].dj.id))
			}
		} else {
			setSelectedRecurringDjId('')
		}
	}, [festivalRecurringDjs, selectedRecurringDjId])

	const activeRecurringDjData = useMemo(() => {
		if (!selectedRecurringDjId) return null
		return festivalRecurringDjs.find((item) => String(item.dj.id) === String(selectedRecurringDjId)) || null
	}, [festivalRecurringDjs, selectedRecurringDjId])

	const activeRecurringDjChartData = useMemo(() => {
		if (!activeRecurringDjData) return []
		return activeRecurringDjData.sets
			.filter((s) => s.avaliacao !== null && s.avaliacao !== undefined && s.avaliacao !== '')
			.map((s) => {
				const ano = s.data ? s.data.substring(0, 4) : 'Edição'
				const formattedDate = s.data ? s.data.split('-').reverse().slice(0, 2).join('/') : ''
				return {
					id: s.id,
					data: s.data,
					ano,
					hora: s.hora || s.horaInicio || '',
					exibicao: s.data ? `${ano} (${formattedDate})` : 'Set',
					avaliacao: Number(s.avaliacao),
					especial: s.especial,
					nomeEspecial: s.nomeEspecial || s.nome_especial || '',
					isB2B: Boolean(s.dj2Id),
				}
			})
	}, [activeRecurringDjData])

	const festivalHistorySets = useMemo(() => {
		if (festivalSets.length === 0) return []
		return [...festivalSets].sort((a, b) => {
			const dateA = new Date(`${a.data || '2000-01-01'}T${a.hora || '00:00'}`)
			const dateB = new Date(`${b.data || '2000-01-01'}T${b.hora || '00:00'}`)
			return dateB - dateA
		})
	}, [festivalSets])

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
									<span className="text-2xl font-black text-slate-900 dark:text-white">
										{loadingEst ? '...' : (estatisticas?.total_sets ?? 0)}
									</span>
								</div>
								<div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-500/20 dark:border-purple-500/30 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(168,85,247,0.1)] shrink-0">
									<Headphones className="w-5 h-5" />
								</div>
							</div>
							{/* Card 2: Festivals */}
							<div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 group">
								<div className="flex flex-col gap-1 min-w-0">
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Festivais / Edições</span>
									<span className="text-2xl font-black text-slate-900 dark:text-white truncate">
										{loadingEst ? '...' : `${estatisticas?.total_festivais ?? 0} / ${estatisticas?.total_edicoes ?? 0}`}
									</span>
								</div>
								<div className="p-3 bg-pink-500/10 text-pink-600 dark:text-pink-400 rounded-xl border border-pink-500/20 dark:border-pink-500/30 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(236,72,153,0.1)] shrink-0">
									<Ticket className="w-5 h-5" />
								</div>
							</div>
							{/* Card 3: DJs */}
							<div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 group">
								<div className="flex flex-col gap-1 min-w-0">
									<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">DJs Registados</span>
									<span className="text-2xl font-black text-slate-900 dark:text-white">
										{loadingEst ? '...' : (estatisticas?.total_djs ?? 0)}
									</span>
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

						{/* Grid Principal Original de duas colunas */}
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

						{/* Bloco DJs por Género (12 colunas) - Redesenhado e Altamente Percetível */}
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
							<div className="lg:col-span-12">
								<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-6">
									
									{/* Cabeçalho do Card com Título e Switcher de Visualização */}
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-4">
										<div className="flex items-center gap-3">
											<div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-xl border border-purple-500/30 text-purple-600 dark:text-purple-400">
												<Flame className="w-5 h-5" />
											</div>
											<div>
												<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
													Distribuição de DJs por Género
												</h2>
												<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
													Contagem e representatividade de cada género musical na coleção de DJs.
												</p>
											</div>
										</div>

										{/* Seletor de Modo: Ranking vs Donut */}
										<div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100/80 dark:bg-white/5 p-1 rounded-xl border border-slate-200/60 dark:border-white/10">
											<button
												type="button"
												onClick={() => setGenreChartMode('ranking')}
												className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
													genreChartMode === 'ranking'
														? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm'
														: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
												}`}
											>
												<BarChart2 className="w-3.5 h-3.5" />
												<span>Ranking</span>
											</button>
											<button
												type="button"
												onClick={() => setGenreChartMode('donut')}
												className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
													genreChartMode === 'donut'
														? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm'
														: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
												}`}
											>
												<LucidePieChart className="w-3.5 h-3.5" />
												<span>Donut Interativo</span>
											</button>
										</div>
									</div>

									{/* Conteúdo Principal do Gráfico */}
									{djsPorGeneroSorted.length > 0 ? (
										genreChartMode === 'ranking' ? (
											/* ── MODO 1: RANKING POR BARRAS HORIZONTAIS ── */
											<div className="flex flex-col gap-5">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5">
													{displayedGenreBars.map((genre, idx) => {
														const count = Number(genre.value) || 0
														const percentage = totalDjsInGenres > 0 ? ((count / totalDjsInGenres) * 100).toFixed(1) : '0.0'
														const widthPercent = Math.max(6, Math.round((count / maxGenreDjValue) * 100))
														const color = pieColors[idx % pieColors.length]
														const isTop3 = idx < 3

														return (
															<div
																key={genre.name}
																onClick={() => handleSelectGenreByName(genre.name)}
																className="group flex flex-col gap-1.5 p-2.5 rounded-xl hover:bg-slate-100/60 dark:hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-slate-200/50 dark:hover:border-white/5"
																title={`Clica para explorar ${genre.name} na aba de Géneros`}
															>
																{/* Linha do Nome e Valores */}
																<div className="flex items-center justify-between text-xs">
																	<div className="flex items-center gap-2 min-w-0">
																		<span
																			className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${
																				idx === 0
																					? 'bg-amber-400/20 text-amber-600 dark:text-amber-300 border border-amber-400/40'
																					: idx === 1
																					? 'bg-slate-300/30 text-slate-700 dark:text-slate-300 border border-slate-400/40'
																					: idx === 2
																					? 'bg-amber-600/20 text-amber-700 dark:text-amber-400 border border-amber-600/40'
																					: 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400'
																			}`}
																		>
																			{idx + 1}
																		</span>
																		<span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
																			{genre.name}
																		</span>
																	</div>
																	<div className="flex items-center gap-2 shrink-0 ml-2">
																		<span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px]">
																			{percentage}%
																		</span>
																		<span
																			className="font-bold text-xs px-2.5 py-0.5 rounded-md border"
																			style={{
																				backgroundColor: `${color}15`,
																				borderColor: `${color}35`,
																				color: color,
																			}}
																		>
																			{count} {count === 1 ? 'DJ' : 'DJs'}
																		</span>
																	</div>
																</div>

																{/* Barra de Progresso Estilizada */}
																<div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
																	<div
																		className="h-full rounded-full transition-all duration-500 ease-out group-hover:brightness-110"
																		style={{
																			width: `${widthPercent}%`,
																			backgroundColor: color,
																			boxShadow: isTop3 ? `0 0 8px ${color}55` : 'none',
																		}}
																	/>
																</div>
															</div>
														)
													})}
												</div>

												{/* Botão para Expandir Todos os Géneros se houver mais de 8 */}
												{djsPorGeneroSorted.length > 8 && (
													<div className="flex justify-center pt-2">
														<button
															type="button"
															onClick={() => setShowAllGenreBars(!showAllGenreBars)}
															className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-all cursor-pointer"
														>
															<span>
																{showAllGenreBars
																	? 'Mostrar menos'
																	: `Ver todos os ${djsPorGeneroSorted.length} géneros (${djsPorGeneroSorted.length - 8} adicionais)`}
															</span>
															{showAllGenreBars ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
														</button>
													</div>
												)}
											</div>
										) : (
											/* ── MODO 2: DONUT CHART MODERNO (TOP 6 + OUTROS AGRUPADOS) ── */
											<div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
												{/* Donut Chart com Centro Informativo */}
												<div className="md:col-span-5 relative flex items-center justify-center h-[260px]">
													<ResponsiveContainer width="100%" height="100%">
														<PieChart>
															<Pie
																data={donutGenreData}
																cx="50%"
																cy="50%"
																innerRadius={70}
																outerRadius={100}
																paddingAngle={3}
																cornerRadius={5}
																dataKey="value"
																onMouseEnter={(_, index) => setHoveredDonutGenre(donutGenreData[index])}
																onMouseLeave={() => setHoveredDonutGenre(null)}
															>
																{donutGenreData.map((entry, index) => {
																	const color = entry.isOther ? (darkMode ? '#64748b' : '#94a3b8') : pieColors[index % pieColors.length]
																	return (
																		<Cell
																			key={`cell-${index}`}
																			fill={color}
																			stroke={darkMode ? '#0f172a' : '#ffffff'}
																			strokeWidth={2}
																			style={{
																				outline: 'none',
																				filter: hoveredDonutGenre?.name === entry.name ? 'brightness(1.2) drop-shadow(0 0 6px rgba(168,85,247,0.4))' : 'none',
																				cursor: entry.isOther ? 'default' : 'pointer',
																			}}
																		/>
																	)
																})}
															</Pie>
															<Tooltip
																contentStyle={{
																	backgroundColor: darkMode ? '#0f172a' : '#ffffff',
																	borderColor: darkMode ? '#334155' : '#e2e8f0',
																	borderRadius: '12px',
																	color: darkMode ? '#fff' : '#0f172a',
																	fontSize: '11px',
																	boxShadow: darkMode ? '0 10px 25px -5px rgba(0, 0, 0, 0.3)' : '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
																}}
																formatter={(value, name) => [
																	`${value} DJs (${((value / (totalDjsInGenres || 1)) * 100).toFixed(1)}%)`,
																	name,
																]}
															/>
														</PieChart>
													</ResponsiveContainer>

													{/* Texto Flutuante no Centro do Donut */}
													<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
														<span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate max-w-[120px]">
															{hoveredDonutGenre ? hoveredDonutGenre.name : 'Total Registado'}
														</span>
														<span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
															{hoveredDonutGenre ? hoveredDonutGenre.value : totalDjsInGenres}
														</span>
														<span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
															{hoveredDonutGenre
																? `${((hoveredDonutGenre.value / (totalDjsInGenres || 1)) * 100).toFixed(1)}%`
																: `${djsPorGeneroSorted.length} Géneros`}
														</span>
													</div>
												</div>

												{/* Legenda Lateral Interativa */}
												<div className="md:col-span-7 flex flex-col gap-2">
													<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
														{donutGenreData.map((item, idx) => {
															const count = Number(item.value) || 0
															const percentage = totalDjsInGenres > 0 ? ((count / totalDjsInGenres) * 100).toFixed(1) : '0.0'
															const color = item.isOther ? (darkMode ? '#64748b' : '#94a3b8') : pieColors[idx % pieColors.length]
															const isHovered = hoveredDonutGenre?.name === item.name

															return (
																<div
																	key={item.name}
																	onMouseEnter={() => setHoveredDonutGenre(item)}
																	onMouseLeave={() => setHoveredDonutGenre(null)}
																	onClick={() => !item.isOther && handleSelectGenreByName(item.name)}
																	className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
																		isHovered
																			? 'bg-purple-500/10 border-purple-500/40 shadow-sm'
																			: 'bg-slate-100/40 dark:bg-white/5 border-transparent hover:border-slate-200 dark:hover:border-white/10'
																	} ${item.isOther ? 'cursor-default' : 'cursor-pointer'}`}
																>
																	<div className="flex items-center gap-2.5 min-w-0">
																		<span
																			className="h-3 w-3 rounded-full shrink-0 shadow-sm"
																			style={{ backgroundColor: color }}
																		/>
																		<span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
																			{item.name}
																			{item.isOther && (
																				<span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 block">
																					({item.countOthers} estilos restantes)
																				</span>
																			)}
																		</span>
																	</div>
																	<div className="flex items-center gap-1.5 shrink-0 ml-2 text-right">
																		<span className="text-xs font-black text-slate-900 dark:text-white">
																			{count}
																		</span>
																		<span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
																			({percentage}%)
																		</span>
																	</div>
																</div>
															)
														})}
													</div>
												</div>
											</div>
										)
									) : (
										<div className="flex flex-col items-center justify-center py-12 text-center gap-2 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-100/50 dark:bg-slate-950/20">
											<Info className="w-8 h-8 text-slate-400 dark:text-slate-500" />
											<p className="text-sm text-slate-700 dark:text-slate-400 font-medium">Sem dados de géneros registados</p>
											<p className="text-xs text-slate-500 max-w-xs">
												Adiciona géneros musicais aos DJs para ver a distribuição visual.
											</p>
										</div>
									)}
								</section>
							</div>
						</div>

						{/* ── Novas Estatísticas no Fundo da Página ── */}

						{/* Fila 4: Hall da Fama (12 colunas com Scroll Horizontal de Cards Interativos) */}
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
							<div className="lg:col-span-12">
								<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 md:p-7 shadow-xl flex flex-col gap-5">
									{/* Header com Título e Botões de Scroll */}
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-white/5 pb-4">
										<div className="flex items-center gap-3">
											<div className="p-2.5 bg-gradient-to-br from-amber-500/20 via-purple-500/20 to-cyan-500/20 rounded-xl border border-amber-500/30 text-amber-500">
												<Crown className="w-5 h-5" />
											</div>
											<div>
												<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
													Hall da Fama: Melhores Sets
													<span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
														Top {hallOfFameSets.length}
													</span>
												</h2>
												<p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
													As atuações com as pontuações mais altas da tua história (desliza para ver todos os sets).
												</p>
											</div>
										</div>

										{/* Botões de Navegação Horizontal */}
										{hallOfFameSets.length > 0 && (
											<div className="flex items-center gap-2 self-end sm:self-auto">
												<button
													type="button"
													onClick={() => scrollHallOfFame('left')}
													className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10 transition-all cursor-pointer shadow-sm active:scale-95"
													title="Rolar para a esquerda"
												>
													<ChevronLeft className="w-4 h-4" />
												</button>
												<button
													type="button"
													onClick={() => scrollHallOfFame('right')}
													className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-white/10 transition-all cursor-pointer shadow-sm active:scale-95"
													title="Rolar para a direita"
												>
													<ChevronRight className="w-4 h-4" />
												</button>
											</div>
										)}
									</div>

									{/* Scroll Horizontal de Cards */}
									{hallOfFameSets.length > 0 ? (
										<div
											ref={hallOfFameScrollRef}
											className="flex gap-4 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scroll-smooth scrollbar-thin scrollbar-thumb-purple-500/20 hover:scrollbar-thumb-purple-500/40"
										>
											{hallOfFameSets.map((set, idx) => {
												const mainDj = set.dj || (set.djId ? djs.find((d) => String(d.id) === String(set.djId)) : null)
												const formattedDate = set.data ? set.data.split('-').reverse().join('/') : ''
												const isFirst = idx === 0
												const isSecond = idx === 1
												const isThird = idx === 2

												return (
													<div
														key={set.id}
														onClick={() => {
															if (mainDj) {
																setModalDjData(mainDj)
																setIsModalOpen(true)
															}
														}}
														className={`w-[290px] sm:w-[320px] shrink-0 snap-start rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden ${
															isFirst
																? 'bg-gradient-to-b from-amber-500/10 via-white/70 to-white/90 dark:from-amber-500/15 dark:via-slate-900/80 dark:to-slate-900/90 border-amber-500/30 hover:border-amber-400 hover:shadow-amber-500/10 shadow-lg'
																: isSecond
																? 'bg-gradient-to-b from-slate-400/10 via-white/70 to-white/90 dark:from-slate-400/15 dark:via-slate-900/80 dark:to-slate-900/90 border-slate-300 dark:border-slate-700 hover:border-slate-400 shadow-md'
																: isThird
																? 'bg-gradient-to-b from-amber-700/10 via-white/70 to-white/90 dark:from-amber-700/15 dark:via-slate-900/80 dark:to-slate-900/90 border-amber-700/30 hover:border-amber-600 shadow-md'
																: 'bg-white/60 dark:bg-slate-900/60 border-slate-200/70 dark:border-white/5 hover:border-purple-500/40 shadow-sm'
														} hover:-translate-y-1.5 hover:shadow-xl`}
													>
														{/* Linha de Topo: Rank Badge & Rating Badge */}
														<div className="flex items-center justify-between gap-2 mb-4">
															<div className="flex items-center gap-1.5">
																<span
																	className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black shadow-sm ${
																		isFirst
																			? 'bg-amber-400 text-amber-950 ring-1 ring-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
																			: isSecond
																			? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 ring-1 ring-slate-400/40'
																			: isThird
																			? 'bg-amber-700/30 text-amber-700 dark:text-amber-300 ring-1 ring-amber-600/40'
																			: 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300'
																	}`}
																>
																	{isFirst && <Crown className="w-3.5 h-3.5 fill-amber-950/30" />}
																	<span>#{idx + 1}</span>
																</span>
																<span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
																	{isFirst ? 'Melhor Set' : isSecond ? '2º Lugar' : isThird ? '3º Lugar' : 'Top Set'}
																</span>
															</div>

															<div className="shrink-0">
																{getRatingBadge(set.avaliacao)}
															</div>
														</div>

														{/* Bloco Central: DJ Info com Avatar */}
														<div className="flex items-center gap-3.5 my-1">
															<div className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-md ${
																isFirst
																	? 'ring-2 ring-amber-400 bg-gradient-to-br from-amber-400/30 to-purple-500/30'
																	: 'ring-1 ring-slate-200 dark:ring-white/10 bg-gradient-to-br from-purple-500/20 to-cyan-400/20'
															} text-sm font-black text-slate-800 dark:text-white`}>
																{getDjAvatar(mainDj)}
															</div>
															<div className="min-w-0 flex-1">
																<h3 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
																	{set.djName}
																</h3>
																{set.djGenres ? (
																	<p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium truncate mt-0.5">
																		{set.djGenres}
																	</p>
																) : (
																	<p className="text-[11px] text-slate-400 truncate mt-0.5">
																		DJ Dex
																	</p>
																)}
															</div>
														</div>

														{/* Bloco Inferior: Detalhes do Set & Festival */}
														<div className="mt-4 pt-3.5 border-t border-slate-200/60 dark:border-white/5 flex flex-col gap-1.5">
															<div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 min-w-0">
																<Ticket className="w-3.5 h-3.5 text-pink-500 shrink-0" />
																<span className="truncate">{set.festivalNome}</span>
															</div>
															<div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
																<span className="flex items-center gap-1.5">
																	<Calendar className="w-3 h-3 text-cyan-500 shrink-0" />
																	{formattedDate || `Ano de ${set.ano}`}
																</span>
																<span className="font-semibold text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform">
																	Ver DJ →
																</span>
															</div>
														</div>
													</div>
												)
											})}
										</div>
									) : (
										<div className="flex flex-col items-center justify-center py-10 text-center gap-2 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-100/50 dark:bg-slate-950/20">
											<Award className="w-8 h-8 text-slate-400 dark:text-slate-500" />
											<p className="text-xs text-slate-500">Adiciona avaliações aos teus sets para ver o Hall da Fama.</p>
										</div>
									)}
								</section>
							</div>
						</div>

						{/* Fila 5: Média Global & Satisfação + Evolução Temporal */}
						<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
							
							{/* Termómetro Global de Avaliações (5 colunas) */}
							<div className="lg:col-span-5 flex flex-col gap-6">
								<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-5 h-full">
									<div>
										<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
											<Star className="text-amber-500 dark:text-amber-400 w-5 h-5 fill-amber-400/20" />
											Média Global &amp; Satisfação
										</h2>
										<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
											Desempenho qualitativo e distribuição de notas dos sets assistidos.
										</p>
									</div>

									{/* Card de Destaque da Nota Geral */}
									<div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border border-amber-500/20">
										<div className="flex flex-col">
											<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
												Nota Média Geral
											</span>
											<div className="flex items-baseline gap-1.5 mt-0.5">
												<span className="text-3xl font-black text-amber-500 dark:text-amber-400">
													{ratingOverview.avg}
												</span>
												<span className="text-xs font-semibold text-slate-400">/ 10</span>
											</div>
										</div>
										<div className="text-right">
											<span className="text-xs font-bold text-slate-700 dark:text-slate-300">
												{ratingOverview.totalRated} {ratingOverview.totalRated === 1 ? 'set avaliado' : 'sets avaliados'}
											</span>
											<p className="text-[10px] text-slate-500 dark:text-slate-400">na tua coleção</p>
										</div>
									</div>

									{/* Patamares de Satisfação */}
									<div className="flex flex-col gap-3.5">
										{/* Sets de Ouro */}
										<div className="flex flex-col gap-1.5">
											<div className="flex items-center justify-between text-xs">
												<span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
													<span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
													Sets de Ouro (9.0 - 10)
												</span>
												<span className="font-bold text-amber-600 dark:text-amber-400">
													{ratingOverview.gold.count} ({ratingOverview.gold.percentage}%)
												</span>
											</div>
											<div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
												<div
													className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
													style={{ width: `${ratingOverview.gold.percentage}%` }}
												/>
											</div>
										</div>

										{/* Sets Excelentes */}
										<div className="flex flex-col gap-1.5">
											<div className="flex items-center justify-between text-xs">
												<span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
													<span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
													Sets Muito Bons (7.5 - 8.9)
												</span>
												<span className="font-bold text-cyan-600 dark:text-cyan-400">
													{ratingOverview.excellent.count} ({ratingOverview.excellent.percentage}%)
												</span>
											</div>
											<div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
												<div
													className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-500"
													style={{ width: `${ratingOverview.excellent.percentage}%` }}
												/>
											</div>
										</div>

										{/* Sets Regulares */}
										<div className="flex flex-col gap-1.5">
											<div className="flex items-center justify-between text-xs">
												<span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
													<span className="h-2 w-2 rounded-full bg-purple-400" />
													Sets Regulares (&lt; 7.5)
												</span>
												<span className="font-bold text-purple-600 dark:text-purple-400">
													{ratingOverview.regular.count} ({ratingOverview.regular.percentage}%)
												</span>
											</div>
											<div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden">
												<div
													className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-300 transition-all duration-500"
													style={{ width: `${ratingOverview.regular.percentage}%` }}
												/>
											</div>
										</div>
									</div>
								</section>
							</div>

							{/* Evolução de Sets por Ano (7 colunas) */}
							<div className="lg:col-span-7 flex flex-col gap-6">
								<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-6 h-full">
									<div>
										<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
											<TrendingUp className="text-cyan-500 dark:text-cyan-400 w-5 h-5" />
											Evolução de Sets por Ano
										</h2>
										<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
											Crescimento do número de atuações assistidas ao longo dos anos.
										</p>
									</div>

									{timelineData.length > 0 ? (
										<div style={{ width: '100%', height: '300px' }}>
											<ResponsiveContainer width="100%" height="100%">
												<AreaChart data={timelineData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
													<defs>
														<linearGradient id="timelineAreaGradient" x1="0" y1="0" x2="0" y2="1">
															<stop offset="0%" stopColor="#06b6d4" stopOpacity={0.5} />
															<stop offset="100%" stopColor="#a855f7" stopOpacity={0.02} />
														</linearGradient>
													</defs>
													<CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#cbd5e1'} opacity={darkMode ? 0.2 : 0.4} vertical={false} />
													<XAxis dataKey="ano" tick={{ fill: darkMode ? '#cbd5e1' : '#475569', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
													<YAxis allowDecimals={false} tick={{ fill: darkMode ? '#cbd5e1' : '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
													<Tooltip
														contentStyle={{
															backgroundColor: darkMode ? '#0f172a' : '#ffffff',
															borderColor: darkMode ? '#334155' : '#e2e8f0',
															borderRadius: '12px',
															color: darkMode ? '#fff' : '#0f172a',
															fontSize: '11px',
															boxShadow: darkMode ? '0 10px 25px -5px rgba(0, 0, 0, 0.3)' : '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
														}}
														formatter={(value) => [`${value} ${value === 1 ? 'set assistido' : 'sets assistidos'}`, 'Atividade']}
														labelFormatter={(label) => `Ano de ${label}`}
													/>
													<Area
														type="monotone"
														dataKey="sets"
														name="Sets"
														stroke="#06b6d4"
														strokeWidth={3}
														fill="url(#timelineAreaGradient)"
														dot={{ fill: '#06b6d4', stroke: darkMode ? '#0f172a' : '#ffffff', strokeWidth: 2, r: 5 }}
														activeDot={{ r: 7, stroke: '#a855f7', strokeWidth: 2 }}
													/>
												</AreaChart>
											</ResponsiveContainer>
										</div>
									) : (
										<div className="flex flex-col items-center justify-center py-12 text-center gap-2 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-100/50 dark:bg-slate-950/20 flex-1">
											<Calendar className="w-8 h-8 text-slate-400 dark:text-slate-500" />
											<p className="text-xs text-slate-500">Adiciona datas aos teus sets para ver a evolução temporal.</p>
										</div>
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
					<div className="flex flex-col gap-6 animate-fadeIn">
						
						{/* Seletor de Festival Estilo Adicionar Set */}
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 dark:bg-slate-900/20 backdrop-blur-md border border-slate-200/60 dark:border-white/5 p-4 rounded-2xl shadow-lg relative z-30">
							<div className="flex items-center gap-3">
								<div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-600 dark:text-purple-400 shrink-0">
									<Calendar className="w-5 h-5" />
								</div>
								<div>
									<h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Selecionar Festival</h2>
									<p className="text-xs text-slate-500 dark:text-slate-400">Escolhe um festival para visualizar o histórico de atuações e métricas.</p>
								</div>
							</div>

							<div className="relative" ref={festivalDropdownRef}>
								<button
									type="button"
									onClick={() => {
										setIsFestivalDropdownOpen((prev) => !prev)
										setFestivalSearchTerm('')
									}}
									className="w-full sm:w-[320px] rounded-xl border border-slate-200 bg-white/80 dark:bg-slate-900/60 p-2.5 px-3.5 text-sm text-slate-900 dark:text-white dark:border-slate-800 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all cursor-pointer font-semibold shadow-sm flex items-center justify-between gap-3 hover:border-purple-500/40 dark:hover:border-purple-400/40 group"
								>
									<div className="flex items-center gap-2.5 min-w-0">
										<div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500/25 to-cyan-400/25 text-xs font-bold text-slate-700 ring-1 ring-white/20 dark:text-white">
											{getFestivalAvatar(selectedFestival)}
										</div>
										<div className="min-w-0 text-left">
											<p className="truncate text-xs font-bold text-slate-900 dark:text-white">
												{selectedFestival ? selectedFestival.nome : 'Seleciona um festival...'}
											</p>
											<p className="truncate text-[10px] font-normal text-slate-500 dark:text-slate-400">
												{selectedFestival ? `${selectedFestivalInfo.local} · ${selectedFestivalInfo.ano}` : 'Clica para escolher'}
											</p>
										</div>
									</div>
									<ChevronDown className={`h-4 w-4 shrink-0 text-purple-500 transition-transform duration-200 ${isFestivalDropdownOpen ? 'rotate-180' : ''}`} />
								</button>

								{/* Dropdown Menu com visual de Adicionar Set */}
								{isFestivalDropdownOpen && (
									<div className="absolute right-0 top-full mt-2 w-full sm:w-[360px] rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-2xl backdrop-blur-xl animate-fadeIn dark:border-white/10 dark:bg-slate-950/95 z-50">
										{/* Barra de Pesquisa */}
										<div className="relative mb-2.5">
											<Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cyan-500 dark:text-cyan-400" />
											<input
												type="text"
												autoFocus
												value={festivalSearchTerm}
												onChange={(e) => setFestivalSearchTerm(e.target.value)}
												placeholder="Pesquisar festival por nome, cidade ou ano..."
												className="w-full rounded-xl border border-cyan-400/20 bg-slate-100/60 py-2 pl-9 pr-8 text-xs text-slate-900 shadow-[0_0_0_1px_rgba(34,211,238,0.08)] transition-all placeholder:text-slate-400 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
											/>
											{festivalSearchTerm && (
												<button
													type="button"
													onClick={() => setFestivalSearchTerm('')}
													className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
												>
													<X className="h-3.5 w-3.5" />
												</button>
											)}
										</div>

										{/* Lista com Scroll */}
										<div className="flex max-h-[300px] flex-col gap-1.5 overflow-y-auto pr-1">
											{filteredFestivais.length > 0 ? (
												filteredFestivais.map((fest) => {
													const isSelected = String(fest.id) === String(selectedFestivalId)
													const festInfo = getFestivalLocalAndYear(fest)

													return (
														<button
															key={fest.id}
															type="button"
															onClick={() => {
																setSelectedFestivalId(String(fest.id))
																setIsFestivalDropdownOpen(false)
																setFestivalSearchTerm('')
															}}
															className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border p-2 text-left transition-all duration-100 transition-transform active:scale-[0.98] ${
																isSelected
																	? 'border-purple-500/40 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.12)] text-slate-900 dark:text-white'
																	: 'border-transparent bg-slate-100/40 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:border-purple-500/30 hover:bg-purple-500/5 dark:hover:bg-purple-500/10'
															}`}
														>
															<div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500/25 to-cyan-400/25 text-xs font-bold text-slate-700 ring-1 ring-white/20 dark:text-white">
																{getFestivalAvatar(fest)}
															</div>
															<div className="min-w-0 flex-1">
																<div className="flex items-center justify-between gap-2">
																	<p className="truncate text-xs font-bold text-slate-900 dark:text-white">{fest.nome}</p>
																	{isSelected && (
																		<span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400 whitespace-nowrap">
																			Selecionado
																		</span>
																	)}
																</div>
																<p className="mt-0.5 truncate text-[10px] leading-4 text-slate-500 dark:text-slate-400">
																	{festInfo.local} · {festInfo.ano}
																</p>
															</div>
														</button>
													)
												})
											) : (
												<div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
													Nenhum festival encontrado para a pesquisa.
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						</div>

						{selectedFestivalId ? (
							<>
								{/* KPIs rápidos do Festival (4 Cards) */}
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
									{/* KPI 1: Edições Assistidas */}
									<div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 group">
										<div className="flex flex-col gap-1 min-w-0">
											<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Edições Assistidas</span>
											<span className="text-2xl font-black text-slate-900 dark:text-white">{festivalKpis.edicoes}</span>
										</div>
										<div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-500/20 dark:border-purple-500/30 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(168,85,247,0.1)] shrink-0">
											<Ticket className="w-5 h-5" />
										</div>
									</div>

									{/* KPI 2: DJs Vistos */}
									<div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 group">
										<div className="flex flex-col gap-1 min-w-0">
											<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">DJs Vistos</span>
											<span className="text-2xl font-black text-slate-900 dark:text-white">{festivalKpis.djs}</span>
										</div>
										<div className="p-3 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-xl border border-cyan-500/20 dark:border-cyan-500/30 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(6,182,212,0.1)] shrink-0">
											<Headphones className="w-5 h-5" />
										</div>
									</div>

									{/* KPI 3: Nota Média */}
									<div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 group">
										<div className="flex flex-col gap-1 min-w-0">
											<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Nota Média</span>
											<span className="text-2xl font-black text-purple-600 dark:text-purple-400">{festivalKpis.media}</span>
										</div>
										<div className="p-3 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 rounded-xl border border-fuchsia-500/20 dark:border-fuchsia-500/30 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(217,70,239,0.1)] shrink-0">
											<Flame className="w-5 h-5" />
										</div>
									</div>

									{/* KPI 4: Melhor Set */}
									<div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 group">
										<div className="flex flex-col gap-1 min-w-0">
											<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Melhor Set</span>
											<div className="flex items-baseline gap-1.5">
												<span className="text-2xl font-black text-amber-500 dark:text-amber-400">{festivalKpis.bestRating}</span>
												{festivalKpis.bestDjName !== '—' && (
													<span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[90px] sm:max-w-[120px]">
														· {festivalKpis.bestDjName}
													</span>
												)}
											</div>
										</div>
										<div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20 dark:border-amber-500/30 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(245,158,11,0.1)] shrink-0">
											<Trophy className="w-5 h-5" />
										</div>
									</div>
								</div>

								{/* Linha 1 do Grid: Top DJs e Melhores Sets */}
								<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
									
									{/* Coluna Esquerda: Top DJs no Festival (5 colunas) */}
									<div className="lg:col-span-5 flex flex-col gap-6">
										<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-6 h-full">
											<div>
												<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
													<BarChart2 className="text-cyan-500 dark:text-cyan-400 w-5 h-5" />
													Top DJs no Festival
												</h2>
												<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
													Quantidade de sets que cada DJ tocou neste festival.
												</p>
											</div>

											{festivalTopDjs.length > 0 ? (
												<div style={{ width: '100%', height: '300px' }}>
													<ResponsiveContainer width="100%" height="100%">
														<BarChart data={festivalTopDjs} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
															<defs>
																<linearGradient id="cyanToNeonBlue" x1="0" y1="0" x2="1" y2="0">
																	<stop offset="0%" stopColor="#06b6d4" stopOpacity={0.8} />
																	<stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
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
															<Bar dataKey="quantidade" name="Sets" fill="url(#cyanToNeonBlue)" radius={[0, 4, 4, 0]} barSize={16} />
														</BarChart>
													</ResponsiveContainer>
												</div>
											) : (
												<div className="flex flex-col items-center justify-center py-12 text-center gap-2 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-100/50 dark:bg-slate-950/20 flex-1">
													<Info className="w-8 h-8 text-slate-400 dark:text-slate-500" />
													<p className="text-sm text-slate-700 dark:text-slate-400 font-medium">Nenhum set registado</p>
													<p className="text-xs text-slate-500 max-w-xs">
														Não existem sets de DJs registados para este festival.
													</p>
												</div>
											)}
										</section>
									</div>

									{/* Coluna Direita: Melhores Sets do Festival (7 colunas) */}
									<div className="lg:col-span-7 flex flex-col gap-6">
										<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-4 h-full">
											<div className="flex items-center justify-between">
												<div>
													<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
														<Trophy className="text-amber-500 dark:text-amber-400 w-5 h-5" />
														Melhores Sets do Festival
													</h2>
													<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
														Atuações com as avaliações mais elevadas registadas neste festival.
													</p>
												</div>
												{festivalBestSets.length > 0 && (
													<span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl shrink-0">
														{festivalBestSets.length} {festivalBestSets.length === 1 ? 'set avaliado' : 'sets avaliados'}
													</span>
												)}
											</div>

											{festivalBestSets.length > 0 ? (
												<div className="flex flex-col gap-2.5 max-h-[330px] overflow-y-auto pr-1">
													{festivalBestSets.slice(0, 8).map((set, index) => {
														const dj = djs.find((d) => String(d.id) === String(set.djId))
														const dj2 = set.dj2Id ? djs.find((d) => String(d.id) === String(set.dj2Id)) : null
														const djName = dj ? (dj2 ? `${dj.nome} B2B ${dj2.nome}` : dj.nome) : 'Desconhecido'
														const ano = set.data ? set.data.substring(0, 4) : ''
														const formattedDate = set.data ? set.data.split('-').reverse().join('/') : ''

														// Estilos de medalha/posição
														const medalClasses = index === 0
															? 'bg-amber-400/20 text-amber-500 border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/30'
															: index === 1
																? 'bg-cyan-400/20 text-cyan-400 border-cyan-400/40 ring-1 ring-cyan-400/20'
																: index === 2
																	? 'bg-purple-400/20 text-purple-400 border-purple-400/40 ring-1 ring-purple-400/20'
																	: 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10'

														return (
															<div
																key={set.id}
																onClick={() => {
																	if (dj) {
																		setModalDjData(dj)
																		setIsModalOpen(true)
																	}
																}}
																className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.03] hover:bg-purple-500/5 dark:hover:bg-purple-500/10 hover:border-purple-500/30 transition-all cursor-pointer group"
															>
																<div className="flex items-center gap-3 min-w-0">
																	{/* Medalha / Posição */}
																	<div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-black ${medalClasses}`}>
																		{index + 1}
																	</div>

																	{/* Avatar */}
																	<div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500/25 to-cyan-400/25 text-xs font-bold text-slate-700 ring-1 ring-slate-200 dark:ring-white/20 dark:text-white">
																		{getDjAvatar(dj)}
																	</div>

																	{/* Info */}
																	<div className="min-w-0">
																		<div className="flex items-center gap-2 flex-wrap">
																			<p className="truncate text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
																				{djName}
																			</p>
																			{set.especial && (
																				<span className="rounded-md bg-purple-500/15 px-1.5 py-0.5 text-[9px] font-bold text-purple-600 dark:text-purple-400 border border-purple-500/20 truncate">
																					{set.nomeEspecial || set.nome_especial || 'Especial'}
																				</span>
																			)}
																		</div>
																		<p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
																			{ano ? `Edição de ${ano}` : ''} {formattedDate ? `· ${formattedDate}` : ''} {set.hora ? `às ${set.hora}` : ''}
																		</p>
																	</div>
																</div>

																{/* Badge de Avaliação */}
																<div className="flex items-center gap-1.5 shrink-0">
																	{getRatingBadge(set.avaliacao)}
																</div>
															</div>
														)
													})}
												</div>
											) : (
												<div className="flex flex-col items-center justify-center py-12 text-center gap-2 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-100/50 dark:bg-slate-950/20 flex-1">
													<Trophy className="w-8 h-8 text-slate-400 dark:text-slate-500" />
													<p className="text-sm text-slate-700 dark:text-slate-400 font-medium">Nenhum set avaliado</p>
													<p className="text-xs text-slate-500 max-w-xs">
														Atribui notas aos sets deste festival para gerar o ranking dos melhores momentos.
													</p>
												</div>
											)}
										</section>
									</div>

								</div>

								{/* Linha 2 do Grid: Evolução de Avaliação por DJ no Festival */}
								<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-6 animate-fadeIn">
									<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
										<div>
											<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
												<TrendingUp className="text-purple-500 dark:text-purple-400 w-5 h-5" />
												Evolução de Avaliação por DJ no Festival
											</h2>
											<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
												Acompanha a consistência e a evolução das notas dos artistas que já atuaram em 2 ou mais edições deste festival.
											</p>
										</div>

										{festivalRecurringDjs.length > 0 && (
											<span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl self-start sm:self-auto shrink-0 flex items-center gap-1.5">
												<Users className="w-3.5 h-3.5" />
												{festivalRecurringDjs.length} {festivalRecurringDjs.length === 1 ? 'DJ com 2+ sets' : 'DJs com 2+ sets'}
											</span>
										)}
									</div>

									{festivalRecurringDjs.length > 0 ? (
										<div className="flex flex-col gap-5">
											{/* Seletor horizontal de DJs recorrentes */}
											<div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
												{festivalRecurringDjs.map((item) => {
													const isSelected = String(item.dj.id) === String(selectedRecurringDjId)

													return (
														<button
															key={item.dj.id}
															type="button"
															onClick={() => setSelectedRecurringDjId(String(item.dj.id))}
															className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all shrink-0 cursor-pointer ${
																isSelected
																	? 'border-purple-500/50 bg-purple-500/15 text-purple-600 dark:text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/30'
																	: 'border-slate-200/60 dark:border-white/5 bg-slate-100/60 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:border-purple-500/30 hover:bg-purple-500/5'
															}`}
														>
															<div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500/25 to-cyan-400/25 text-[10px] font-bold text-slate-700 ring-1 ring-white/20 dark:text-white">
																{getDjAvatar(item.dj)}
															</div>
															<span>{item.dj.nome}</span>
															<span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
																isSelected
																	? 'bg-purple-500/25 text-purple-700 dark:text-purple-200'
																	: 'bg-slate-200/80 dark:bg-white/10 text-slate-500 dark:text-slate-400'
															}`}>
																{item.totalSets} sets
															</span>
														</button>
													)
												})}
											</div>

											{/* Análise e Gráfico do DJ selecionado */}
											{activeRecurringDjData && (
												<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-2xl p-5">
													
													{/* Mini KPIs do DJ no Festival (4 colunas) */}
													<div className="lg:col-span-4 flex flex-col justify-between gap-4">
														<div className="flex items-center gap-3">
															<div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500/25 to-cyan-400/25 text-sm font-bold text-slate-700 ring-1 ring-white/20 dark:text-white">
																{getDjAvatar(activeRecurringDjData.dj)}
															</div>
															<div className="min-w-0">
																<h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
																	{activeRecurringDjData.dj.nome}
																</h3>
																<p className="text-xs text-slate-500 dark:text-slate-400">
																	Histórico de atuações neste festival
																</p>
															</div>
														</div>

														<div className="grid grid-cols-3 gap-2">
															<div className="flex flex-col p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/5">
																<span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Sets</span>
																<span className="text-lg font-black text-slate-900 dark:text-white">{activeRecurringDjData.totalSets}</span>
															</div>
															<div className="flex flex-col p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/5">
																<span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Média</span>
																<span className="text-lg font-black text-purple-600 dark:text-purple-400">{activeRecurringDjData.avgRating}</span>
															</div>
															<div className="flex flex-col p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/5">
																<span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Melhor</span>
																<span className="text-lg font-black text-amber-500 dark:text-amber-400">{activeRecurringDjData.maxRating}</span>
															</div>
														</div>
													</div>

													{/* Gráfico de Evolução (8 colunas) */}
													<div className="lg:col-span-8">
														{activeRecurringDjChartData.length > 0 ? (
															<div style={{ width: '100%', height: '200px' }}>
																<ResponsiveContainer width="100%" height="100%">
																	<AreaChart data={activeRecurringDjChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
																		<defs>
																			<linearGradient id="festivalDjEvolutionGradient" x1="0" y1="0" x2="0" y2="1">
																				<stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
																				<stop offset="100%" stopColor="#a855f7" stopOpacity={0.0} />
																			</linearGradient>
																		</defs>
																		<CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#cbd5e1'} opacity={darkMode ? 0.2 : 0.4} vertical={false} />
																		<XAxis
																			dataKey="exibicao"
																			tick={{ fill: darkMode ? '#94a3b8' : '#475569', fontSize: 10 }}
																			axisLine={{ stroke: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)' }}
																			tickLine={false}
																		/>
																		<YAxis
																			domain={[0, 10]}
																			tick={{ fill: darkMode ? '#94a3b8' : '#475569', fontSize: 10 }}
																			axisLine={{ stroke: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)' }}
																			tickLine={false}
																		/>
																		<Tooltip
																			contentStyle={{
																				backgroundColor: darkMode ? '#0f172a' : '#ffffff',
																				borderColor: darkMode ? '#334155' : '#e2e8f0',
																				borderRadius: '12px',
																				color: darkMode ? '#fff' : '#0f172a',
																				fontSize: '11px',
																				boxShadow: darkMode ? '0 10px 25px -5px rgba(0, 0, 0, 0.3)' : '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
																			}}
																			formatter={(value) => [`${value} / 10`, 'Nota']}
																			labelFormatter={(label, items) => {
																				const payload = items[0]?.payload
																				if (!payload) return label
																				const specialText = payload.especial ? ` (${payload.nomeEspecial || 'Especial'})` : ''
																				return `${payload.data || ''} ${payload.hora ? `às ${payload.hora}` : ''}${specialText}`
																			}}
																		/>
																		<Area
																			type="monotone"
																			dataKey="avaliacao"
																			name="Nota"
																			stroke="#a855f7"
																			strokeWidth={2.5}
																			fill="url(#festivalDjEvolutionGradient)"
																			dot={{ fill: '#a855f7', stroke: darkMode ? '#0f172a' : '#ffffff', strokeWidth: 2, r: 4 }}
																			activeDot={{ r: 6, strokeWidth: 0 }}
																		/>
																	</AreaChart>
																</ResponsiveContainer>
															</div>
														) : (
															<div className="flex flex-col items-center justify-center py-8 text-center gap-2 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-100/50 dark:bg-slate-950/20">
																<Info className="w-6 h-6 text-slate-400 dark:text-slate-500" />
																<p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Sets sem avaliação registada</p>
																<p className="text-[11px] text-slate-500 max-w-xs">
																	Adiciona notas aos sets de {activeRecurringDjData.dj.nome} neste festival para ver o gráfico de evolução.
																</p>
															</div>
														)}
													</div>
												</div>
											)}
										</div>
									) : (
										<div className="flex flex-col items-center justify-center py-10 text-center gap-2 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-100/50 dark:bg-slate-950/20">
											<TrendingUp className="w-8 h-8 text-slate-400 dark:text-slate-500" />
											<p className="text-sm text-slate-700 dark:text-slate-400 font-medium">Sem DJs recorrentes registados</p>
											<p className="text-xs text-slate-500 max-w-sm">
												Quando assistires a 2 ou mais sets de um mesmo DJ neste festival, poderás acompanhar aqui a sua evolução de notas ao longo do tempo.
											</p>
										</div>
									)}
								</section>

								{/* Linha 3 do Grid: Histórico de Atuações (Tabela Completa) */}
								<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
									<div>
										<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
											<Calendar className="text-purple-500 dark:text-purple-400 w-5 h-5" />
											Histórico Completo de Atuações
										</h2>
										<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
											Lista de todos os sets assistidos associados a este festival.
										</p>
									</div>

									{festivalHistorySets.length > 0 ? (
										<div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/5">
											<table className="w-full text-left text-sm border-collapse">
												<thead>
													<tr className="bg-slate-100/60 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-white/10">
														<th className="py-3 px-4">Edição/Ano</th>
														<th className="py-3 px-4">Data e Hora</th>
														<th className="py-3 px-4">DJ</th>
														<th className="py-3 px-4 text-center">Avaliação</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-slate-200/60 dark:divide-white/5 text-slate-700 dark:text-slate-300">
													{festivalHistorySets.map((s) => {
														const dj = djs.find((d) => String(d.id) === String(s.djId))
														const dj2 = s.dj2Id ? djs.find((d) => String(d.id) === String(s.dj2Id)) : null
														return (
															<tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
																<td className="py-3.5 px-4 text-purple-600 dark:text-purple-300 font-semibold">
																	{s.data ? s.data.substring(0, 4) : '—'}
																</td>
																<td className="py-3.5 px-4">
																	{s.data ? s.data.split('-').reverse().join('/') : 'Sem data'}
																	{s.hora && <span className="text-slate-500 font-normal"> às {s.hora}</span>}
																</td>
																<td className="py-3.5 px-4 text-slate-900 dark:text-white font-medium">
																	<div className="flex items-center gap-2">
																		<span>{dj ? (dj2 ? `${dj.nome} B2B ${dj2.nome}` : dj.nome) : 'Desconhecido'}</span>
																		{s.especial && (
																			<span className="rounded-md bg-purple-500/15 px-1.5 py-0.5 text-[9px] font-bold text-purple-600 dark:text-purple-400 border border-purple-500/20">
																				{s.nomeEspecial || s.nome_especial || 'Especial'}
																			</span>
																		)}
																	</div>
																</td>
																<td className="py-3.5 px-4 text-center">
																	{getRatingBadge(s.avaliacao)}
																</td>
															</tr>
														)
													})}
												</tbody>
											</table>
										</div>
									) : (
										<div className="flex flex-col items-center justify-center py-10 text-center gap-2 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-100/50 dark:bg-slate-950/20">
											<Calendar className="w-8 h-8 text-slate-400 dark:text-slate-500" />
											<p className="text-sm text-slate-700 dark:text-slate-400 font-medium">Nenhum set registado</p>
											<p className="text-xs text-slate-500 max-w-xs">
												Não existem sets gravados para este festival no histórico.
											</p>
										</div>
									)}
								</section>
							</>
						) : (
							/* Estado Inicial Vazio */
							<div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-white/40 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 backdrop-blur-md rounded-2xl animate-fadeIn p-6">
								<div className="p-4 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-500/20 dark:border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
									<Ticket className="w-8 h-8" />
								</div>
								<p className="text-slate-600 dark:text-slate-400 text-sm font-semibold max-w-md">
									Por favor, seleciona um festival para ver o histórico e métricas das atuações.
								</p>
							</div>
						)}

					</div>
				)}

				{activeTab === 'locais' && (
					<LocaisTab sets={sets} festivais={festivais} djs={djs} darkMode={darkMode} />
				)}

				{activeTab === 'generos' && (() => {
					// ── Dados Derivados para a Aba de Géneros ──
					const activeGenre = generos.find((g) => String(g.id) === String(selectedGenreId)) || generos[0] || null

					// Contagem de sets por cada género
					const setCountByGenre = generos.reduce((acc, g) => {
						const count = sets.filter((s) => {
							const dj = djs.find((d) => String(d.id) === String(s.djId))
							const dj2 = s.dj2Id ? djs.find((d) => String(d.id) === String(s.dj2Id)) : null
							const djMatch = dj && Array.isArray(dj.generoIds) && dj.generoIds.some(gid => String(gid) === String(g.id))
							const dj2Match = dj2 && Array.isArray(dj2.generoIds) && dj2.generoIds.some(gid => String(gid) === String(g.id))
							return djMatch || dj2Match
						}).length
						acc[String(g.id)] = count
						return acc
					}, {})

					// Contagem de DJs por cada género
					const djCountByGenre = generos.reduce((acc, g) => {
						acc[String(g.id)] = djs.filter((d) => Array.isArray(d.generoIds) && d.generoIds.some(gid => String(gid) === String(g.id))).length
						return acc
					}, {})

					// Sets associados ao género ativo
					const genreSets = activeGenre
						? sets.filter((s) => {
								const dj = djs.find((d) => String(d.id) === String(s.djId))
								const dj2 = s.dj2Id ? djs.find((d) => String(d.id) === String(s.dj2Id)) : null
								const djMatch = dj && Array.isArray(dj.generoIds) && dj.generoIds.some(gid => String(gid) === String(activeGenre.id))
								const dj2Match = dj2 && Array.isArray(dj2.generoIds) && dj2.generoIds.some(gid => String(gid) === String(activeGenre.id))
								return djMatch || dj2Match
						  })
						: []

					// Média de notas dos sets deste género
					const ratedGenreSets = genreSets.filter((s) => s.avaliacao !== null && s.avaliacao !== undefined && s.avaliacao !== '')
					const avgRating = ratedGenreSets.length > 0
						? (ratedGenreSets.reduce((acc, s) => acc + Number(s.avaliacao), 0) / ratedGenreSets.length).toFixed(1)
						: null

					// Top DJs que tocaram neste género
					const topDjsInGenre = (() => {
						if (!activeGenre || genreSets.length === 0) return []
						const counts = {}
						genreSets.forEach((s) => {
							const dj = djs.find((d) => String(d.id) === String(s.djId))
							if (dj && Array.isArray(dj.generoIds) && dj.generoIds.some(gid => String(gid) === String(activeGenre.id))) {
								counts[String(dj.id)] = (counts[String(dj.id)] || 0) + 1
							}
							if (s.dj2Id) {
								const dj2 = djs.find((d) => String(d.id) === String(s.dj2Id))
								if (dj2 && Array.isArray(dj2.generoIds) && dj2.generoIds.some(gid => String(gid) === String(activeGenre.id))) {
									counts[String(dj2.id)] = (counts[String(dj2.id)] || 0) + 1
								}
							}
						})
						return Object.entries(counts)
							.map(([djId, count]) => {
								const dj = djs.find((d) => String(d.id) === String(djId))
								return {
									name: dj ? dj.nome : 'Desconhecido',
									quantidade: count,
								}
							})
							.sort((a, b) => b.quantidade - a.quantidade || a.name.localeCompare(b.name, 'pt'))
							.slice(0, 8)
					})()

					// Histórico cronológico de sets deste género
					const genreHistorySets = [...genreSets].sort((a, b) => {
						const dateA = new Date(`${a.data || '2000-01-01'}T${a.hora || '00:00'}`)
						const dateB = new Date(`${b.data || '2000-01-01'}T${b.hora || '00:00'}`)
						return dateB - dateA
					})

					const genreColor = activeGenre?.cor || '#a855f7'
					const intensidade = activeGenre ? Math.min(10, Math.max(1, Number(activeGenre.intensidade) || 5)) : 5
					const totalGenreSets = genreSets.length
					const totalGenreDjs = activeGenre ? (djCountByGenre[String(activeGenre.id)] || 0) : 0

					return (
						<div className="flex flex-col gap-6 animate-fadeIn">
							
							{/* Seletor de Género */}
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 dark:bg-slate-900/20 backdrop-blur-md border border-slate-200/60 dark:border-white/5 p-4 rounded-2xl shadow-lg">
								<div className="flex items-center gap-3">
									<div 
										className="p-2.5 rounded-xl border shrink-0 transition-colors"
										style={{
											backgroundColor: `${genreColor}15`,
											borderColor: `${genreColor}35`,
											color: genreColor,
										}}
									>
										<Sliders className="w-5 h-5" />
									</div>
									<div>
										<h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Selecionar Género</h2>
										<p className="text-xs text-slate-500 dark:text-slate-400">Escolhe um género musical para explorar a sua análise, andamento e histórico de sets.</p>
									</div>
								</div>
								<div className="relative min-w-[240px]">
									<select
										id="genero-main-select"
										value={selectedGenreId}
										onChange={(e) => setSelectedGenreId(e.target.value)}
										className="w-full appearance-none rounded-xl border border-slate-200 bg-white/80 dark:bg-slate-900/60 px-4 py-2.5 pr-10 text-sm text-slate-900 dark:text-white dark:border-slate-800 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all cursor-pointer font-semibold shadow-sm"
									>
										<option value="" className="dark:bg-slate-950 font-normal">Selecione um género...</option>
										{generos.map((g) => (
											<option key={g.id} value={g.id} className="dark:bg-slate-950 font-medium">
												{g.nome}
											</option>
										))}
									</select>
									<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 dark:text-slate-400">
										<Sliders className="w-4 h-4" />
									</div>
								</div>
							</div>

							{activeGenre ? (
								<>
									{/* Fila de KPIs Rápidos do Género (4 Cards) */}
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										{/* KPI 1: Sets Assistidos */}
										<div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 group">
											<div className="flex flex-col gap-1 min-w-0">
												<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sets Registados</span>
												<span className="text-2xl font-black text-slate-900 dark:text-white">{totalGenreSets}</span>
											</div>
											<div 
												className="p-3 rounded-xl border group-hover:scale-110 transition-transform duration-300 shrink-0"
												style={{
													backgroundColor: `${genreColor}15`,
													borderColor: `${genreColor}30`,
													color: genreColor,
													boxShadow: `0 0 15px ${genreColor}20`,
												}}
											>
												<Headphones className="w-5 h-5" />
											</div>
										</div>

										{/* KPI 2: DJs no Género */}
										<div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 group">
											<div className="flex flex-col gap-1 min-w-0">
												<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">DJs Associados</span>
												<span className="text-2xl font-black text-slate-900 dark:text-white">{totalGenreDjs}</span>
											</div>
											<div className="p-3 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-xl border border-cyan-500/20 dark:border-cyan-500/30 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(6,182,212,0.1)] shrink-0">
												<Users className="w-5 h-5" />
											</div>
										</div>

										{/* KPI 3: Nota Média */}
										<div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 group">
											<div className="flex flex-col gap-1 min-w-0">
												<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Nota Média</span>
												<span className="text-2xl font-black text-amber-500 dark:text-amber-400">{avgRating ? `${avgRating}/10` : '—'}</span>
											</div>
											<div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20 dark:border-amber-500/30 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(245,158,11,0.1)] shrink-0">
												<Star className="w-5 h-5" />
											</div>
										</div>

										{/* KPI 4: BPM e Intensidade */}
										<div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between hover:scale-[1.01] transition-transform duration-200 group">
											<div className="flex flex-col gap-1 min-w-0">
												<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Andamento / BPM</span>
												<span className="text-2xl font-black text-purple-600 dark:text-purple-400">{activeGenre.bpm ? `${activeGenre.bpm} BPM` : '120 BPM'}</span>
											</div>
											<div className="p-3 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 rounded-xl border border-fuchsia-500/20 dark:border-fuchsia-500/30 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(217,70,239,0.1)] shrink-0">
												<Flame className="w-5 h-5" />
											</div>
										</div>
									</div>

									{/* Grid Principal de 12 Colunas */}
									<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
										
										{/* Coluna Esquerda: Top DJs no Género, BPM Spectrum e Grelha de Navegação (5 colunas) */}
										<div className="lg:col-span-5 flex flex-col gap-6">
											
											{/* Bloco 1: Top DJs neste Género */}
											<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
												<div>
													<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
														<BarChart2 className="text-cyan-500 dark:text-cyan-400 w-5 h-5" />
														Top DJs em {activeGenre.nome}
													</h2>
													<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
														Artistas com maior número de sets assistidos deste género.
													</p>
												</div>

												{topDjsInGenre.length > 0 ? (
													<div style={{ width: '100%', height: '260px' }}>
														<ResponsiveContainer width="100%" height="100%">
															<BarChart data={topDjsInGenre} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
																<defs>
																	<linearGradient id="genreDjGradient" x1="0" y1="0" x2="1" y2="0">
																		<stop offset="0%" stopColor={genreColor} stopOpacity={0.9} />
																		<stop offset="100%" stopColor="#06b6d4" stopOpacity={0.6} />
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
																<Bar dataKey="quantidade" name="Sets" fill="url(#genreDjGradient)" radius={[0, 4, 4, 0]} barSize={16} />
															</BarChart>
														</ResponsiveContainer>
													</div>
												) : (
													<div className="flex flex-col items-center justify-center py-10 text-center gap-2 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-100/50 dark:bg-slate-950/20">
														<Info className="w-7 h-7 text-slate-400 dark:text-slate-500" />
														<p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Sem atuações registadas</p>
														<p className="text-[11px] text-slate-500 max-w-xs">
															Não existem sets gravados para DJs com este género.
														</p>
													</div>
												)}
											</section>

											{/* Bloco 2: Espectro de Ritmo / BPM */}
											<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
												<div>
													<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
														<TrendingUp className="text-purple-500 dark:text-purple-400 w-5 h-5" />
														Espectro de Ritmo (BPM)
													</h2>
													<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
														Comparação do andamento (BPM) entre os diferentes géneros.
													</p>
												</div>

												{bpmPorGenero.length > 0 ? (
													<div style={{ width: '100%', height: '220px' }}>
														<ResponsiveContainer width="100%" height="100%">
															<AreaChart data={bpmPorGenero} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
																<defs>
																	<linearGradient id="genreBpmGradient" x1="0" y1="0" x2="0" y2="1">
																		<stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
																		<stop offset="100%" stopColor="#06b6d4" stopOpacity={0.05} />
																	</linearGradient>
																</defs>
																<CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#334155' : '#cbd5e1'} opacity={darkMode ? 0.2 : 0.4} vertical={false} />
																<XAxis dataKey="name" tick={{ fill: darkMode ? '#cbd5e1' : '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
																<YAxis domain={['auto', 'auto']} tick={{ fill: darkMode ? '#cbd5e1' : '#475569', fontSize: 9 }} axisLine={false} tickLine={false} />
																<Tooltip
																	contentStyle={{
																		backgroundColor: darkMode ? '#0f172a' : '#ffffff',
																		borderColor: darkMode ? '#334155' : '#e2e8f0',
																		borderRadius: '12px',
																		color: darkMode ? '#fff' : '#0f172a',
																		fontSize: '11px',
																	}}
																	formatter={(value) => [`${value} BPM`, 'Velocidade']}
																/>
																<Area type="monotone" dataKey="bpm" stroke="#a855f7" strokeWidth={2} fill="url(#genreBpmGradient)" />
															</AreaChart>
														</ResponsiveContainer>
													</div>
												) : (
													<p className="text-xs text-slate-500 italic text-center py-6">Sem dados de BPM registados.</p>
												)}
											</section>

											{/* Bloco 3: Grelha de Navegação Rápida entre Géneros */}
											<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
												<div>
													<h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
														<Sliders className="w-4 h-4 text-purple-500 dark:text-purple-400" />
														Outros Géneros da Coleção
													</h3>
													<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Clica num género para alternar a análise.</p>
												</div>

												{generos.length > 0 ? (
													<div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
														{generos.map((g) => {
															const isCurrent = String(selectedGenreId) === String(g.id)
															const color = g.cor || '#a855f7'
															const count = setCountByGenre[String(g.id)] || 0
															return (
																<button
																	key={g.id}
																	type="button"
																	onClick={() => setSelectedGenreId(String(g.id))}
																	className={`group relative flex flex-col items-start gap-1 rounded-xl p-3 border transition-all duration-200 text-left focus:outline-none cursor-pointer ${
																		isCurrent 
																			? 'bg-purple-500/10 border-purple-500/40 shadow-sm' 
																			: 'bg-white/60 dark:bg-white/5 border-slate-200/70 dark:border-white/5 hover:border-purple-500/30 dark:hover:border-white/10 hover:bg-slate-50/80 dark:hover:bg-white/10'
																	}`}
																>
																	<div className="flex items-center justify-between w-full">
																		<span 
																			className="text-xs font-black tracking-wider leading-none"
																			style={{ color }}
																		>
																			{g.sigla || g.nome.substring(0, 3).toUpperCase()}
																		</span>
																		<span 
																			className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border"
																			style={{
																				color,
																				borderColor: `${color}30`,
																				backgroundColor: `${color}12`,
																			}}
																		>
																			{count} sets
																		</span>
																	</div>
																	<span className="text-[11px] font-semibold text-slate-800 dark:text-slate-300 truncate w-full mt-1">
																		{g.nome}
																	</span>
																</button>
															)
														})}
													</div>
												) : (
													<p className="text-xs text-slate-500 italic text-center py-4">Nenhum género registado.</p>
												)}
											</section>

										</div>

										{/* Coluna Direita: Ficha Técnica do Género e Histórico de Sets (7 colunas) */}
										<div className="lg:col-span-7 flex flex-col gap-6">
											
											{/* Bloco Ficha Técnica */}
											<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
												{/* Cabeçalho do Género Selecionado */}
												<div 
													className="flex items-center gap-4 rounded-xl p-4 border transition-all"
													style={{
														background: `linear-gradient(135deg, ${genreColor}18, ${genreColor}06)`,
														borderColor: `${genreColor}35`,
													}}
												>
													<div 
														className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl font-black text-lg tracking-widest shadow-lg"
														style={{
															backgroundColor: `${genreColor}25`,
															color: genreColor,
															border: `1px solid ${genreColor}50`,
														}}
													>
														{activeGenre.sigla || activeGenre.nome.substring(0, 4).toUpperCase()}
													</div>
													<div className="flex flex-col gap-1 min-w-0">
														<h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight truncate">
															{activeGenre.nome}
														</h3>
														<div className="flex gap-2 flex-wrap items-center mt-0.5">
															<span 
																className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
																style={{
																	backgroundColor: `${genreColor}15`,
																	color: genreColor,
																	borderColor: `${genreColor}30`,
																}}
															>
																{totalGenreSets} {totalGenreSets === 1 ? 'set assistido' : 'sets assistidos'}
															</span>
															<span 
																className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border"
																style={{
																	backgroundColor: `${genreColor}15`,
																	color: genreColor,
																	borderColor: `${genreColor}30`,
																}}
															>
																{totalGenreDjs} {totalGenreDjs === 1 ? 'DJ registado' : 'DJs registados'}
															</span>
														</div>
													</div>
												</div>

												{/* Grid de Atributos do Género */}
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
													{/* Origem Geográfica */}
													<div className="flex items-center gap-3 rounded-xl bg-slate-100/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 px-4 py-3">
														<div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">
															<MapPin size={16} />
														</div>
														<div className="flex flex-col min-w-0">
															<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Origem Geográfica</span>
															<span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
																{activeGenre.origem || <span className="text-slate-400 italic">Não definida</span>}
															</span>
														</div>
													</div>

													{/* Elemento Sonoro */}
													<div className="flex items-center gap-3 rounded-xl bg-slate-100/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 px-4 py-3">
														<div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
															<Music size={16} />
														</div>
														<div className="flex flex-col min-w-0">
															<span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Elemento Sonoro</span>
															<span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
																{activeGenre.elementoSonoro || <span className="text-slate-400 italic">Não especificado</span>}
															</span>
														</div>
													</div>
												</div>

												{/* Nível de Energia / Intensidade */}
												<div className="flex flex-col gap-2.5 rounded-xl bg-slate-100/60 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 p-4">
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-2">
															<Flame size={16} className="text-orange-500 shrink-0" />
															<span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
																Energia &amp; Intensidade
															</span>
														</div>
														<span 
															className="text-xs font-black tabular-nums"
															style={{ color: genreColor }}
														>
															{intensidade} / 10
														</span>
													</div>

													{/* Barra contínua */}
													<div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
														<div 
															className="h-full rounded-full transition-all duration-700"
															style={{
																width: `${(intensidade / 10) * 100}%`,
																background: `linear-gradient(90deg, ${genreColor}70, ${genreColor})`,
																boxShadow: `0 0 10px ${genreColor}50`,
															}}
														/>
													</div>

													{/* 10 Segmentos */}
													<div className="flex gap-1 pt-0.5">
														{Array.from({ length: 10 }, (_, i) => (
															<div 
																key={i}
																className="flex-1 h-1 rounded-sm transition-all duration-300"
																style={{
																	backgroundColor: i < intensidade ? genreColor : (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
																	boxShadow: i < intensidade ? `0 0 4px ${genreColor}80` : 'none',
																}}
															/>
														))}
													</div>
												</div>
											</section>

											{/* Bloco Histórico de Sets com este Género */}
											<section className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
												<div>
													<h2 className="text-base font-bold text-slate-800 dark:text-slate-200 tracking-tight flex items-center gap-2">
														<Calendar className="text-purple-500 dark:text-purple-400 w-5 h-5" />
														Histórico de Sets ({activeGenre.nome})
													</h2>
													<p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
														Todos os sets assistidos associados a artistas deste género musical.
													</p>
												</div>

												{genreHistorySets.length > 0 ? (
													<div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/5">
														<table className="w-full text-left text-sm border-collapse">
															<thead>
																<tr className="bg-slate-100/60 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-white/10">
																	<th className="py-3 px-4">Festival / Edição</th>
																	<th className="py-3 px-4">Data e Hora</th>
																	<th className="py-3 px-4">DJ</th>
																	<th className="py-3 px-4 text-center">Avaliação</th>
																</tr>
															</thead>
															<tbody className="divide-y divide-slate-200/60 dark:divide-white/5 text-slate-700 dark:text-slate-300">
																{genreHistorySets.map((s) => {
																	const festival = festivais.find((f) => String(f.id) === String(s.festivalId))
																	const dj = djs.find((d) => String(d.id) === String(s.djId))
																	const dj2 = s.dj2Id ? djs.find((d) => String(d.id) === String(s.dj2Id)) : null
																	return (
																		<tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors">
																			<td className="py-3.5 px-4 text-purple-600 dark:text-purple-300 font-semibold">
																				{festival ? festival.nome : 'Set Individual'}
																			</td>
																			<td className="py-3.5 px-4">
																				{s.data ? s.data.split('-').reverse().join('/') : 'Sem data'}
																				{s.hora && <span className="text-slate-500 font-normal"> às {s.hora}</span>}
																			</td>
																			<td className="py-3.5 px-4 text-slate-900 dark:text-white font-medium">
																				{dj ? (dj2 ? `${dj.nome} B2B ${dj2.nome}` : dj.nome) : 'Desconhecido'}
																			</td>
																			<td className="py-3.5 px-4 text-center">
																				{getRatingBadge(s.avaliacao)}
																			</td>
																		</tr>
																	)
																})}
															</tbody>
														</table>
													</div>
												) : (
													<div className="flex flex-col items-center justify-center py-10 text-center gap-2 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-100/50 dark:bg-slate-950/20">
														<Calendar className="w-8 h-8 text-slate-400 dark:text-slate-500" />
														<p className="text-sm text-slate-700 dark:text-slate-400 font-medium">Nenhum set registado</p>
														<p className="text-xs text-slate-500 max-w-xs">
															Não existem sets associados a DJs deste género no histórico.
														</p>
													</div>
												)}
											</section>

										</div>

									</div>
								</>
							) : (
								/* Estado Inicial Vazio */
								<div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-white/40 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 backdrop-blur-md rounded-2xl animate-fadeIn p-6">
									<div className="p-4 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-500/20 dark:border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
										<Sliders className="w-8 h-8" />
									</div>
									<p className="text-slate-600 dark:text-slate-400 text-sm font-semibold max-w-md">
										Por favor, seleciona um género musical para ver o perfil detalhado e o histórico de atuações.
									</p>
								</div>
							)}

						</div>
					)
				})()}
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
