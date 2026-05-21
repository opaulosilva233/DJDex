import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
		'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 dark:placeholder:text-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/20'
	const selectedGeneroIds = formData.generoIds

	return (
		<form
			onSubmit={handleSubmit}
			className="grid w-full max-w-none gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none"
		>
			<div>
				<h2 className="m-0 text-xl font-semibold text-slate-900 dark:text-gray-100">
					{isEditing ? 'Editar DJ' : 'Adicionar DJ'}
				</h2>
				<p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
					{isEditing
						? 'Atualiza os dados e os géneros associados ao DJ.'
						: 'Cria a entidade do DJ para a poderes selecionar nos sets.'}
				</p>
			</div>

			<div className="grid w-full gap-4 lg:grid-cols-2 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
				<label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-gray-100">
					<span className="text-slate-700 dark:text-gray-100">Nome</span>
					<input name="nome" value={formData.nome} onChange={handleChange} className={inputClassName} required />
				</label>

				<label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-gray-100 lg:col-span-2">
					<span className="text-slate-700 dark:text-gray-100">Biografia</span>
					<textarea
						name="biografia"
						value={formData.biografia}
						onChange={handleChange}
						className={inputClassName}
						required
						rows={4}
					/>
				</label>

				<label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-gray-100 lg:col-span-2">
					<span className="text-slate-700 dark:text-gray-100">Géneros</span>
					<div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
						{generos.map((genero) => {
							const isChecked = selectedGeneroIds.includes(genero.id)

							return (
								<label
									key={genero.id}
									className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100"
								>
									<input
										type="checkbox"
										value={genero.id}
										checked={isChecked}
										onChange={handleGeneroToggle}
										className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
									/>
									<span>{genero.nome}</span>
								</label>
							)
						})}
						{generos.length === 0 && (
							<p className="text-sm text-slate-500 dark:text-slate-400">Ainda não existem géneros guardados.</p>
						)}
					</div>
				</label>

				<label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-gray-100 lg:col-span-2">
					<span className="text-slate-700 dark:text-gray-100">Imagem</span>
					<div className="flex flex-wrap items-start gap-4">
						<div className="min-w-0 flex-1">
							<input
								type="file"
								accept="image/*"
								onChange={handleFileChange}
								className={inputClassName}
								required={!isEditing && !formData.imagem}
							/>
							<span className="text-xs text-slate-500 dark:text-slate-400">
								{isCompressing ? 'A comprimir imagem...' : 'A imagem será guardada como Base64 comprimido.'}
							</span>
						</div>
						{formData.imagem && (
							<img
								src={formData.imagem}
								alt="Pré-visualização da imagem do DJ"
								className="h-20 w-20 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
							/>
						)}
					</div>
				</label>
			</div>

			<button
				type="submit"
				className="justify-self-start rounded-full bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
			>
				Guardar DJ
			</button>
		</form>
	)
}