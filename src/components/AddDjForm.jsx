import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { compressImage } from '../utils/imageHelper'

const initialFormState = {
	nome: '',
	genero: '',
	biografia: '',
	imagem: '',
}

export default function AddDjForm({ handleAddDj }) {
	const [formData, setFormData] = useState(initialFormState)
	const [isCompressing, setIsCompressing] = useState(false)
	const navigate = useNavigate()

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

	function handleSubmit(event) {
		event.preventDefault()

		handleAddDj({
			id: crypto.randomUUID(),
			nome: formData.nome,
			genero: formData.genero,
			biografia: formData.biografia,
			imagem: formData.imagem,
		})

		setFormData(initialFormState)
		navigate('/lista')
	}

	const inputClassName =
		'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 dark:placeholder:text-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/20'

	return (
		<form
			onSubmit={handleSubmit}
			className="grid w-full max-w-none gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none"
		>
			<div>
				<h2 className="m-0 text-xl font-semibold text-slate-900 dark:text-gray-100">Adicionar DJ</h2>
				<p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
					Cria a entidade do DJ para a poderes selecionar nos sets.
				</p>
			</div>

			<div className="grid w-full gap-4 lg:grid-cols-2 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
				<label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-gray-100">
					<span className="text-slate-700 dark:text-gray-100">Nome</span>
					<input name="nome" value={formData.nome} onChange={handleChange} className={inputClassName} required />
				</label>

				<label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-gray-100">
					<span className="text-slate-700 dark:text-gray-100">Género</span>
					<input
						name="genero"
						value={formData.genero}
						onChange={handleChange}
						className={inputClassName}
						required
					/>
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
					<span className="text-slate-700 dark:text-gray-100">Imagem</span>
					<input
						type="file"
						accept="image/*"
						onChange={handleFileChange}
						className={inputClassName}
						required
					/>
					<span className="text-xs text-slate-500 dark:text-slate-400">
						{isCompressing ? 'A comprimir imagem...' : 'A imagem será guardada como Base64 comprimido.'}
					</span>
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