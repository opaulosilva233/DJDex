import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const initialFormState = {
	nome: '',
}

export default function AddGeneroForm({ handleAddGenero }) {
	const [formData, setFormData] = useState(initialFormState)
	const navigate = useNavigate()

	function handleChange(event) {
		const { name, value } = event.target
		setFormData((currentFormData) => ({
			...currentFormData,
			[name]: value,
		}))
	}

	function handleSubmit(event) {
		event.preventDefault()

		handleAddGenero({
			id: crypto.randomUUID(),
			nome: formData.nome,
		})

		setFormData(initialFormState)
		navigate('/')
	}

	const inputClassName =
		'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 dark:placeholder:text-slate-400 dark:focus:border-blue-500 dark:focus:ring-blue-500/20'

	return (
		<form
			onSubmit={handleSubmit}
			className="grid w-full max-w-none gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-800 dark:shadow-none"
		>
			<div>
				<h2 className="m-0 text-xl font-semibold text-slate-900 dark:text-gray-100">Adicionar Género</h2>
				<p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
					Cria um novo género para o catálogo e para a associação aos DJs.
				</p>
			</div>

			<label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-gray-100">
				<span className="text-slate-700 dark:text-gray-100">Nome</span>
				<input name="nome" value={formData.nome} onChange={handleChange} className={inputClassName} required />
			</label>

			<button
				type="submit"
				className="justify-self-start rounded-full bg-slate-900 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
			>
				Guardar Género
			</button>
		</form>
	)
}
