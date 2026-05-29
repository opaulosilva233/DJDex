import { useSearchParams } from 'react-router-dom'

import AddGeneroForm from '../components/AddGeneroForm'

export default function AddGeneroPage({ generos = [], handleAddGenero, handleEditGenero }) {
	const [searchParams] = useSearchParams()
	const editId = searchParams.get('edit')
	const initialData = editId ? generos.find((g) => g.id === editId) : undefined
	const isEditing = Boolean(initialData)

	return (
		<section className="w-full p-8 md:p-12 flex flex-col gap-8 bg-transparent relative z-10">
			<div className="flex flex-col gap-2 max-w-xl mx-auto w-full">
				<h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
					{isEditing ? 'Editar Género' : 'Adicionar Género'}
				</h1>
				<p className="text-sm text-slate-500 dark:text-slate-400">
					{isEditing
						? 'Atualiza os dados do género selecionado e mantém o catálogo consistente.'
						: 'Cria um género para depois o associares a um ou mais DJs.'}
				</p>
			</div>

			<AddGeneroForm
				initialData={initialData}
				handleAddGenero={handleAddGenero}
				handleEditGenero={handleEditGenero}
			/>
		</section>
	)
}
