import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const initialFormState = {
	nome: '',
}

export default function AddGeneroForm({ initialData, handleAddGenero, handleEditGenero }) {
	const [formData, setFormData] = useState(initialFormState)
	const navigate = useNavigate()
	const isEditing = Boolean(initialData)

	useEffect(() => {
		if (initialData) {
			setFormData({
				nome: initialData.nome ?? '',
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

		if (isEditing) {
			handleEditGenero({
				id: initialData.id,
				nome: formData.nome,
			})
		} else {
			handleAddGenero({
				id: crypto.randomUUID(),
				nome: formData.nome,
			})
		}

		setFormData(initialFormState)
		navigate('/generos')
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/60 dark:border-white/10 rounded-2xl p-6 shadow-xl max-w-xl mx-auto w-full flex flex-col gap-6"
		>
			<div>
				<label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 block">
					Nome do Género
				</label>
				<input
					type="text"
					name="nome"
					value={formData.nome}
					onChange={handleChange}
					placeholder="Ex: Techno, House, Trance..."
					className="w-full rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 p-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
					required
				/>
			</div>

			<div className="flex justify-end items-center gap-3 mt-2">
				<button
					type="button"
					onClick={() => navigate('/generos')}
					className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
				>
					Cancelar
				</button>
				<button
					type="submit"
					className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-purple-500/20"
				>
					{isEditing ? 'Guardar Alterações' : 'Guardar Género'}
				</button>
			</div>
		</form>
	)
}
