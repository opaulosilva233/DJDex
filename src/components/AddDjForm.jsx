import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Disc3, UploadCloud } from 'lucide-react'

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
		'w-full rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3 text-slate-900 shadow-sm transition placeholder:text-slate-400 outline-none backdrop-blur-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 dark:border-white/10 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-purple-500'
	const selectedGeneroIds = formData.generoIds

	return (
		<form
			onSubmit={handleSubmit}
			className="w-full max-w-4xl rounded-2xl border border-slate-200/60 bg-white/60 p-8 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/40"
		>
			<div className="grid gap-6">
				<div className="grid gap-6 lg:grid-cols-2">
					<label className="grid gap-1.5 lg:col-span-1">
						<span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
							Nome
						</span>
						<input
							name="nome"
							value={formData.nome}
							onChange={handleChange}
							className={inputClassName}
							required
						/>
					</label>

					<label className="grid gap-1.5 lg:col-span-1">
						<span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
							Imagem
						</span>
						<div className="group relative overflow-hidden rounded-2xl border border-dashed border-slate-300/80 bg-white/70 p-4 transition hover:border-purple-400/70 hover:bg-white/90 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-500/20 dark:border-white/10 dark:bg-slate-800/50 dark:hover:bg-slate-800/70">
							<input
								type="file"
								accept="image/*"
								onChange={handleFileChange}
								className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
								required={!isEditing && !formData.imagem}
							/>
							<div className="flex items-center gap-4">
								<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600 transition group-hover:bg-purple-500/15 dark:text-purple-300">
									<UploadCloud className="h-5 w-5" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
										{isCompressing ? 'A comprimir imagem...' : 'Carrega uma imagem com clique ou arrasto.'}
									</p>
									<p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
										O ficheiro será guardado como Base64 comprimido para manter o catálogo leve.
									</p>
								</div>
								{formData.imagem ? (
									<div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-100 shadow-sm dark:border-white/10 dark:bg-slate-800">
										<img
											src={formData.imagem}
											alt="Pré-visualização da imagem do DJ"
											className="h-full w-full object-cover"
										/>
									</div>
								) : (
									<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200/70 bg-slate-50 text-slate-400 dark:border-white/10 dark:bg-slate-800/80">
										<Disc3 className="h-5 w-5" />
									</div>
								)}
							</div>
						</div>
					</label>
				</div>

				<label className="grid gap-1.5">
					<span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
						Biografia
					</span>
					<textarea
						name="biografia"
						value={formData.biografia}
						onChange={handleChange}
						className={`${inputClassName} min-h-[160px] resize-none`}
						required
						rows={5}
					/>
				</label>

				<div className="grid gap-1.5">
					<span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
						Géneros
					</span>
					<div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200/60 bg-white/50 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-slate-800/30">
						{generos.map((genero) => {
							const isChecked = selectedGeneroIds.includes(genero.id)

							return (
								<label key={genero.id} className="relative">
									<input
										type="checkbox"
										value={genero.id}
										checked={isChecked}
										onChange={handleGeneroToggle}
										className="peer sr-only"
									/>
									<span
										className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
											isChecked
												? 'border-purple-500 bg-purple-600 text-white shadow-lg shadow-purple-500/20'
												: 'border-slate-200 bg-white/80 text-slate-600 hover:border-purple-300 hover:text-purple-700 dark:border-white/10 dark:bg-slate-900/30 dark:text-slate-300 dark:hover:border-purple-500/40 dark:hover:text-white'
										}`}
									>
										{isChecked ? <Check className="h-4 w-4" /> : <span className="h-1.5 w-1.5 rounded-full bg-current opacity-50" />}
										{genero.nome}
									</span>
								</label>
							)
						})}
						{generos.length === 0 && (
							<p className="text-sm text-slate-500 dark:text-slate-400">Ainda não existem géneros guardados.</p>
						)}
					</div>
				</div>

				<button
					type="submit"
					className="inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5"
				>
					Guardar DJ
				</button>
			</div>
		</form>
	)
}