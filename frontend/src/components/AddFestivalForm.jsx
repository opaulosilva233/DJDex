import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, Disc3, MapPin, Plus, Trash2, UploadCloud, X } from 'lucide-react'

import { compressImage } from '../utils/imageHelper'

const initialFormState = {
	nome: '',
	imagem: '',
	generoIds: [],
	tipo: '',
	website: '',
}

const calendarWeekdays = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
const calendarMonthOptions = [
	'Janeiro',
	'Fevereiro',
	'Março',
	'Abril',
	'Maio',
	'Junho',
	'Julho',
	'Agosto',
	'Setembro',
	'Outubro',
	'Novembro',
	'Dezembro',
]

function parseDateValue(value) {
	if (!value) return null
	const [year, month, day] = String(value).split('-').map(Number)
	if (!year || !month || !day) return null
	const parsedDate = new Date(year, month - 1, day)
	return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function formatDateValue(date) {
	if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

export default function AddFestivalForm({ initialData, handleAddFestival, handleEditFestival, generos = [] }) {
	const [formData, setFormData] = useState(initialFormState)
	const [isCompressing, setIsCompressing] = useState(false)
	const fileInputRef = useRef(null)
	const navigate = useNavigate()
	const isEditing = Boolean(initialData)

	// Estado das edições associadas
	const [edicoes, setEdicoes] = useState([])

	// Estados do sub-formulário para adicionar uma nova edição
	const [novoAno, setNovoAno] = useState('')
	const [novoLocal, setNovoLocal] = useState('')
	const [novaDataInicio, setNovaDataInicio] = useState('')
	const [novaDuracao, setNovaDuracao] = useState('')

	// Estados do calendário customizado da edição
	const [isCalendarOpen, setIsCalendarOpen] = useState(false)
	const [calendarCursor, setCalendarCursor] = useState(() => new Date())

	// Estados do seletor customizado de Tipo
	const [isTipoOpen, setIsTipoOpen] = useState(false)
	const tipoOptions = [
		'Open Air',
		'Indoor',
		'Clubbing',
		'Underground / Warehouse',
		'Outro / Misto'
	]

	useEffect(() => {
		if (initialData) {
			setFormData({
				nome: initialData.nome ?? '',
				imagem: initialData.imagem ?? '',
				generoIds: Array.isArray(initialData.generoIds)
					? initialData.generoIds.filter(Boolean)
					: Array.isArray(initialData.generos)
						? initialData.generos.map((g) => g.id).filter(Boolean)
						: [],
				tipo: initialData.tipo ?? '',
				website: initialData.website ?? '',
			})
			setEdicoes(Array.isArray(initialData.edicoes) ? initialData.edicoes : [])
			return
		}

		setFormData(initialFormState)
		setEdicoes([])
	}, [initialData])

	function handleChange(event) {
		const { name, value } = event.target
		setFormData((currentFormData) => ({
			...currentFormData,
			[name]: value,
		}))
	}

	function handleGeneroToggle(event) {
		const { value, checked } = event.target
		setFormData((currentFormData) => ({
			...currentFormData,
			generoIds: checked
				? [...currentFormData.generoIds, value]
				: currentFormData.generoIds.filter((generoId) => generoId !== value),
		}))
	}

	async function handleFileChange(event) {
		const file = event.target.files?.[0]

		if (!file) {
			setFormData((currentFormData) => ({
				...currentFormData,
				imagem: '',
			}))
			return
		}

		setIsCompressing(true)

		try {
			const compressedImage = await compressImage(file)
			setFormData((currentFormData) => ({
				...currentFormData,
				imagem: compressedImage,
			}))
		} finally {
			setIsCompressing(false)
		}
	}

	function handleRemoveImage() {
		setFormData((currentFormData) => ({
			...currentFormData,
			imagem: '',
		}))

		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	// Adiciona uma nova edição ao array de edições em memória
	function handleAddEdicao() {
		if (!novoAno || !novoLocal || !novaDataInicio || !novaDuracao) {
			alert('Por favor, preenche todos os campos da edição.')
			return
		}

		const novaEdicao = {
			id: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()),
			ano: Number(novoAno),
			local: novoLocal.trim(),
			dataInicio: novaDataInicio,
			duracao: Number(novaDuracao),
		}

		setEdicoes((prev) => [...prev, novaEdicao])

		// Reset dos campos do sub-formulário
		setNovoAno('')
		setNovoLocal('')
		setNovaDataInicio('')
		setNovaDuracao('')
	}

	// Remove uma edição do array em memória
	function handleRemoveEdicao(id) {
		setEdicoes((prev) => prev.filter((edicao) => edicao.id !== id))
	}

	function handleSubmit(event) {
		event.preventDefault()

		if (edicoes.length === 0) {
			alert('Adicione pelo menos uma edição ao festival antes de guardar.')
			return
		}

		const payload = {
			nome: formData.nome,
			imagem: formData.imagem,
			edicoes: edicoes,
			generoIds: formData.generoIds,
			tipo: formData.tipo,
			website: formData.website,
		}

		if (isEditing) {
			handleEditFestival({
				id: initialData.id,
				...payload,
			})
		} else {
			handleAddFestival({
				id: crypto.randomUUID(),
				...payload,
			})
		}

		setFormData(initialFormState)
		setEdicoes([])
		navigate('/festivais')
	}

	const inputClassName =
		'w-full rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 outline-none backdrop-blur-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-0 dark:border-white/10 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-500'

	const selectClassName =
		'w-full rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition-all outline-none backdrop-blur-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-0 dark:border-white/10 dark:bg-slate-800/50 dark:text-white dark:focus:border-purple-500 cursor-pointer appearance-none'

	const subInputClassName =
		'w-full rounded-xl border border-slate-200/80 bg-white/90 px-3.5 py-2.5 text-xs text-slate-900 shadow-sm transition-all placeholder:text-slate-400 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 dark:border-white/10 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-500'

	const labelClassName =
		'block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'

	const selectedGeneroIds = formData.generoIds || []

	// Configuração do calendário
	const displayedCalendarDate = calendarCursor || new Date()
	const calendarMonthStart = new Date(displayedCalendarDate.getFullYear(), displayedCalendarDate.getMonth(), 1)
	const calendarMonthEnd = new Date(displayedCalendarDate.getFullYear(), displayedCalendarDate.getMonth() + 1, 0)
	const calendarMonthLabel = calendarMonthOptions[displayedCalendarDate.getMonth()]
	const leadingEmptyDays = (calendarMonthStart.getDay() + 6) % 7
	const daysInMonth = calendarMonthEnd.getDate()
	const calendarDays = Array.from({ length: leadingEmptyDays + daysInMonth }, (_, index) => {
		if (index < leadingEmptyDays) return null
		return index - leadingEmptyDays + 1
	})

	function handleDateSelect(date) {
		setNovaDataInicio(formatDateValue(date))
		setIsCalendarOpen(false)
	}

	function handleCalendarToggle() {
		setIsCalendarOpen((prev) => {
			const nextOpen = !prev
			if (nextOpen) {
				if (novaDataInicio) {
					const parsed = parseDateValue(novaDataInicio)
					if (parsed) {
						setCalendarCursor(parsed)
						return nextOpen
					}
				}
				const parsedYear = Number(novoAno)
				if (parsedYear >= 1900 && parsedYear <= 2100) {
					setCalendarCursor(new Date(parsedYear, calendarCursor.getMonth(), 1))
				}
			}
			return nextOpen
		})
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-8 max-w-4xl mx-auto w-full font-sans pb-12"
		>
			{/* ── Input de ficheiro oculto ── */}
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				className="hidden"
			/>

			{/* ════════════════════════════════════════════════════
			    LINHA 1 — Nome, Identidade Visual e Metadados (Grelha 12 Colunas)
			   ════════════════════════════════════════════════════ */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-stretch relative z-10">
				
				{/* Ficha Principal de Dados (Esquerda - 7 Colunas) */}
				<div className="lg:col-span-7 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/10 rounded-2xl p-8 shadow-xl flex flex-col gap-5 justify-between relative z-20">
					
					{/* Nome do Festival */}
					<label className="grid gap-1.5">
						<span className={labelClassName}>Nome do Festival</span>
						<input
							name="nome"
							value={formData.nome}
							onChange={handleChange}
							placeholder="Nome do festival (ex: MEO Sudoeste, Amplifest)"
							className="w-full rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3.5 text-base text-slate-900 shadow-sm transition-all placeholder:text-slate-400 outline-none backdrop-blur-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-white/10 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-500"
							required
						/>
					</label>

					{/* Grelha Interna para Tipo e Website */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{/* Formato / Tipo */}
						<div className="grid gap-1.5 relative">
							<span className={labelClassName}>Formato / Tipo</span>
							<div className="relative">
								<button
									type="button"
									onClick={() => setIsTipoOpen((prev) => !prev)}
									className={`${inputClassName} flex items-center justify-between text-left cursor-pointer`}
								>
									<span className={formData.tipo ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}>
										{formData.tipo ? formData.tipo : 'Selecionar Formato'}
									</span>
									<div className="text-purple-400 transition-transform duration-200">
										<ChevronRight size={14} className={isTipoOpen ? 'rotate-90' : ''} />
									</div>
								</button>

								{isTipoOpen && (
									<>
										{/* Escudo para fechar ao clicar fora */}
										<div className="fixed inset-0 z-40" onClick={() => setIsTipoOpen(false)} />
										<div className="absolute left-1/2 -translate-x-1/2 top-[110%] z-50 w-full rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-xl dark:border-white/10 dark:bg-slate-950/95 backdrop-blur-xl animate-year-picker-pop">
											<div className="flex flex-col gap-0.5">
												{tipoOptions.map((opt) => {
													const isSelected = formData.tipo === opt
													return (
														<button
															key={opt}
															type="button"
															onClick={() => {
																setFormData((prev) => ({ ...prev, tipo: opt }))
																setIsTipoOpen(false)
															}}
															className={`w-full text-left rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
																isSelected
																	? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
																	: 'text-slate-700 hover:bg-purple-100 dark:text-slate-200 dark:hover:bg-white/5'
															}`}
														>
															{opt}
														</button>
													)
												})}
											</div>
										</div>
									</>
								)}
							</div>
						</div>

						{/* Website Oficial */}
						<label className="grid gap-1.5">
							<span className={labelClassName}>Website Oficial</span>
							<input
								name="website"
								type="url"
								value={formData.website}
								onChange={handleChange}
								placeholder="https://exemplo.com"
								className={inputClassName}
							/>
						</label>
					</div>

					{/* Chips de Géneros Predominantes (como na ficha dos DJs) */}
					<div className="grid gap-2">
						<span className={labelClassName}>Géneros Predominantes</span>
						<div className="flex flex-wrap gap-2 rounded-xl border border-slate-200/30 bg-slate-100/40 p-3 backdrop-blur-sm dark:border-white/5 dark:bg-slate-950/20 max-h-[105px] overflow-y-auto">
							{generos.map((genero) => {
								const isChecked = selectedGeneroIds.includes(genero.id)

								return (
									<label key={genero.id} className="relative select-none">
										<input
											type="checkbox"
											value={genero.id}
											checked={isChecked}
											onChange={handleGeneroToggle}
											className="hidden"
										/>
										<span
											className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-[10px] font-semibold tracking-wide uppercase transition-all duration-200 hover:scale-105 active:scale-95 ${
												isChecked
													? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-transparent shadow-lg shadow-purple-500/30'
													: 'bg-slate-800/30 dark:bg-slate-950/20 backdrop-blur-sm border border-slate-700/40 dark:border-white/5 text-slate-400 dark:text-slate-500 hover:border-purple-500/40 hover:text-slate-200'
											}`}
										>
											{isChecked ? <Check className="h-2.5 w-2.5" /> : <span className="h-1 w-1 rounded-full bg-current opacity-40" />}
											{genero.nome}
										</span>
									</label>
								)
							})}
							{generos.length === 0 && (
								<p className="text-xs text-slate-400 dark:text-slate-500">Ainda não existem géneros guardados.</p>
							)}
						</div>
					</div>

				</div>

				{/* Cartaz/Logo (Direita - 5 Colunas) */}
				<div className="lg:col-span-5 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-between min-h-[300px]">
					<span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 self-start">
						Logótipo / Cartaz Fixo
					</span>

					<div className="w-full aspect-[4/3] rounded-xl overflow-hidden border-2 relative flex items-center justify-center transition-all duration-500 my-4 max-h-[160px] md:max-h-none h-full bg-slate-950/40 border-slate-700/50">
						{formData.imagem ? (
							<img
								src={formData.imagem}
								alt="Cartaz do Festival"
								className="w-full h-full object-cover animate-[fadeIn_300ms_ease-out]"
							/>
						) : (
							<div className="flex flex-col items-center gap-2 text-slate-600 dark:text-slate-500">
								<MapPin className="h-10 w-10 opacity-40" />
								<span className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-50">Sem Imagem</span>
							</div>
						)}

						{isCompressing && (
							<div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm rounded-xl">
								<div className="flex flex-col items-center gap-2">
									<Disc3 className="h-6 w-6 text-purple-400 animate-spin" />
									<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-300">A comprimir...</span>
								</div>
							</div>
						)}
					</div>

					<div className="flex items-center gap-3 w-full justify-between">
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className="flex-1 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold py-2 px-3 rounded-xl text-xs border border-purple-500/30 transition-all text-center cursor-pointer flex items-center justify-center gap-2"
						>
							<UploadCloud className="h-4.5 w-4.5" />
							Carregar Logo
						</button>

						{formData.imagem && (
							<button
								type="button"
								onClick={handleRemoveImage}
								className="text-xs font-bold uppercase tracking-wider text-rose-500/70 hover:text-rose-400 transition-colors px-2 py-2"
							>
								Remover
							</button>
						)}
					</div>
				</div>
			</div>

			{/* ════════════════════════════════════════════════════
			    LINHA 2 — Card Dedicado de Edições do Festival
			   ════════════════════════════════════════════════════ */}
			<div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/10 rounded-2xl p-8 shadow-xl flex flex-col gap-6 w-full">
				
				{/* Cabeçalho da Secção */}
				<div>
					<h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
						Edições do Festival
					</h3>
					<p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
						Configura o histórico de edições deste festival. Cada edição guarda a sua data de início, localidade específica e quantidade de dias.
					</p>
				</div>

				{/* Inputs de Vidro Espaçados */}
				<div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end p-6 rounded-xl border border-slate-200/40 bg-slate-100/30 backdrop-blur-sm dark:border-white/5 dark:bg-slate-950/20 relative z-20">
					
					{/* Ano */}
					<div className="sm:col-span-2">
						<span className={labelClassName}>Ano</span>
						<input
							type="number"
							placeholder="2026"
							value={novoAno}
							onChange={(e) => setNovoAno(e.target.value)}
							className={subInputClassName}
						/>
					</div>

					{/* Data de Início */}
					<div className="sm:col-span-3 relative">
						<span className={labelClassName}>Data de Início</span>
						<button
							type="button"
							onClick={handleCalendarToggle}
							className={`${subInputClassName} flex items-center justify-between text-left`}
						>
							<span className={novaDataInicio ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}>
								{novaDataInicio ? novaDataInicio : 'Selecionar data'}
							</span>
							<CalendarIcon size={14} className="text-purple-400" />
						</button>

						{/* Calendário Popover */}
						{isCalendarOpen && (
							<>
								<div className="fixed inset-0 z-40" onClick={() => setIsCalendarOpen(false)} />
								<div className="absolute left-1/2 -translate-x-1/2 bottom-[110%] sm:bottom-auto sm:top-[110%] z-50 w-64 rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-xl dark:border-white/10 dark:bg-slate-950/95 animate-year-picker-pop">
									<div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-white/5 gap-1">
										<button
											type="button"
											onClick={() => setCalendarCursor((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
											className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 shrink-0"
										>
											<ChevronLeft size={14} />
										</button>
										
										<div className="flex items-center gap-1.5">
											{/* Seletor de Mês */}
											<select
												value={displayedCalendarDate.getMonth()}
												onChange={(e) => {
													const m = Number(e.target.value)
													setCalendarCursor(new Date(displayedCalendarDate.getFullYear(), m, 1))
												}}
												className="bg-transparent border-0 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:text-purple-500 focus:ring-0 p-0"
											>
												{calendarMonthOptions.map((mName, idx) => (
													<option key={idx} value={idx} className="bg-slate-950 text-white text-xs">{mName}</option>
												))}
											</select>

											{/* Seletor de Ano */}
											<select
												value={displayedCalendarDate.getFullYear()}
												onChange={(e) => {
													const y = Number(e.target.value)
													setCalendarCursor(new Date(y, displayedCalendarDate.getMonth(), 1))
												}}
												className="bg-transparent border-0 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer hover:text-purple-500 focus:ring-0 p-0"
											>
												{Array.from({ length: 31 }, (_, i) => 2015 + i).map((y) => (
													<option key={y} value={y} className="bg-slate-950 text-white text-xs">{y}</option>
												))}
											</select>
										</div>

										<button
											type="button"
											onClick={() => setCalendarCursor((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
											className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 shrink-0"
										>
											<ChevronRight size={14} />
										</button>
									</div>

									<div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
										{calendarWeekdays.map((wd) => (
											<div key={wd}>{wd}</div>
										))}
									</div>

									<div className="grid grid-cols-7 gap-1 text-center">
										{calendarDays.map((day, index) => {
											if (!day) return <div key={`empty-${index}`} className="aspect-square" />
											const currentDayDate = new Date(displayedCalendarDate.getFullYear(), displayedCalendarDate.getMonth(), day)
											const formattedCurrent = formatDateValue(currentDayDate)
											const isSelected = novaDataInicio === formattedCurrent

											return (
												<button
													key={formattedCurrent}
													type="button"
													onClick={() => handleDateSelect(currentDayDate)}
													className={`aspect-square rounded-full text-[10px] font-semibold transition-all ${
														isSelected
															? 'bg-gradient-to-br from-purple-600 to-indigo-500 text-white shadow-md'
															: 'text-slate-700 hover:bg-purple-100 dark:text-slate-200 dark:hover:bg-purple-950/40'
													}`}
												>
													{day}
												</button>
											)
										})}
									</div>
								</div>
							</>
						)}
					</div>

					{/* Duração */}
					<div className="sm:col-span-2">
						<span className={labelClassName}>Duração</span>
						<input
							type="number"
							placeholder="Dias"
							min="1"
							value={novaDuracao}
							onChange={(e) => setNovaDuracao(e.target.value)}
							className={subInputClassName}
						/>
					</div>

					{/* Local */}
					<div className="sm:col-span-4">
						<span className={labelClassName}>Local</span>
						<input
							type="text"
							placeholder="Localidade / Cidade"
							value={novoLocal}
							onChange={(e) => setNovoLocal(e.target.value)}
							className={subInputClassName}
						/>
					</div>

					{/* Botão de Adicionar */}
					<div className="sm:col-span-1 flex justify-end">
						<button
							type="button"
							onClick={handleAddEdicao}
							aria-label="Adicionar Edição"
							className="h-10 w-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-all duration-200 shadow-md shadow-purple-500/30 active:scale-95 border border-purple-500/30"
						>
							<Plus size={20} />
						</button>
					</div>
				</div>

				{/* Lista e Tabela de Edições Atuais com maior espaçamento */}
				<div className="rounded-xl border border-slate-200/50 bg-white/40 p-5 backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/30">
					<span className="block mb-3 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
						Historial de Edições Registadas ({edicoes.length})
					</span>
					
					{edicoes.length === 0 ? (
						<p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">
							Nenhuma edição adicionada a este festival. Registou o nome acima? Preencha os campos para iniciar a lista!
						</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-left border-collapse">
								<thead>
									<tr className="border-b border-slate-200/50 dark:border-white/5 pb-2">
										<th className="pb-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Ano</th>
										<th className="pb-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Local</th>
										<th className="pb-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Início</th>
										<th className="pb-3 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Duração</th>
										<th className="pb-3 w-10"></th>
									</tr>
								</thead>
								<tbody>
									{edicoes.map((edicao) => (
										<tr key={edicao.id} className="border-b border-slate-100/50 last:border-0 dark:border-white/5 hover:bg-slate-500/5 transition-colors">
											<td className="py-3.5 text-sm font-black text-purple-600 dark:text-purple-400">{edicao.ano}</td>
											<td className="py-3.5 text-sm font-semibold text-slate-800 dark:text-slate-200">{edicao.local}</td>
											<td className="py-3.5 text-sm text-slate-500 dark:text-slate-400">{edicao.dataInicio}</td>
											<td className="py-3.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
												{edicao.duracao} {edicao.duracao === 1 ? 'dia' : 'dias'}
											</td>
											<td className="py-3.5 text-right">
												<button
													type="button"
													onClick={() => handleRemoveEdicao(edicao.id)}
													className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
													aria-label="Remover edição"
												>
													<Trash2 size={15} />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>

			{/* ════════════════════════════════════════════════════
			    LINHA 3 — Botões de Ação Unificados
			   ════════════════════════════════════════════════════ */}
			<div className="flex justify-end items-center gap-4 mt-2">
				<button
					type="button"
					onClick={() => navigate('/festivais')}
					className="rounded-xl px-6 py-3 text-sm font-bold text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
				>
					Cancelar
				</button>
				<button
					type="submit"
					className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black py-3 px-8 rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-purple-500/20 hover:from-purple-500 hover:to-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
				>
					{isEditing ? 'Guardar Alterações' : 'Guardar Festival'}
				</button>
			</div>
		</form>
	)
}