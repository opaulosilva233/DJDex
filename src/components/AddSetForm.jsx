import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ChevronRight, Disc3, Search, Star, Sparkles, X } from 'lucide-react'

const initialFormState = {
	djId: '',
	festivalId: '',
	data: '',
	hora: '',
	avaliacao: '',
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
	const navigate = useNavigate()
	const starValues = Array.from({ length: 10 }, (_, index) => index + 1)

	useEffect(() => {
		if (initialData) {
			const initialRating =
				initialData.avaliacao === null || initialData.avaliacao === undefined ? 0 : Number(initialData.avaliacao)

			setFormData({
				djId: initialData.djId ?? initialData.dj?.id ?? '',
				festivalId: initialData.festivalId ?? initialData.festival?.id ?? '',
				data: initialData.data ?? '',
				hora: initialData.hora ?? '',
				avaliacao:
					initialData.avaliacao === null || initialData.avaliacao === undefined
						? ''
						: String(initialData.avaliacao),
			})
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
	const selectorItems = selectorContext === 'festival' ? festivais : djs
	const selectorTitle = selectorContext === 'festival' ? 'Escolher Festival' : 'Escolher Artista'
	const selectorSubtitle =
		selectorContext === 'festival'
			? 'Filtra por nome e escolhe o festival que vai guardar o set.'
			: 'Filtra por nome e escolhe o artista que vai assinar o set.'
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
	}

	function closeSelector() {
		setActiveSelector(null)
		setSearchTerm('')
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

		return selectedDj ? selectedDj.nome : 'Seleciona um DJ'
	}

	function getSelectorTriggerMeta(selector) {
		if (selector === 'festival') {
			return selectedFestival ? `${selectedFestival.local ?? 'Local desconhecido'} · ${selectedFestival.ano ?? 'Ano por definir'}` : 'Abre o painel para escolher um festival'
		}

		return selectedDj ? `Géneros: ${selectedDjGenres.length > 0 ? selectedDjGenres.map((genero) => genero.nome).join(', ') : 'Sem géneros definidos'}` : 'Abre o painel para escolher um DJ'
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

	function handleChange(event) {
		const { name, value } = event.target
		setFormData((currentFormData) => ({
			...currentFormData,
			[name]: value,
		}))
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

		const payload = {
			djId: formData.djId,
			festivalId: formData.festivalId,
			data: formData.data,
			hora: formData.hora,
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
	const dateInputClassName = `${inputClassName} pr-11 dark:[color-scheme:dark] [&::-webkit-calendar-picker-indicator]:hidden`
	const labelClassName = 'block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'
	const activeRating = hoverRating || selectedRating

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
							className={`${inputClassName} flex items-center justify-between text-left`}
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
							className={`${inputClassName} flex items-center justify-between text-left`}
						>
							<span className={selectedFestival ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}>
								{getSelectorTriggerLabel('festival')}
							</span>
							<ChevronRight className="h-4 w-4 text-purple-500" />
						</button>
						<p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{getSelectorTriggerMeta('festival')}</p>
					</div>

					<label>
						<span className={labelClassName}>Data</span>
						<div className="group relative">
							<input
								name="data"
								type="date"
								value={formData.data}
								onChange={handleChange}
								className={dateInputClassName}
								required
							/>
							<Calendar className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-400 transition-all duration-200 group-hover:text-purple-300 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.55)] dark:text-purple-400 dark:group-hover:text-cyan-300" />
						</div>
					</label>

					<label>
						<span className={labelClassName}>Hora</span>
						<input name="hora" type="time" value={formData.hora} onChange={handleChange} className={inputClassName} required />
					</label>

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

					<div className="flex max-h-[360px] flex-col items-center gap-2 overflow-y-auto pr-2">
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
				</div>
			</aside>
		</div>
	)
}