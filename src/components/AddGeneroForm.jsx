import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const initialFormState = {
	nome: '',
	sigla: '',
	bpm: 120,
	intensidade: 5,
	origem: '',
	elementoSonoro: '',
	cor: '#a855f7',
}

const presets = ['#a855f7', '#06b6d4', '#ec4899', '#10b981', '#f97316', '#ef4444']

export default function AddGeneroForm({ initialData, handleAddGenero, handleEditGenero }) {
	const [formData, setFormData] = useState(initialFormState)
	const navigate = useNavigate()
	const isEditing = Boolean(initialData)

	const bpmValue = Number(formData.bpm) || 60
	const bpmPercentage = Math.min(100, Math.max(0, ((bpmValue - 60) / 190) * 100))

	const intensidadeValue = Number(formData.intensidade) || 1
	const intensidadePercentage = Math.min(100, Math.max(0, ((intensidadeValue - 1) / 9) * 100))

	useEffect(() => {
		if (initialData) {
			setFormData({
				nome: initialData.nome ?? '',
				sigla: initialData.sigla ?? '',
				bpm: initialData.bpm ?? 120,
				intensidade: initialData.intensidade ?? 5,
				origem: initialData.origem ?? '',
				elementoSonoro: initialData.elementoSonoro ?? '',
				cor: initialData.cor ?? '#a855f7',
			})
			return
		}
		setFormData(initialFormState)
	}, [initialData])

	function handleChange(event) {
		const { name, value } = event.target
		setFormData((currentFormData) => ({
			...currentFormData,
			[name]: value,
		}))
	}

	function handleSubmit(event) {
		event.preventDefault()

		const payload = {
			nome: formData.nome,
			sigla: formData.sigla.toUpperCase(),
			bpm: Number(formData.bpm),
			intensidade: Number(formData.intensidade),
			origem: formData.origem,
			elementoSonoro: formData.elementoSonoro,
			cor: formData.cor,
		}

		if (isEditing) {
			handleEditGenero({
				id: initialData.id,
				...payload,
			})
		} else {
			handleAddGenero({
				id: crypto.randomUUID(),
				...payload,
			})
		}

		setFormData(initialFormState)
		navigate('/generos')
	}

	const isCustom = !presets.includes(formData.cor)

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border rounded-2xl p-8 shadow-xl max-w-3xl mx-auto w-full flex flex-col gap-8 transition-all duration-300 relative z-10"
			style={{
				borderColor: `${formData.cor}40`,
				boxShadow: `0 20px 40px -15px ${formData.cor}25, 0 0 20px ${formData.cor}10`
			}}
		>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* ── LINHA 1 — Identidade ── */}
				{/* Nome do Género */}
				<div className="flex flex-col gap-1.5">
					<label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
						Nome do Género
					</label>
					<input
						type="text"
						name="nome"
						value={formData.nome}
						onChange={handleChange}
						placeholder="Ex: Techno, House, Trance..."
						className="w-full rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 p-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
						required
					/>
				</div>

				{/* Sigla */}
				<div className="flex flex-col gap-1.5">
					<label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
						Sigla
					</label>
					<input
						type="text"
						name="sigla"
						value={formData.sigla}
						onChange={handleChange}
						placeholder="Ex: TECH, HOU, TRNC"
						maxLength={4}
						className="w-full rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 p-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all uppercase"
						required
					/>
				</div>

				{/* ── LINHA 2 — Rítmica ── */}
				{/* BPM Médio */}
				<div className="flex flex-col gap-1.5">
					<label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
						BPM Médio
					</label>
					<div className="flex items-center gap-3 h-[46px]">
						<input
							type="range"
							name="bpm"
							min="60"
							max="250"
							step="5"
							value={formData.bpm}
							onChange={handleChange}
							className="appearance-none w-full h-[4px] rounded-lg outline-none flex-1 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_12px_4px_rgba(168,85,247,0.5)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform active:[&::-webkit-slider-thumb]:scale-125 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow-[0_0_12px_4px_rgba(168,85,247,0.5)] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-transform active:[&::-moz-range-thumb]:scale-125"
							style={{
								background: `linear-gradient(to right, #a855f7 0%, #6366f1 ${bpmPercentage}%, #1e293b ${bpmPercentage}%, #1e293b 100%)`
							}}
						/>
						<div className="relative w-24 shrink-0">
							<input
								type="number"
								name="bpm"
								min="60"
								max="250"
								step="5"
								value={formData.bpm}
								onChange={handleChange}
								className="w-full bg-transparent p-2 text-center text-sm font-semibold text-purple-400 dark:text-purple-300 outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
								required
							/>
							<span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-purple-400/60 dark:text-purple-300/50 uppercase pointer-events-none">
								BPM
							</span>
						</div>
					</div>
				</div>

				{/* Intensidade */}
				<div className="flex flex-col gap-1.5">
					<div className="flex justify-between items-center">
						<label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
							Intensidade
						</label>
						<span className="text-sm font-semibold text-purple-400 dark:text-purple-300">
							{formData.intensidade} / 10
						</span>
					</div>
					<div className="flex items-center h-[46px]">
						<input
							type="range"
							name="intensidade"
							min="1"
							max="10"
							value={formData.intensidade}
							onChange={handleChange}
							className="appearance-none w-full h-[4px] rounded-lg outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_0_12px_4px_rgba(168,85,247,0.5)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform active:[&::-webkit-slider-thumb]:scale-125 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow-[0_0_12px_4px_rgba(168,85,247,0.5)] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:transition-transform active:[&::-moz-range-thumb]:scale-125"
							style={{
								background: `linear-gradient(to right, #a855f7 0%, #6366f1 ${intensidadePercentage}%, #1e293b ${intensidadePercentage}%, #1e293b 100%)`
							}}
						/>
					</div>
				</div>

				{/* ── LINHA 3 — Contexto e Estética ── */}
				{/* Origem Geográfica */}
				<div className="flex flex-col gap-1.5">
					<label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
						Origem Geográfica
					</label>
					<input
						type="text"
						name="origem"
						value={formData.origem}
						onChange={handleChange}
						placeholder="Ex: Detroit (EUA), Berlim (Alemanha)..."
						className="w-full rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 p-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
					/>
				</div>

				{/* Cor de Identidade */}
				<div className="flex flex-col gap-3">
					<label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
						Cor de Identidade
					</label>
					<div className="flex flex-wrap items-center gap-3">
						{presets.map((preset) => {
							const isSelected = formData.cor === preset
							return (
								<button
									key={preset}
									type="button"
									onClick={() => setFormData((prev) => ({ ...prev, cor: preset }))}
									className="relative w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none"
									style={{
										backgroundColor: preset,
										boxShadow: isSelected
											? `0 0 14px ${preset}, inset 0 0 0 2px #ffffff`
											: 'none',
										border: isSelected ? `2px solid ${preset}` : '2px solid transparent',
									}}
									title={preset}
								>
									{isSelected && (
										<span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-bold">
											✓
										</span>
									)}
								</button>
							)
						})}

						{/* Seletor de Cor Personalizado */}
						<div
							className="relative w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 flex items-center justify-center border border-slate-200 dark:border-white/10"
							style={{
								background: isCustom ? formData.cor : 'linear-gradient(135deg, #f43f5e, #3b82f6, #10b981)',
								borderColor: isCustom ? formData.cor : 'transparent',
								boxShadow: isCustom
									? `0 0 14px ${formData.cor}, inset 0 0 0 2px #ffffff`
									: 'none',
							}}
							title="Cor Personalizada"
						>
							<input
								type="color"
								name="cor"
								value={formData.cor}
								onChange={handleChange}
								className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
							/>
							<span className="text-white text-xs font-bold pointer-events-none select-none">
								{isCustom ? '✓' : '+'}
							</span>
						</div>

						<span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2 bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-white/5 py-1 px-2.5 rounded-lg select-none font-mono">
							{formData.cor}
						</span>
					</div>
				</div>
			</div>

			{/* Botões de Ação */}
			<div className="flex justify-end items-center gap-3 mt-4">
				<button
					type="button"
					onClick={() => navigate('/generos')}
					className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
				>
					Cancelar
				</button>
				<button
					type="submit"
					className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-3 px-6 rounded-xl text-sm transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
					style={{
						boxShadow: `0 10px 20px -5px ${formData.cor}40`
					}}
				>
					{isEditing ? 'Guardar Alterações' : 'Guardar Género'}
				</button>
			</div>
		</form>
	)
}
