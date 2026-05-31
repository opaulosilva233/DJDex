import { useState, useMemo, useEffect } from 'react'
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
import { User, Calendar, MapPin, BarChart2, TrendingUp, Info, Search } from 'lucide-react'

const pieColors = ['#a855f7', '#06b6d4', '#ec4899', '#10b981', '#f43f5e', '#14b8a6', '#6366f1']

export default function EstatisticasPage({ sets = [], djs = [], festivais = [], generos = [] }) {
	const [activeTab, setActiveTab] = useState('djs')
	const [selectedDjId, setSelectedDjId] = useState('')
	const [djSearchTerm, setDjSearchTerm] = useState('')

	// Configurar DJ selecionado padrão caso não esteja definido
	useEffect(() => {
		if (djs.length > 0 && (!selectedDjId || !djs.some(dj => dj.id === selectedDjId))) {
			setSelectedDjId(djs[0].id)
		}
	}, [djs, selectedDjId])

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
		{ id: 'djs', label: 'DJs' },
		{ id: 'festivais', label: 'Festivais' },
		{ id: 'locais', label: 'Locais' },
		{ id: 'generos', label: 'Géneros' },
	]

	return (
		<div className="w-full p-8 md:p-12 flex flex-col gap-8 bg-transparent relative z-10">
			{/* Cabeçalho */}
			<div className="flex flex-col gap-1">
				<span className="text-xs font-bold tracking-widest text-purple-500 uppercase">ANÁLISE</span>
				<h1 className="text-3xl font-black tracking-tight text-white">Estatísticas</h1>
				<p className="text-slate-400 text-sm max-w-xl">
					Explora as métricas da tua coleção, analisa a distribuição de notas e monitoriza o histórico de atuações dos teus DJs favoritos.
				</p>
			</div>

			{/* Barra de Navegação Interna Horizontal */}
			<div className="flex items-center border-b border-slate-800 pb-3 gap-2 overflow-x-auto scrollbar-none">
				{tabs.map((tab) => {
					const isActive = activeTab === tab.id
					return (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							type="button"
							className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 border backdrop-blur-md focus:outline-none whitespace-nowrap cursor-pointer ${
								isActive
									? 'bg-purple-600/10 text-purple-400 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)] font-medium'
									: 'bg-white/5 dark:bg-slate-900/20 text-slate-400 border-transparent hover:bg-white/10 dark:hover:bg-slate-900/40 hover:text-slate-200'
							}`}
						>
							{tab.label}
						</button>
					)
				})}
			</div>

			{/* Conteúdo das Abas */}
			<div className="w-full">
				{activeTab === 'djs' && (
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
						
						{/* Coluna Esquerda: Todos os Gráficos Empilhados (7 colunas) */}
						<div className="lg:col-span-7 flex flex-col gap-8">
							
							{/* 1. Distribuição de Avaliações */}
							<section className="bg-white/5 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/10 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
								<div>
									<h2 className="text-base font-bold text-slate-200 tracking-tight flex items-center gap-2">
										<BarChart2 className="text-purple-400 w-5 h-5" />
										Distribuição de Avaliações de {selectedDj?.nome}
									</h2>
									<p className="text-xs text-slate-400 mt-1">
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
											<CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} vertical={false} />
											<XAxis
												dataKey="nota"
												tick={{ fill: '#cbd5e1', fontSize: 11, fontFamily: 'sans-serif' }}
												axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
												tickLine={false}
											/>
											<YAxis
												allowDecimals={false}
												tick={{ fill: '#cbd5e1', fontSize: 11, fontFamily: 'sans-serif' }}
												axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
												tickLine={false}
											/>
											<Tooltip
												cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
												contentStyle={{
													backgroundColor: '#0f172a',
													borderColor: '#334155',
													borderRadius: '12px',
													color: '#fff',
													fontSize: '12px',
													boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
												}}
												itemStyle={{ color: '#a855f7' }}
												labelStyle={{ fontWeight: 'bold' }}
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
							<section className="bg-white/5 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/10 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
								<div>
									<h2 className="text-base font-bold text-slate-200 tracking-tight flex items-center gap-2">
										<BarChart2 className="text-purple-400 w-5 h-5" />
										Perfil de Intensidade / Energia por DJ
									</h2>
									<p className="text-xs text-slate-400 mt-1">
										Comparação de perfil baseada na Intensidade dos géneros, BPM e Sets registados.
									</p>
								</div>

								<div style={{ width: '100%', height: '300px' }}>
									<ResponsiveContainer width="100%" height="100%">
										<RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
											<PolarGrid stroke="#334155" opacity={0.6} />
											<PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 600, fontFamily: 'sans-serif' }} />
											<PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#64748b' }} />
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
													backgroundColor: '#0f172a',
													borderColor: '#334155',
													borderRadius: '12px',
													color: '#fff',
												}}
												itemStyle={{ color: '#fff' }}
											/>
											<Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'sans-serif', marginTop: '10px' }} />
										</RadarChart>
									</ResponsiveContainer>
								</div>
							</section>

							{/* 3. Gráfico Interativo de Avaliações do DJ Selecionado */}
							{selectedDjId && selectedDj && (
								<section className="bg-white/5 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/10 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-6 animate-fadeIn">
									<div>
										<h2 className="text-base font-bold text-slate-200 tracking-tight flex items-center gap-2">
											<TrendingUp className="text-cyan-400 w-5 h-5" />
											Histórico de Avaliações de {selectedDj.nome}
										</h2>
										<p className="text-xs text-slate-400 mt-1">
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
													<CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
													<XAxis
														dataKey="exibicao"
														tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'sans-serif' }}
														axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
														tickLine={false}
													/>
													<YAxis
														domain={[0, 10]}
														tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'sans-serif' }}
														axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
														tickLine={false}
													/>
													<Tooltip
														contentStyle={{
															backgroundColor: '#0f172a',
															borderColor: '#334155',
															borderRadius: '12px',
															color: '#fff',
															fontSize: '12px',
															boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
														}}
														itemStyle={{ color: '#06b6d4' }}
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
														dot={{ fill: '#06b6d4', stroke: '#0f172a', strokeWidth: 1.5, r: 4 }}
														activeDot={{ r: 6, strokeWidth: 0 }}
													/>
												</AreaChart>
											</ResponsiveContainer>
										</div>
									) : (
										<div className="flex flex-col items-center justify-center py-10 text-center gap-2 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
											<Info className="w-8 h-8 text-slate-500" />
											<p className="text-sm text-slate-400 font-medium">Sem avaliações registadas</p>
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
							<section className="bg-white/5 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/10 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
								<div className="flex items-center gap-3">
									<div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
										<User className="w-5 h-5" />
									</div>
									<div>
										<h2 className="text-base font-bold text-slate-200 tracking-tight">
											Selecionar DJ
										</h2>
										<p className="text-xs text-slate-400 mt-0.5">
											Pesquisa e escolhe um artista para atualizar as métricas.
										</p>
									</div>
								</div>

								{/* Barra de Pesquisa */}
								<div className="relative">
									<Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400" />
									<input
										type="text"
										value={djSearchTerm}
										onChange={(e) => setDjSearchTerm(e.target.value)}
										placeholder="Pesquisar artista ou género..."
										className="w-full rounded-xl border border-cyan-400/20 bg-slate-950/10 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:bg-white/5 shadow-[0_0_0_1px_rgba(34,211,238,0.04)]"
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
															? 'border-purple-500/40 bg-purple-500/10 shadow-[0_0_0_1px_rgba(168,85,247,0.15)] text-slate-900 dark:text-white transition-colors duration-500'
															: 'border-transparent bg-white/30 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:border-purple-500/30 hover:bg-purple-500/10'
													}`}
												>
													{/* Avatar */}
													<div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500/25 to-cyan-400/25 text-sm font-bold text-slate-700 ring-1 ring-white/20 dark:text-white">
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
																<span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400 transition-colors duration-500 whitespace-nowrap">
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
										<div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
											Nenhum DJ encontrado para a pesquisa.
										</div>
									)}
								</div>
							</section>

							{/* Tabela de Rastreio Horas/Locais (Histórico de Presenças) */}
							{selectedDjId && selectedDj && (
								<section className="bg-white/5 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/10 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-4 animate-fadeIn">
									<div>
										<h2 className="text-base font-bold text-slate-200 tracking-tight flex items-center gap-2">
											<Calendar className="text-purple-400 w-5 h-5" />
											Histórico de Presenças
										</h2>
										<p className="text-xs text-slate-400 mt-1">
											Lista de sets e eventos em que assististe à atuação do DJ.
										</p>
									</div>

									{djHistoryData.length > 0 ? (
										<div className="overflow-x-auto rounded-xl border border-white/5">
											<table className="w-full text-left text-sm border-collapse">
												<thead>
													<tr className="bg-white/5 text-slate-300 font-bold border-b border-white/10">
														<th className="py-3 px-4">Data e Hora</th>
														<th className="py-3 px-4">Festival / Edição</th>
														<th className="py-3 px-4 flex items-center gap-1">
															<MapPin className="w-3.5 h-3.5 text-slate-400" />
															Local
														</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-white/5">
													{djHistoryData.map((item) => (
														<tr key={item.id} className="hover:bg-white/5 transition-colors">
															<td className="py-3.5 px-4 text-slate-300 font-medium">
																{item.data.split('-').reverse().join('/')} 
																{item.hora && <span className="text-slate-500 font-normal"> às {item.hora}</span>}
															</td>
															<td className="py-3.5 px-4 text-purple-300 font-semibold">
																{item.festivalNome}
															</td>
															<td className="py-3.5 px-4 text-slate-400">
																{item.local}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									) : (
										<div className="flex flex-col items-center justify-center py-10 text-center gap-2 border border-dashed border-slate-800 rounded-xl bg-slate-950/20">
											<Calendar className="w-8 h-8 text-slate-500" />
											<p className="text-sm text-slate-400 font-medium">Nenhuma presença registada</p>
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
					<div className="grid grid-cols-1 gap-8">
						<section className="bg-white/5 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/10 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
							<div>
								<h2 className="text-base font-bold text-slate-200 tracking-tight flex items-center gap-2">
									<BarChart2 className="text-purple-400 w-5 h-5" />
									Sets por Festival
								</h2>
								<p className="text-xs text-slate-400 mt-1">
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
												stroke="rgba(15, 23, 42, 0.8)"
												strokeWidth={3}
												label={{ fill: '#cbd5e1', fontSize: 11, fontFamily: 'sans-serif' }}
												labelLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
											>
												{setsPorFestival.map((entry, index) => (
													<Cell key={`cell-${entry.name}`} fill={pieColors[index % pieColors.length]} />
												))}
											</Pie>
											<Tooltip
												contentStyle={{
													backgroundColor: '#0f172a',
													borderColor: '#334155',
													borderRadius: '12px',
													color: '#fff',
												}}
												itemStyle={{ color: '#fff' }}
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
					<div className="text-slate-400 font-medium py-12 text-center bg-white/5 dark:bg-slate-900/20 border border-slate-800 backdrop-blur-md rounded-2xl">
						Estatísticas de Locais em breve...
					</div>
				)}

				{activeTab === 'generos' && (
					<div className="grid grid-cols-1 gap-8">
						<section className="bg-white/5 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/10 dark:border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
							<div>
								<h2 className="text-base font-bold text-slate-200 tracking-tight flex items-center gap-2">
									<TrendingUp className="text-cyan-400 w-5 h-5" />
									Espectro de Ritmo (BPM por Género)
								</h2>
								<p className="text-xs text-slate-400 mt-1">
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
											<CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
											<XAxis
												dataKey="name"
												tick={{ fill: '#cbd5e1', fontSize: 11, fontFamily: 'sans-serif' }}
												axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
												tickLine={false}
											/>
											<YAxis
												domain={['auto', 'auto']}
												tick={{ fill: '#cbd5e1', fontSize: 11, fontFamily: 'sans-serif' }}
												axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
												tickLine={false}
											/>
											<Tooltip
												contentStyle={{
													backgroundColor: '#0f172a',
													borderColor: '#334155',
													borderRadius: '12px',
													color: '#fff',
												}}
												itemStyle={{ color: '#fff' }}
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
		</div>
	)
}
