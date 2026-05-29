import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ChevronLeft, ChevronRight, Clock, Disc3, Search, Star, X } from 'lucide-react'

const initialFormState = {
	djId: '',
	festivalId: '',
	data: '',
	horaInicio: '',
	horaFim: '',
	avaliacao: '',
}

const calendarWeekdays = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']
const calendarYearOptions = Array.from({ length: new Date().getFullYear() - 2022 + 1 }, (_, index) => 2022 + index)
const timeHours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'))
const timeMinutes = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, '0'))

function parseDateValue(value) {
	if (!value) {
		return null
	}

	const [year, month, day] = String(value).split('-').map(Number)
	if (!year || !month || !day) {
		return null
	}

	const parsedDate = new Date(year, month - 1, day)
	return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function formatDateValue(date) {
	if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
		return ''
	}

	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')

	return `${year}-${month}-${day}`
}

function formatTimeValue(hours, minutes) {
	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function isSameMonth(firstDate, secondDate) {
	if (!(firstDate instanceof Date) || !(secondDate instanceof Date)) {
		return false
	}

	return firstDate.getFullYear() === secondDate.getFullYear() && firstDate.getMonth() === secondDate.getMonth()
}

function isFutureDate(candidateDate, today) {
	if (!(candidateDate instanceof Date) || !(today instanceof Date)) {
		return false
	}

	return candidateDate.getTime() > today.getTime()
}

function parseTimeValue(value) {
	if (!value || typeof value !== 'string') {
		return ['00', '00']
	}

	const [hours = '00', minutes = '00'] = value.trim().split(':')
	return [hours.padStart(2, '0').slice(0, 2), minutes.padStart(2, '0').slice(0, 2)]
}

function capitalizeFirstLetter(value) {
	if (!value) {
		return value
	}

	return value.charAt(0).toUpperCase() + value.slice(1)
}

export default function AddSetForm({ initialData, djs = [], festivais = [], generos = [], handleAddSet, handleEditSet }) {
	const [formData, setFormData] = useState(initialFormState)
	const [hoverRating, setHoverRating] = useState(0)
	const [selectedRating, setSelectedRating] = useState(0)
	const [activeSelector, setActiveSelector] = useState(null)
	const [panelSelector, setPanelSelector] = useState(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [isPanelMounted, setIsPanelMounted] = useState(false)
	const [recentSelection, setRecentSelection] = useState(null)
	const [calendarCursor, setCalendarCursor] = useState(() => new Date())
	const [isYearPickerOpen, setIsYearPickerOpen] = useState(false)
	const navigate = useNavigate()
	const starValues = Array.from({ length: 10 }, (_, index) => index + 1)
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	useEffect(() => {
		if (initialData) {
			const initialRating =
				initialData.avaliacao === null || initialData.avaliacao === undefined ? 0 : Number(initialData.avaliacao)
			const resolvedData = initialData.data ?? ''
			const resolvedStartTime = initialData.horaInicio ?? initialData.hora ?? ''
			const resolvedEndTime = initialData.horaFim ?? ''

			setFormData({
				djId: initialData.djId ?? initialData.dj?.id ?? '',
				festivalId: initialData.festivalId ?? initialData.festival?.id ?? '',
				data: resolvedData,
				horaInicio: resolvedStartTime,
				horaFim: resolvedEndTime,
				avaliacao:
					initialData.avaliacao === null || initialData.avaliacao === undefined
						? ''
						: String(initialData.avaliacao),
			})
			setCalendarCursor(parseDateValue(resolvedData) ?? new Date())
			setSelectedRating(initialRating)
			setHoverRating(0)
			setActiveSelector(null)
			setSearchTerm('')
			return
		}

		setFormData(initialFormState)
		setSelectedRating(0)
		setHoverRating(0)
		setActiveSelector(null)
		setPanelSelector(null)
		setSearchTerm('')
		setIsPanelMounted(false)
		setRecentSelection(null)
		setCalendarCursor(new Date())
		setIsYearPickerOpen(false)
	}, [initialData])

	useEffect(() => {
		let panelTimer
		let selectionTimer

		if (activeSelector) {
			setIsPanelMounted(true)
			setPanelSelector(activeSelector)
		} else {
			panelTimer = window.setTimeout(() => {
				setIsPanelMounted(false)
				setPanelSelector(null)
			}, 300)
		}

		if (recentSelection) {
			selectionTimer = window.setTimeout(() => {
				setRecentSelection(null)
			}, 220)
		}

		if (activeSelector !== 'data') {
			setIsYearPickerOpen(false)
		}

		return () => {
			if (panelTimer) {
				window.clearTimeout(panelTimer)
			}

			if (selectionTimer) {
				window.clearTimeout(selectionTimer)
			}
		}
	}, [activeSelector, recentSelection])

	const selectedDj = djs.find((dj) => dj.id === formData.djId)
	const selectedFestival = festivais.find((festival) => festival.id === formData.festivalId)
	const selectedDjGenres = generos.filter(
		(genero) => Array.isArray(selectedDj?.generoIds) && selectedDj.generoIds.includes(genero.id),
	)
	const isSelectorActive = activeSelector !== null
	const selectorContext = activeSelector ?? panelSelector
	const isEntitySelector = selectorContext === 'festival' || selectorContext === 'dj'
	const isCalendarSelector = selectorContext === 'data'
	const isTimeSelector = selectorContext === 'horaInicio' || selectorContext === 'horaFim'
	const selectorItems = selectorContext === 'festival' ? festivais : djs
	const selectorTitleByContext = {
		dj: 'Escolher Artista',
		festival: 'Escolher Festival',
		data: 'Escolher Data',
		horaInicio: 'Escolher Hora de Início',
		horaFim: 'Escolher Hora de Fim',
	}
	const selectorSubtitleByContext = {
		dj: 'Filtra por nome e escolhe o artista que vai assinar o set.',
		festival: 'Filtra por nome e escolhe o festival que vai guardar o set.',
		data: 'Seleciona a data num calendário compacto, sem sair do painel.',
		horaInicio: 'Escolhe a hora de início com uma grelha rápida e precisa.',
		horaFim: 'Escolhe a hora de fim com uma grelha rápida e precisa.',
	}
	const selectorTitle = selectorTitleByContext[selectorContext] ?? 'Escolha um Campo'
	const selectorSubtitle = selectorSubtitleByContext[selectorContext] ?? 'Usa o painel lateral para ajustar o valor selecionado.'
	const normalizedSearchTerm = searchTerm.trim().toLowerCase()
	const filteredSelectorItems = selectorItems.filter((item) => {
		if (!normalizedSearchTerm) {
			return true
		}

		const baseText =
			selectorContext === 'festival'
				? `${item.nome ?? ''} ${item.local ?? ''} ${item.ano ?? ''}`
				: `${item.nome ?? ''} ${item.biografia ?? ''}`

		return baseText.toLowerCase().includes(normalizedSearchTerm)
	})

	function openSelector(selector) {
		setActiveSelector(selector)
		setPanelSelector(selector)
		setSearchTerm('')
		setIsPanelMounted(true)
		setIsYearPickerOpen(false)

		if (selector === 'data') {
			setCalendarCursor(parseDateValue(formData.data) ?? new Date())
		}
	}

	function closeSelector() {
		setActiveSelector(null)
		setSearchTerm('')
		setIsYearPickerOpen(false)
	}

	function handleEntitySelect(selector, id) {
		setFormData((currentFormData) => ({
			...currentFormData,
			[selector === 'festival' ? 'festivalId' : 'djId']: id,
		}))
		setRecentSelection({ selector, id })
	}

	function getSelectorTriggerLabel(selector) {
		if (selector === 'festival') {
			return selectedFestival ? selectedFestival.nome : 'Seleciona um Festival'
		}

		if (selector === 'dj') {
			return selectedDj ? selectedDj.nome : 'Seleciona um DJ'
		}

		if (selector === 'data') {
			const parsedDate = parseDateValue(formData.data)
			return parsedDate ? new Intl.DateTimeFormat('pt-PT', { dateStyle: 'medium' }).format(parsedDate) : 'Seleciona uma Data'
		}

		if (selector === 'horaInicio') {
			return formData.horaInicio || 'Seleciona a Hora de Início'
		}

		if (selector === 'horaFim') {
			return formData.horaFim || 'Seleciona a Hora de Fim'
		}

		return 'Seleciona um campo'
	}

	function getSelectorTriggerMeta(selector) {
		if (selector === 'festival') {
			return selectedFestival ? `${selectedFestival.local ?? 'Local desconhecido'} · ${selectedFestival.ano ?? 'Ano por definir'}` : 'Abre o painel para escolher um festival'
		}

		if (selector === 'dj') {
			return selectedDj
				? `Géneros: ${selectedDjGenres.length > 0 ? selectedDjGenres.map((genero) => genero.nome).join(', ') : 'Sem géneros definidos'}`
				: 'Abre o painel para escolher um DJ'
		}

		if (selector === 'data') {
			return formData.data
				? `Data escolhida: ${new Intl.DateTimeFormat('pt-PT', { dateStyle: 'full' }).format(parseDateValue(formData.data) ?? new Date())}`
				: 'Abre o calendário para escolher a data'
		}

		if (selector === 'horaInicio') {
			return formData.horaInicio ? `Hora de início definida: ${formData.horaInicio}` : 'Abre o seletor para escolher a hora de início'
		}

		if (selector === 'horaFim') {
			return formData.horaFim ? `Hora de fim definida: ${formData.horaFim}` : 'Abre o seletor para escolher a hora de fim'
		}

		return 'Abre o painel lateral para editar este campo'
	}

	function getItemDetails(item) {
		if (activeSelector === 'festival') {
			return `${item.local ?? 'Local desconhecido'} · ${item.ano ?? 'Ano por definir'}`
		}

		return item.biografia ?? 'Sem biografia disponível'
	}

	function getItemAvatar(item) {
		if (item.imagem) {
			return <img src={item.imagem} alt={item.nome} className="h-full w-full object-cover" />
		}

		return item.nome
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part.charAt(0).toUpperCase())
			.join('')
	}

	function handleDateSelect(date) {
		if (isFutureDate(date, today)) {
			return
		}

		setFormData((currentFormData) => ({
			...currentFormData,
			data: formatDateValue(date),
		}))
	}

	function handleTimePartSelect(selector, part, value) {
		const fieldName = selector === 'horaFim' ? 'horaFim' : 'horaInicio'

		setFormData((currentFormData) => {
			const [currentHours, currentMinutes] = parseTimeValue(currentFormData[fieldName])
			const nextHours = part === 'hour' ? value : currentHours
			const nextMinutes = part === 'minute' ? value : currentMinutes
			const formattedTime = formatTimeValue(nextHours, nextMinutes)

			return {
				...currentFormData,
				[fieldName]: formattedTime,
				...(fieldName === 'horaInicio' ? { hora: formattedTime } : {}),
			}
		})
	}

	function handleRatingSelect(rating) {
		setSelectedRating(rating)
		setFormData((currentFormData) => ({
			...currentFormData,
			avaliacao: String(rating),
		}))
	}

	function handleSubmit(event) {
		event.preventDefault()

		if (!formData.djId) {
			openSelector('dj')
			return
		}

		if (!formData.festivalId) {
			openSelector('festival')
			return
		}

		if (!formData.data) {
			openSelector('data')
			return
		}

		if (!formData.horaInicio) {
			openSelector('horaInicio')
			return
		}

		if (!formData.horaFim) {
			openSelector('horaFim')
			return
		}

		const payload = {
			djId: formData.djId,
			festivalId: formData.festivalId,
			data: formData.data,
			horaInicio: formData.horaInicio,
			horaFim: formData.horaFim,
			hora: formData.horaInicio,
			avaliacao: formData.avaliacao === '' ? null : Number(formData.avaliacao),
		}

		if (initialData) {
			handleEditSet({
				id: initialData.id,
				...payload,
			})
		} else {
			handleAddSet({
				id: crypto.randomUUID(),
				...payload,
			})
		}

		navigate('/lista')
	}

	const isEditing = Boolean(initialData)
	const submitLabel = isEditing ? 'Guardar alterações' : 'Guardar set'
	const inputClassName =
		'w-full rounded-xl border border-slate-200 bg-white/80 p-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none dark:border-white/5 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-500'
	const triggerButtonClassName = `${inputClassName} flex items-center justify-between gap-3 text-left`
	const labelClassName = 'block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'
	const activeRating = hoverRating || selectedRating
	const selectedCalendarDate = parseDateValue(formData.data)
	const displayedCalendarDate = calendarCursor ?? new Date()
	const calendarMonthStart = new Date(displayedCalendarDate.getFullYear(), displayedCalendarDate.getMonth(), 1)
	const calendarMonthEnd = new Date(displayedCalendarDate.getFullYear(), displayedCalendarDate.getMonth() + 1, 0)
	const calendarMonthLabel = capitalizeFirstLetter(
		new Intl.DateTimeFormat('pt-PT', { month: 'long' }).format(calendarMonthStart),
	)
	const leadingEmptyDays = (calendarMonthStart.getDay() + 6) % 7
	const daysInMonth = calendarMonthEnd.getDate()
	const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
	const isNextMonthDisabled = displayedCalendarDate.getFullYear() > today.getFullYear()
		? true
		: isSameMonth(displayedCalendarDate, today)
			? true
			: displayedCalendarDate.getFullYear() === today.getFullYear() && displayedCalendarDate.getMonth() > today.getMonth()
	const isCurrentMonthView = isSameMonth(displayedCalendarDate, today)
	const calendarDays = Array.from({ length: leadingEmptyDays + daysInMonth }, (_, index) => {
		if (index < leadingEmptyDays) {
			return null
		}

		return index - leadingEmptyDays + 1
	})
	const currentTimeField = selectorContext === 'horaFim' ? 'horaFim' : 'horaInicio'
	const [selectedHours, selectedMinutes] = parseTimeValue(formData[currentTimeField] ?? '')
	const currentTimeValue = formData[currentTimeField]

	return (
		<div
			className={`w-full transition-all duration-300 ease-in-out ${
				isPanelMounted ? 'grid grid-cols-1 gap-8 lg:grid-cols-12' : 'block'
			}`}
		>
			<form
				onSubmit={handleSubmit}
				className={`w-full h-full max-h-[500px] overflow-hidden bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl ${
					isPanelMounted ? 'lg:col-span-7' : 'mx-auto max-w-2xl'
				}`}
			>
				<div className="grid w-full gap-4 lg:grid-cols-2 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
					<div>
						<span className={labelClassName}>DJ</span>
						<button
							type="button"
							onClick={() => openSelector('dj')}
							className={`${triggerButtonClassName} group`}
						>
							<span className={selectedDj ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}>
								{getSelectorTriggerLabel('dj')}
							</span>
							<ChevronRight className="h-4 w-4 text-purple-500" />
						</button>
						<p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{getSelectorTriggerMeta('dj')}</p>
					</div>

					<div>
						<span className={labelClassName}>Festival</span>
						<button
							type="button"
							onClick={() => openSelector('festival')}
							className={`${triggerButtonClassName} group`}
						>
							<span className={selectedFestival ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}>
								{getSelectorTriggerLabel('festival')}
							</span>
							<ChevronRight className="h-4 w-4 text-purple-500" />
						</button>
						<p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{getSelectorTriggerMeta('festival')}</p>
					</div>

					<div>
						<span className={labelClassName}>Data</span>
						<button
							type="button"
							onClick={() => openSelector('data')}
							className={`${triggerButtonClassName} group`}
						>
							<span className={formData.data ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}>
								{getSelectorTriggerLabel('data')}
							</span>
							<Calendar className="h-4 w-4 shrink-0 text-cyan-400 transition-all duration-200 group-hover:text-purple-300 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.55)] dark:text-purple-400 dark:group-hover:text-cyan-300" />
						</button>
						<p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{getSelectorTriggerMeta('data')}</p>
						<input type="hidden" name="data" value={formData.data} />
					</div>

					<div>
						<span className={labelClassName}>Hora de Início</span>
						<button
							type="button"
							onClick={() => openSelector('horaInicio')}
							className={`${triggerButtonClassName} group`}
						>
							<span className={formData.horaInicio ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}>
								{getSelectorTriggerLabel('horaInicio')}
							</span>
							<Clock className="h-4 w-4 shrink-0 text-cyan-400 transition-all duration-200 group-hover:text-purple-300 dark:text-purple-400" />
						</button>
						<p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{getSelectorTriggerMeta('horaInicio')}</p>
						<input type="hidden" name="horaInicio" value={formData.horaInicio} />
					</div>

					<div>
						<span className={labelClassName}>Hora de Fim</span>
						<button
							type="button"
							onClick={() => openSelector('horaFim')}
							className={`${triggerButtonClassName} group`}
						>
							<span className={formData.horaFim ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}>
								{getSelectorTriggerLabel('horaFim')}
							</span>
							<Clock className="h-4 w-4 shrink-0 text-cyan-400 transition-all duration-200 group-hover:text-purple-300 dark:text-purple-400" />
						</button>
						<p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{getSelectorTriggerMeta('horaFim')}</p>
						<input type="hidden" name="horaFim" value={formData.horaFim} />
					</div>

					<label>
						<span className={labelClassName}>Avaliação</span>
						<div className="mt-1" onMouseLeave={() => setHoverRating(0)}>
							<div className="mt-1 flex items-center gap-1">
								{starValues.map((rating) => {
									const isActive = rating <= activeRating

									return (
										<button
											key={rating}
											type="button"
											aria-label={`Selecionar avaliação ${rating} de 10`}
											aria-pressed={selectedRating === rating}
											onMouseEnter={() => setHoverRating(rating)}
											onFocus={() => setHoverRating(rating)}
											onBlur={() => setHoverRating(0)}
											onClick={() => handleRatingSelect(rating)}
											className="group rounded-md p-0.5 transition-transform duration-150 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60"
										>
											<Star className={isActive ? 'fill-current text-amber-400' : 'text-slate-300 dark:text-slate-600'} />
										</button>
									)
								})}
							</div>
							<p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
								{selectedRating ? `Avaliação selecionada: ${selectedRating}/10` : 'Clica numa estrela para definir a avaliação'}
							</p>
							<input type="hidden" name="avaliacao" value={formData.avaliacao} />
						</div>
					</label>
				</div>
				<div className="mt-6 flex items-center justify-end gap-3">
					<button
						type="button"
						onClick={() => navigate('/lista')}
						className="rounded-xl px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
					>
						Cancelar
					</button>
					<button
						type="submit"
						className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition-all duration-200 hover:from-purple-500 hover:to-indigo-500 focus-visible:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
					>
						{submitLabel}
					</button>
				</div>
			</form>

			<aside
				className={`${
					isPanelMounted
						? isSelectorActive
							? 'lg:block lg:col-span-5 w-full opacity-100 translate-x-0 pointer-events-auto'
							: 'lg:block lg:col-span-5 w-full opacity-0 translate-x-12 pointer-events-none'
						: 'hidden'
				} transition-all duration-300 ease-in-out`}
			>
				<div className="flex h-full max-h-[500px] flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200/60 bg-white/40 p-6 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/30">
					<div className="flex items-start justify-between gap-4">
						<div>
							<div className="flex items-center gap-2 text-slate-900 dark:text-white">
								<Disc3 className="h-4 w-4 text-cyan-400" />
								<h2 className="text-lg font-black tracking-tight">{selectorTitle}</h2>
							</div>
							<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selectorSubtitle}</p>
						</div>
						<button
							type="button"
							onClick={closeSelector}
							aria-label="Fechar painel de seleção"
							className="rounded-full border border-slate-200/70 bg-white/60 p-2 text-slate-500 transition-all hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/40 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:text-white"
						>
							<X className="h-4 w-4" />
						</button>
					</div>

					{isEntitySelector && (
						<>
							<div className="relative">
								<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-400" />
								<input
									type="text"
									value={searchTerm}
									onChange={(event) => setSearchTerm(event.target.value)}
									placeholder={activeSelector === 'festival' ? 'Pesquisar festival...' : 'Pesquisar artista...'}
									className="w-full rounded-2xl border border-cyan-400/20 bg-slate-950/5 py-3 pl-10 pr-4 text-sm text-slate-900 shadow-[0_0_0_1px_rgba(34,211,238,0.08)] transition-all placeholder:text-slate-400 focus:border-cyan-400/60 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
								/>
							</div>

							<div className="flex max-h-[360px] flex-1 min-h-0 flex-col items-center gap-2 overflow-y-auto pr-2">
								{filteredSelectorItems.length > 0 ? (
									filteredSelectorItems.map((item) => {
										const isSelected = activeSelector === 'festival' ? formData.festivalId === item.id : formData.djId === item.id
										const details = getItemDetails(item)
										const avatarContent = getItemAvatar(item)
										const isRecentlySelected = recentSelection?.selector === activeSelector && recentSelection?.id === item.id

										return (
											<button
												key={item.id}
												type="button"
												onClick={() => handleEntitySelect(activeSelector, item.id)}
												className={`mx-auto flex w-full max-w-md cursor-pointer items-center gap-3 rounded-xl border p-2 text-left transition-all duration-100 transition-transform hover:border-purple-500/30 hover:bg-purple-500/10 active:scale-95 ${
													isSelected
														? 'border-purple-500/40 bg-purple-500/10 shadow-[0_0_0_1px_rgba(168,85,247,0.15)] transition-colors duration-500'
														: 'border-transparent bg-white/30 dark:bg-white/5'
												} ${isRecentlySelected ? 'scale-[0.99] ring-2 ring-purple-400/30 animate-[pulse_0.35s_ease-in-out_1]' : ''}`}
											>
												<div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-500/25 to-cyan-400/25 text-sm font-bold text-slate-700 ring-1 ring-white/20 dark:text-white">
													{avatarContent}
												</div>
												<div className="min-w-0 flex-1">
													<div className="flex items-center justify-between gap-2">
														<p className="truncate text-sm font-bold text-slate-900 dark:text-white">{item.nome}</p>
														{isSelected && <span className="rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400 transition-colors duration-500">Selecionado</span>}
													</div>
													<p className="mt-1 text-[11px] leading-4 text-slate-500 dark:text-slate-400">{details}</p>
												</div>
											</button>
										)
									})
								) : (
									<div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200/70 bg-white/40 p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
										Nenhum resultado encontrado para a pesquisa atual.
									</div>
								)}
							</div>
						</>
					)}

					{isCalendarSelector && (
						<div className="flex flex-1 min-h-0 flex-col gap-4 overflow-hidden">
							<div className="flex items-center justify-between gap-3 rounded-2xl border border-cyan-400/20 bg-slate-950/5 px-4 py-3 dark:bg-white/5">
								<button
									type="button"
									onClick={() => setCalendarCursor((currentDate) => new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
									className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-slate-700 transition-all hover:border-cyan-400/40 hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 dark:border-white/10 dark:bg-slate-950/55 dark:text-slate-200 dark:hover:text-cyan-200"
									aria-label="Mês anterior"
								>
										<ChevronLeft className="h-4 w-4" />
									</button>

								<div className="min-w-0 flex-1 text-center">
									<p className="text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-400">Calendário</p>
									<div className="mt-1 flex items-center justify-center gap-2">
										<span className="truncate text-base font-black tracking-tight text-slate-900 dark:text-white">
											{calendarMonthLabel}
										</span>
										<div className="relative">
											<button
												type="button"
												onClick={() => setIsYearPickerOpen((currentValue) => !currentValue)}
												className="inline-flex min-w-[5.5rem] items-center justify-center gap-2 rounded-full border border-cyan-400/25 bg-gradient-to-br from-white/90 to-cyan-50/60 px-3 py-1.5 text-sm font-bold text-slate-700 shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_10px_30px_rgba(15,23,42,0.06)] transition-all hover:border-cyan-400/50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/30 dark:from-slate-900/80 dark:to-slate-950/80 dark:text-slate-100 dark:hover:text-white"
												aria-label="Selecionar ano"
												aria-expanded={isYearPickerOpen}
											>
												<span>{displayedCalendarDate.getFullYear()}</span>
												<ChevronRight className={`h-4 w-4 text-cyan-400 transition-transform duration-200 ${isYearPickerOpen ? 'rotate-90' : ''}`} />
											</button>

											{isYearPickerOpen && (
												<div className="absolute left-1/2 top-[calc(100%+0.65rem)] z-20 w-52 -translate-x-1/2 rounded-[1.25rem] border border-cyan-400/20 bg-white/90 p-3 text-left shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-md dark:bg-slate-950/90">
													<div className="mb-3 flex items-center justify-between border-b border-slate-200/70 pb-2 dark:border-white/10">
														<p className="text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-400">Anos</p>
														<p className="text-xs font-medium text-slate-500 dark:text-slate-400">Escolhe um ano</p>
													</div>
													<div className="max-h-56 overflow-y-auto pr-1">
														<div className="grid grid-cols-3 gap-2">
															{calendarYearOptions.map((year) => {
																const isSelectedYear = displayedCalendarDate.getFullYear() === year

																return (
																	<button
																		key={year}
																		type="button"
																		onClick={() => {
																			setCalendarCursor((currentDate) => new Date(year, currentDate.getMonth(), 1))
																			setIsYearPickerOpen(false)
																		}}
																		className={`rounded-xl border px-2.5 py-2 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/30 ${
																			isSelectedYear
																				? 'border-cyan-400/50 bg-gradient-to-br from-purple-600 to-cyan-500 text-white shadow-[0_0_18px_rgba(168,85,247,0.24)]'
																				: 'border-slate-200/70 bg-white/80 text-slate-700 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:text-cyan-200'
																		}`}
																		aria-pressed={isSelectedYear}
																	>
																			{year}
																		</button>
																	)
																})}
															</div>
													</div>
												</div>
											)}
									</div>
								</div>
								</div>

								<button
									type="button"
										onClick={() => setCalendarCursor((currentDate) => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
										disabled={isNextMonthDisabled}
									className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/70 text-slate-700 transition-all hover:border-cyan-400/40 hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 dark:border-white/10 dark:bg-slate-950/55 dark:text-slate-200 dark:hover:text-cyan-200"
									aria-label="Mês seguinte"
								>
									<ChevronRight className="h-4 w-4" />
								</button>
							</div>

							<div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
								{calendarWeekdays.map((weekday) => (
									<div key={weekday} className="py-1">
										{weekday}
									</div>
								))}
							</div>

							<div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-1">
								<div className="grid grid-cols-7 gap-1 text-center">
									{calendarDays.map((day, index) => {
										if (!day) {
											return <div key={`empty-${index}`} className="aspect-square" />
										}

										const candidateDate = new Date(calendarMonthStart.getFullYear(), calendarMonthStart.getMonth(), day)
										const candidateValue = formatDateValue(candidateDate)
										const isSelected = formData.data === candidateValue
															const isToday = formatDateValue(today) === candidateValue
															const isDisabled = isFutureDate(candidateDate, today)

										return (
											<button
												key={candidateValue}
												type="button"
												onClick={() => handleDateSelect(candidateDate)}
																	disabled={isDisabled}
																	className={`aspect-square rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 ${
													isSelected
														? 'border border-cyan-300/60 bg-gradient-to-br from-purple-600 to-cyan-500 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.35),0_0_18px_rgba(168,85,247,0.28)]'
																		: isDisabled
																			? 'cursor-not-allowed border border-slate-200/60 bg-slate-100 text-slate-300 opacity-70 dark:border-white/5 dark:bg-white/5 dark:text-slate-600'
																		: isToday
															? 'border border-cyan-400/40 bg-cyan-400/10 text-cyan-500 ring-1 ring-cyan-400/40 dark:text-cyan-300'
															: 'border border-transparent bg-white/55 text-slate-700 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-600 dark:bg-white/5 dark:text-slate-200 dark:hover:text-cyan-200'
												}`}
												aria-pressed={isSelected}
																	aria-disabled={isDisabled}
												aria-label={`Selecionar ${candidateValue}`}
											>
												{day}
											</button>
										)
									})}
								</div>
							</div>

							<div className="rounded-2xl border border-slate-200/70 bg-white/40 px-4 py-3 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
								{selectedCalendarDate ? (
									<span>Data selecionada: {new Intl.DateTimeFormat('pt-PT', { dateStyle: 'full' }).format(selectedCalendarDate)}</span>
								) : (
									<span>Seleciona um dia para preencher o campo de data.</span>
								)}
							</div>
						</div>
					)}

					{isTimeSelector && (
						<div className="flex flex-1 min-h-0 flex-col gap-4 overflow-hidden">
							<div className="rounded-2xl border border-cyan-400/20 bg-slate-950/5 px-4 py-3 text-sm text-slate-500 dark:bg-white/5 dark:text-slate-400">
								<p className="text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-400">{selectorContext === 'horaFim' ? 'Hora de Fim' : 'Hora de Início'}</p>
								<p className="mt-1 font-medium text-slate-700 dark:text-slate-200">{currentTimeValue || '00:00'}</p>
							</div>

							<div className="grid min-h-0 grid-cols-2 gap-3">
								<div className="flex min-h-0 flex-col rounded-2xl border border-slate-200/70 bg-white/40 p-3 dark:border-white/10 dark:bg-white/5">
									<p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Horas</p>
									<div className="max-h-60 overflow-y-auto pr-1">
										<div className="grid grid-cols-1 gap-1">
											{timeHours.map((hour) => {
												const isSelected = hour === selectedHours

												return (
													<button
														key={hour}
														type="button"
														onClick={() => handleTimePartSelect(selectorContext, 'hour', hour)}
														className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 ${
															isSelected
																? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_18px_rgba(168,85,247,0.24)]'
																: 'bg-white/70 text-slate-700 hover:bg-cyan-400/10 hover:text-cyan-700 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:text-cyan-200'
														}`}
														aria-pressed={isSelected}
													>
														{hour}
													</button>
												)
											})}
										</div>
									</div>
								</div>

								<div className="flex min-h-0 flex-col rounded-2xl border border-slate-200/70 bg-white/40 p-3 dark:border-white/10 dark:bg-white/5">
									<p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Minutos</p>
									<div className="max-h-60 overflow-y-auto pr-1">
										<div className="grid grid-cols-1 gap-1">
											{timeMinutes.map((minute) => {
												const isSelected = minute === selectedMinutes

												return (
													<button
														key={minute}
														type="button"
														onClick={() => handleTimePartSelect(selectorContext, 'minute', minute)}
														className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40 ${
															isSelected
																? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-[0_0_18px_rgba(34,211,238,0.24)]'
																: 'bg-white/70 text-slate-700 hover:bg-cyan-400/10 hover:text-cyan-700 dark:bg-slate-950/40 dark:text-slate-200 dark:hover:text-cyan-200'
														}`}
														aria-pressed={isSelected}
													>
														{minute}
													</button>
												)
											})}
										</div>
									</div>
								</div>
							</div>

							<div className="rounded-2xl border border-slate-200/70 bg-white/40 px-4 py-3 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
								{currentTimeValue ? (
									<span>Valor atual: {currentTimeValue}</span>
								) : (
									<span>Seleciona hora e minutos para preencher o campo.</span>
								)}
							</div>
						</div>
					)}
				</div>
			</aside>
		</div>
	)
}