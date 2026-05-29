import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Disc3, MapPin, Trash2, UploadCloud } from 'lucide-react'

import { compressImage } from '../utils/imageHelper'

const initialFormState = {
	nome: '',
	local: '',
	ano: '',
	imagem: '',
}

export default function AddFestivalForm({ initialData, handleAddFestival, handleEditFestival }) {
	const [formData, setFormData] = useState(initialFormState)
	const [isCompressing, setIsCompressing] = useState(false)
	const fileInputRef = useRef(null)
	const navigate = useNavigate()
	const isEditing = Boolean(initialData)

	useEffect(() => {
		if (initialData) {
			setFormData({
				nome: initialData.nome ?? '',
				local: initialData.local ?? '',
				ano: initialData.ano ? String(initialData.ano) : '',
				imagem: initialData.imagem ?? '',
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
			local: formData.local,
			ano: Number(formData.ano),
			imagem: formData.imagem,
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
		navigate('/festivais')
	}

	const inputClassName =
		'w-full rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition-all placeholder:text-slate-400 outline-none backdrop-blur-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-white/10 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-500'

	const labelClassName =
		'block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'

	return (
		<form
			onSubmit={handleSubmit}
			className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-4xl mx-auto w-full font-sans"
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
			    COLUNA ESQUERDA — Dados do Festival (7 colunas)
			   ════════════════════════════════════════════════════ */}
			<div className="lg:col-span-7 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
				{/* Nome */}
				<label className="grid gap-1.5">
					<span className={labelClassName}>Nome</span>
					<input
						name="nome"
						value={formData.nome}
						onChange={handleChange}
						placeholder="Nome do festival"
						className={inputClassName}
						required
					/>
				</label>

				{/* Local */}
				<label className="grid gap-1.5">
					<span className={labelClassName}>Local</span>
					<input
						name="local"
						value={formData.local}
						onChange={handleChange}
						placeholder="Cidade, País"
						className={inputClassName}
						required
					/>
				</label>

				{/* Ano */}
				<label className="grid gap-1.5">
					<span className={labelClassName}>Ano</span>
					<input
						name="ano"
						type="number"
						value={formData.ano}
						onChange={handleChange}
						placeholder="2025"
						className={inputClassName}
						required
					/>
				</label>

				{/* Botões de Ação — alinhados à direita */}
				<div className="flex justify-end items-center gap-3 mt-4">
					<button
						type="button"
						onClick={() => navigate('/festivais')}
						className="rounded-xl px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
					>
						Cancelar
					</button>
					<button
						type="submit"
						className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-2 px-5 rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-purple-500/20 hover:from-purple-500 hover:to-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
					>
						{isEditing ? 'Guardar Alterações' : 'Guardar Festival'}
					</button>
				</div>
			</div>

			{/* ════════════════════════════════════════════════════
			    COLUNA DIREITA — Painel de Imagem (5 colunas)
			   ════════════════════════════════════════════════════ */}
			<div className="lg:col-span-5 flex flex-col items-center justify-between bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl h-full min-h-[380px]">
				{/* Rótulo */}
				<p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 self-start">
					Cartaz / Logo
				</p>

				{/* Moldura Retangular Premium — proporção de cartaz */}
				<div className="flex flex-col items-center gap-4 flex-1 justify-center w-full">
					<div
						className={`w-full aspect-video md:aspect-[4/3] rounded-xl overflow-hidden border-2 relative flex items-center justify-center transition-all duration-500 ${
							formData.imagem
								? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)] bg-slate-950/40'
								: 'border-slate-700/50 shadow-[0_0_20px_rgba(168,85,247,0.08)] bg-slate-950/40'
						}`}
					>
						{formData.imagem ? (
							<img
								src={formData.imagem}
								alt="Cartaz do Festival"
								className="w-full h-full object-cover animate-[fadeIn_300ms_ease-out]"
							/>
						) : (
							<div className="flex flex-col items-center gap-2 text-slate-600 dark:text-slate-500">
								<MapPin className="h-12 w-12 opacity-40" />
								<p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Sem imagem</p>
							</div>
						)}

						{/* Overlay de compressão */}
						{isCompressing && (
							<div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm rounded-xl">
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
							Carregar Imagem
						</span>
					</button>

					{formData.imagem && (
						<button
							type="button"
							onClick={handleRemoveImage}
							className="text-xs font-bold uppercase tracking-wider text-rose-500/70 hover:text-rose-400 transition-colors mt-2 self-center inline-flex items-center gap-1.5"
						>
							<Trash2 className="h-3 w-3" />
							Remover Imagem
						</button>
					)}
				</div>
			</div>
		</form>
	)
}