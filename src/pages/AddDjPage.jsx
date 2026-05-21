import { useSearchParams } from 'react-router-dom'

import AddDjForm from '../components/AddDjForm'


export default function AddDjPage({ djs = [], handleAddDj, handleEditDj, generos = [] }) {
	const [searchParams] = useSearchParams()
	const editId = searchParams.get('edit')
	const initialData = editId ? djs.find((dj) => dj.id === editId) : undefined
	const isEditing = Boolean(initialData)

	return (
		<section className="page-section h-full w-full min-h-0 flex flex-col overflow-hidden">
			<div className="section-header shrink-0">
				<p className="eyebrow dark:text-gray-400">Catálogo</p>
				<h1 className="dark:text-gray-100">{isEditing ? 'Editar DJ' : 'Adicionar DJ'}</h1>
				<p className="dark:text-slate-300">
					{isEditing
						? 'Atualiza os dados do DJ selecionado através do formulário abaixo.'
						: 'Cria uma entidade de DJ para depois associar aos sets.'}
				</p>
			</div>

			<div className="form-wrapper w-full flex-1 min-h-0 overflow-y-auto pr-1">
				<AddDjForm
					initialData={initialData}
					handleAddDj={handleAddDj}
					handleEditDj={handleEditDj}
					generos={generos}
				/>
			</div>
		</section>
	)
}