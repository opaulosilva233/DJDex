import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Disc3, Trash2, UploadCloud, User } from 'lucide-react'

import { compressImage } from '../utils/imageHelper'

const initialFormState = {
	nome: '',
	biografia: '',
	imagem: '',
	generoIds: [],
}

export default function AddDjForm({ initialData, handleAddDj, handleEditDj, generos = [] }) {
	const [formData, setFormData] = useState(initialFormState)
	const [isCompressing, setIsCompressing] = useState(false)
	const fileInputRef = useRef(null)
	const navigate = useNavigate()
	const isEditing = Boolean(initialData)

	useEffect(() => {
		if (initialData) {
			setFormData({
				nome: initialData.nome ?? '',
				biografia: initialData.biografia ?? '',
				imagem: initialData.imagem ?? '',
				generoIds: Array.isArray(initialData.generoIds)
					? initialData.generoIds.filter(Boolean)
					: Array.isArray(initialData.generos)
						? initialData.generos.map((genero) => genero.id).filter(Boolean)
						: [],
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

	function handleSubmit(event) {
		event.preventDefault()

		const payload = {
			nome: formData.nome,
			biografia: formData.biografia,
			imagem: formData.imagem,
			generoIds: formData.generoIds,
		}

		if (isEditing) {
			handleEditDj({
				id: initialData.id,
				...payload,
			})
		} else {
			handleAddDj({
				id: crypto.randomUUID(),
				...payload,
			})
		}

		setFormData(initialFormState)
		navigate('/djs')
	}

	const inputClassName =
		'w-full rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 outline-none backdrop-blur-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-white/10 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-500'

	const labelClassName =
		'block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'

	const selectedGeneroIds = formData.generoIds

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl max-w-5xl mx-auto w-full"
		>
			{/* ── Input de ficheiro oculto ── */}
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				className="hidden"
			/>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* ════════════════════════════════════════════════════
				    COLUNA ESQUERDA — Dados (7 colunas)
				   ════════════════════════════════════════════════════ */}
				<div className="lg:col-span-7 flex flex-col gap-5">
					{/* Nome */}
					<label className="grid gap-1.5">
						<span className={labelClassName}>Nome</span>
						<input
							name="nome"
							value={formData.nome}
							onChange={handleChange}
							placeholder="Nome artístico do DJ"
							className={inputClassName}
							required
						/>
					</label>

					{/* Géneros — chips minimalistas */}
					<div className="grid gap-1.5">
						<span className={labelClassName}>Géneros</span>
						<div className="flex flex-wrap gap-2.5 rounded-xl border border-slate-200/30 bg-slate-100/40 p-3.5 backdrop-blur-sm dark:border-white/5 dark:bg-slate-900/30">
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
											className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-semibold tracking-wide uppercase transition-all duration-200 hover:scale-105 active:scale-95 ${
												isChecked
													? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-transparent shadow-lg shadow-purple-500/30'
													: 'bg-slate-800/30 dark:bg-slate-950/20 backdrop-blur-sm border border-slate-700/40 dark:border-white/5 text-slate-400 dark:text-slate-500 hover:border-purple-500/40 hover:text-slate-200'
											}`}
										>
											{isChecked ? <Check className="h-3 w-3" /> : <span className="h-1 w-1 rounded-full bg-current opacity-40" />}
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

					{/* Biografia */}
					<label className="grid gap-1.5">
						<span className={labelClassName}>Biografia</span>
						<textarea
							name="biografia"
							value={formData.biografia}
							onChange={handleChange}
							placeholder="Uma breve descrição sobre o DJ..."
							className={`${inputClassName} min-h-[100px] max-h-[120px] resize-none`}
							required
							rows={4}
						/>
					</label>

					{/* Botões de Ação — alinhados à direita */}
					<div className="flex justify-end items-center gap-3 mt-2">
						<button
							type="button"
							onClick={() => navigate('/djs')}
							className="rounded-xl px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
						>
							Cancelar
						</button>
						<button
							type="submit"
							className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-2 px-5 rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-purple-500/20 hover:from-purple-500 hover:to-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
						>
							{isEditing ? 'Guardar Alterações' : 'Guardar DJ'}
						</button>
					</div>
				</div>

				{/* ════════════════════════════════════════════════════
				    COLUNA DIREITA — Painel de Imagem (5 colunas)
				   ════════════════════════════════════════════════════ */}
				<div className="lg:col-span-5 flex flex-col items-center justify-between bg-white/5 dark:bg-slate-900/30 backdrop-blur-md border border-slate-200/20 dark:border-white/5 rounded-2xl p-6 h-full min-h-[400px]">
					{/* Rótulo */}
					<p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 self-start">
						Imagem do DJ
					</p>

					{/* Moldura Circular Premium */}
					<div className="flex flex-col items-center gap-4 flex-1 justify-center">
						<div
							className={`w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-2 relative flex items-center justify-center transition-all duration-500 ${
								formData.imagem
									? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] bg-slate-950/40'
									: 'border-slate-700/50 shadow-[0_0_20px_rgba(168,85,247,0.08)] bg-slate-950/40'
							}`}
						>
							{formData.imagem ? (
								<img
									src={formData.imagem}
									alt="Avatar do DJ"
									className="w-full h-full object-cover animate-[fadeIn_300ms_ease-out]"
								/>
							) : (
								<div className="flex flex-col items-center gap-2 text-slate-600 dark:text-slate-500">
									<User className="h-12 w-12 opacity-40" />
									<p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Sem imagem</p>
								</div>
							)}

							{/* Overlay de compressão */}
							{isCompressing && (
								<div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm rounded-full">
									<div className="flex flex-col items-center gap-2">
										<Disc3 className="h-6 w-6 text-purple-400 animate-spin" />
										<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-300">A comprimir...</p>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Botões de Ação Verticais */}
					<div className="flex flex-col gap-3 w-full mt-4">
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 font-bold py-2 px-4 rounded-xl text-sm border border-purple-500/30 transition-all text-center cursor-pointer hover:-translate-y-0.5 active:scale-[0.98]"
						>
							<span className="inline-flex items-center justify-center gap-2">
								<UploadCloud className="h-4 w-4" />
								Carregar Nova Imagem
							</span>
						</button>


						{formData.imagem && (
							<button
								type="button"
								onClick={handleRemoveImage}
								className="text-xs font-bold uppercase tracking-wider text-rose-500/70 hover:text-rose-400 transition-colors mt-2 self-center"
							>
								Remover Imagem
							</button>
						)}
					</div>
				</div>
			</div>
		</form>
	)
}