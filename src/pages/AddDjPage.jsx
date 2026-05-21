import AddDjForm from '../components/AddDjForm'

export default function AddDjPage({ handleAddDj }) {
	return (
		<section className="page-section h-full w-full min-h-0 flex flex-col overflow-hidden">
			<div className="section-header shrink-0">
				<p className="eyebrow dark:text-gray-400">Catálogo</p>
				<h1 className="dark:text-gray-100">Adicionar DJ</h1>
				<p className="dark:text-slate-300">Cria uma entidade de DJ para depois associar aos sets.</p>
			</div>

			<div className="form-wrapper w-full flex-1 min-h-0 overflow-y-auto pr-1">
				<AddDjForm handleAddDj={handleAddDj} />
			</div>
		</section>
	)
}