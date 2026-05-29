import { useSearchParams } from 'react-router-dom'

import AddFestivalForm from '../components/AddFestivalForm'


export default function AddFestivalPage({ festivais = [], handleAddFestival, handleEditFestival, generos = [] }) {
	const [searchParams] = useSearchParams()
	const editId = searchParams.get('edit')
	const initialData = editId ? festivais.find((f) => f.id === editId) : undefined
	const isEditing = Boolean(initialData)

	return (
		<section className="w-full p-8 md:p-12 flex flex-col gap-8 bg-transparent relative z-10">
			<div className="flex flex-col gap-2 max-w-4xl mx-auto w-full">
				<h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
					{isEditing ? 'Editar Festival' : 'Adicionar Festival'}
				</h1>
				<p className="text-sm text-slate-500 dark:text-slate-400">
					{isEditing
						? 'Atualiza os dados do festival selecionado e mantém a biblioteca consistente.'
						: 'Cria uma nova entidade de festival para depois associar aos sets.'}
				</p>
			</div>

			<AddFestivalForm
				initialData={initialData}
				handleAddFestival={handleAddFestival}
				handleEditFestival={handleEditFestival}
				generos={generos}
			/>
		</section>
	)
}