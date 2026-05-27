import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const initialFormState = {
	djId: '',
	festivalId: '',
	data: '',
	hora: '',
	avaliacao: '',
}

export default function AddSetForm({ initialData, djs = [], festivais = [], generos = [], handleAddSet, handleEditSet }) {
	const [formData, setFormData] = useState(initialFormState)
	const navigate = useNavigate()

	useEffect(() => {
		if (initialData) {
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
			return
		}

		setFormData(initialFormState)
	}, [initialData])

	const selectedDj = djs.find((dj) => dj.id === formData.djId)
	const selectedDjGenres = generos.filter(
		(genero) => Array.isArray(selectedDj?.generoIds) && selectedDj.generoIds.includes(genero.id),
	)

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
		'w-full rounded-xl border border-slate-200 bg-white/80 p-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none dark:border-white/5 dark:bg-slate-900/60 dark:text-white dark:placeholder:text-slate-500'
	const labelClassName =
		'block mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500'

	return (
		<form
			onSubmit={handleSubmit}
			className="grid w-full max-w-none gap-5 rounded-2xl border border-slate-200/60 bg-white/60 p-8 shadow-lg shadow-slate-200/30 dark:border-white/10 dark:bg-slate-900/40 dark:shadow-xl dark:backdrop-blur-md"
		>
			<h2 className="mb-6 text-2xl font-black text-slate-900 dark:text-white">{formTitle}</h2>
			<div className="grid w-full gap-4 lg:grid-cols-2 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
				<label>
					<span className={labelClassName}>DJ</span>
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
					{selectedDj && (
						<p className="text-xs text-slate-500 dark:text-slate-400">
							Géneros associados: {selectedDjGenres.length > 0 ? selectedDjGenres.map((genero) => genero.nome).join(', ') : 'Sem géneros definidos'}
						</p>
					)}
				</label>

				<label>
					<span className={labelClassName}>Festival</span>
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

				<label>
					<span className={labelClassName}>Data</span>
					<input
						name="data"
						type="date"
						value={formData.data}
						onChange={handleChange}
						className={inputClassName}
						required
					/>
				</label>

				<label>
					<span className={labelClassName}>Hora</span>
					<input
						name="hora"
						type="time"
						value={formData.hora}
						onChange={handleChange}
						className={inputClassName}
						required
					/>
				</label>

				<label>
					<span className={labelClassName}>Avaliação</span>
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
			<div className="mt-6 flex justify-end gap-3">
				<button
					type="button"
					onClick={() => navigate('/lista')}
					className="px-4 py-2 font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
				>
					Cancelar
				</button>
				<button
					type="submit"
					className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-2.5 font-bold text-white shadow-lg shadow-purple-500/20 transition-all hover:-translate-y-0.5 hover:from-purple-500 hover:to-indigo-500"
				>
					{submitLabel}
				</button>
			</div>
		</form>
	)
}