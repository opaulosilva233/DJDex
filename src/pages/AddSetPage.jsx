import { useParams } from 'react-router-dom'

import AddSetForm from '../components/AddSetForm'

export default function AddSetPage({ sets = [], handleAddSet, handleEditSet }) {
	const { id } = useParams()
	const initialData = id ? sets.find((set) => set.id === id) : undefined

	return (
		<section
			className="page-section h-full w-full min-h-0 flex flex-col overflow-hidden"
			style={{ display: 'flex' }}
		>
			<div className="section-header shrink-0">
				<p className="eyebrow dark:text-gray-400">Entrada</p>
				<h1 className="dark:text-gray-100">{initialData ? 'Editar Set' : 'Adicionar Set'}</h1>
				<p className="dark:text-slate-300">
					{initialData
						? 'Atualiza os dados do set selecionado através do formulário abaixo.'
						: 'Regista um novo set através do formulário abaixo.'}
				</p>
			</div>

			<div className="form-wrapper w-full flex-1 min-h-0 overflow-y-auto pr-1">
				<AddSetForm
					initialData={initialData}
					handleAddSet={handleAddSet}
					handleEditSet={handleEditSet}
				/>
			</div>
		</section>
	)
}