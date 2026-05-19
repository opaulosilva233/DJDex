import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const initialFormState = {
	dj: '',
	festival: '',
	local: '',
	data: '',
	hora: '',
	avaliacao: '',
}

export default function AddSetForm({ initialData, handleAddSet, handleEditSet }) {
	const [formData, setFormData] = useState(initialFormState)
	const navigate = useNavigate()

	const fields = [
		{ name: 'dj', label: 'DJ', type: 'text', placeholder: 'DJ' },
		{ name: 'festival', label: 'Festival', type: 'text', placeholder: 'Festival' },
		{ name: 'local', label: 'Local', type: 'text', placeholder: 'Local' },
		{ name: 'data', label: 'Data', type: 'date', placeholder: 'Data' },
		{ name: 'hora', label: 'Hora', type: 'time', placeholder: 'Hora' },
		{ name: 'avaliacao', label: 'Avaliação', type: 'number', placeholder: 'Avaliação', min: '0', max: '10' },
	]

	useEffect(() => {
		if (initialData) {
			setFormData({
				dj: initialData.nome ?? '',
				festival: initialData.festival ?? '',
				local: initialData.local ?? '',
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
			dj: formData.dj,
			festival: formData.festival,
			local: formData.local,
			data: formData.data,
			hora: formData.hora,
			avaliacao: formData.avaliacao === '' ? null : Number(formData.avaliacao),
		}

		if (initialData) {
			handleEditSet({
				id: initialData.id,
				nome: payload.dj,
				festival: payload.festival,
				local: payload.local,
				data: payload.data,
				hora: payload.hora,
				avaliacao: payload.avaliacao,
			})
		} else {
			handleAddSet({
				id: crypto.randomUUID(),
				nome: payload.dj,
				festival: payload.festival,
				local: payload.local,
				data: payload.data,
				hora: payload.hora,
				avaliacao: payload.avaliacao,
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
			className="grid max-w-[720px] gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none"
		>
			<h2 className="m-0 text-xl font-semibold text-slate-900 dark:text-gray-100">{formTitle}</h2>
			<div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
				{fields.map(({ name, label, type, placeholder, min, max }) => (
					<label key={name} className="grid gap-1 text-sm font-medium text-slate-700 dark:text-gray-200">
						<span>{label}</span>
						<input
							name={name}
							type={type}
							placeholder={placeholder}
							value={formData[name]}
							onChange={handleChange}
							min={min}
							max={max}
							className={inputClassName}
							required
						/>
					</label>
				))}
			</div>
			<button
				type="submit"
				className="justify-self-start rounded-full bg-slate-900 px-4 py-2 font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
			>
				{submitLabel}
			</button>
		</form>
	)
}