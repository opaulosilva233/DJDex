import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const initialFormState = {
	djId: '',
	festivalId: '',
	data: '',
	hora: '',
	avaliacao: '',
}

export default function AddSetForm({ initialData, djs = [], festivais = [], handleAddSet, handleEditSet }) {
	const [formData, setFormData] = useState(initialFormState)
	const navigate = useNavigate()

	useEffect(() => {
		if (initialData) {
			setFormData({
				djId: initialData.djId ?? '',
				festivalId: initialData.festivalId ?? '',
				data: initialData.data ?? '',
				hora: initialData.hora ?? '',
				avaliacao:
					initialData.avaliacao === null || initialData.avaliacao === undefined
						? ''
						: String(initialData.avaliacao),
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
	const formTitle = isEditing ? 'Editar set' : 'Adicionar novo set'
	const submitLabel = isEditing ? 'Guardar alterações' : 'Guardar set'
	const inputClassName =
		'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 dark:placeholder:text-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/20'

	return (
		<form
			onSubmit={handleSubmit}
			className="grid w-full max-w-none gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none"
		>
			<div className="flex items-center justify-between gap-4">
				<div>
					<h2 className="m-0 text-xl font-semibold text-slate-900 dark:text-gray-100">{formTitle}</h2>
					<p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
						Preenche os campos abaixo para guardar ou atualizar o set.
					</p>
				</div>
			</div>
			<div className="grid w-full gap-4 lg:grid-cols-2 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
				<label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-gray-100">
					<span className="text-slate-700 dark:text-gray-100">DJ</span>
					<select name="djId" value={formData.djId} onChange={handleChange} className={inputClassName} required>
						<option value="" disabled>
							Seleciona um DJ
						</option>
						{djs.map((dj) => (
							<option key={dj.id} value={dj.id}>
								{dj.nome}
							</option>
						))}
					</select>
				</label>

				<label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-gray-100">
					<span className="text-slate-700 dark:text-gray-100">Festival</span>
					<select
						name="festivalId"
						value={formData.festivalId}
						onChange={handleChange}
						className={inputClassName}
						required
					>
						<option value="" disabled>
							Seleciona um Festival
						</option>
						{festivais.map((festival) => (
							<option key={festival.id} value={festival.id}>
								{festival.nome}
							</option>
						))}
					</select>
				</label>

				<label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-gray-100">
					<span className="text-slate-700 dark:text-gray-100">Data</span>
					<input
						name="data"
						type="date"
						value={formData.data}
						onChange={handleChange}
						className={inputClassName}
						required
					/>
				</label>

				<label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-gray-100">
					<span className="text-slate-700 dark:text-gray-100">Hora</span>
					<input
						name="hora"
						type="time"
						value={formData.hora}
						onChange={handleChange}
						className={inputClassName}
						required
					/>
				</label>

				<label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-gray-100">
					<span className="text-slate-700 dark:text-gray-100">Avaliação</span>
					<input
						name="avaliacao"
						type="number"
						placeholder="Avaliação"
						value={formData.avaliacao}
						onChange={handleChange}
						min="0"
						max="10"
						className={inputClassName}
						required
					/>
				</label>
			</div>
			<button
				type="submit"
				className="justify-self-start rounded-full bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
			>
				{submitLabel}
			</button>
		</form>
	)
}