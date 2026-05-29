import { useParams } from 'react-router-dom'

import AddSetForm from '../components/AddSetForm'

export default function AddSetPage({ sets = [], djs = [], festivais = [], generos = [], handleAddSet, handleEditSet }) {
	const { id } = useParams()
	const initialData = id ? sets.find((set) => set.id === id) : undefined
	const isEditing = Boolean(initialData)

	return (
		<section className="relative z-10 w-full px-4 py-8 md:px-8 md:py-12">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
				<div className="flex flex-col gap-2">
					<h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
						{isEditing ? 'Editar Set' : 'Adicionar Novo Set'}
					</h1>
					<p className="text-sm text-slate-500 dark:text-slate-400">
						{isEditing
							? 'Atualiza os dados do set selecionado através do formulário abaixo.'
							: 'Regista um novo set através do formulário abaixo.'}
					</p>
				</div>

				<AddSetForm
					initialData={initialData}
					djs={djs}
					festivais={festivais}
					generos={generos}
					handleAddSet={handleAddSet}
					handleEditSet={handleEditSet}
				/>
			</div>
		</section>
	)
}