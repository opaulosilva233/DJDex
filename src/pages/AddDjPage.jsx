import { useSearchParams } from 'react-router-dom'

import AddDjForm from '../components/AddDjForm'


export default function AddDjPage({ djs = [], handleAddDj, handleEditDj, generos = [] }) {
	const [searchParams] = useSearchParams()
	const editId = searchParams.get('edit')
	const initialData = editId ? djs.find((dj) => dj.id === editId) : undefined
	const isEditing = Boolean(initialData)

	return (
		<section className="w-full p-8 md:p-12 flex flex-col gap-8 bg-transparent relative z-10">
			<div className="flex flex-col gap-3">
				<p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Catálogo</p>
				<h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
					{isEditing ? 'Editar DJ' : 'Adicionar DJ'}
				</h1>
				<p className="max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-300">
					{isEditing
						? 'Atualiza os dados do DJ selecionado e mantém a biblioteca consistente com a nova linguagem visual.'
						: 'Cria uma nova entidade de DJ com um formulário mais limpo, translúcido e alinhado ao resto da aplicação.'}
				</p>
			</div>

			<AddDjForm
				initialData={initialData}
				handleAddDj={handleAddDj}
				handleEditDj={handleEditDj}
				generos={generos}
			/>
		</section>
	)
}