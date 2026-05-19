import { useParams } from 'react-router-dom'

import AddSetForm from '../components/AddSetForm'

export default function AddSetPage({ sets = [], handleAddSet, handleEditSet }) {
	const { id } = useParams()
	const initialData = id ? sets.find((set) => set.id === id) : undefined

	return (
		<section className="page-section">
			<div className="section-header">
				<p className="eyebrow">Entrada</p>
				<h1>{initialData ? 'Editar Set' : 'Adicionar Set'}</h1>
				<p>
					{initialData
						? 'Atualiza os dados do set selecionado através do formulário abaixo.'
						: 'Regista um novo set através do formulário abaixo.'}
				</p>
			</div>

			<div className="form-wrapper">
				<AddSetForm
					initialData={initialData}
					handleAddSet={handleAddSet}
					handleEditSet={handleEditSet}
				/>
			</div>
		</section>
	)
}