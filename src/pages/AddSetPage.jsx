import AddSetForm from '../components/AddSetForm'

export default function AddSetPage({ handleAddSet }) {
	return (
		<section className="page-section">
			<div className="section-header">
				<p className="eyebrow">Entrada</p>
				<h1>Adicionar Set</h1>
				<p>Regista um novo set através do formulário abaixo.</p>
			</div>

			<div className="form-wrapper">
				<AddSetForm onAddSet={handleAddSet} />
			</div>
		</section>
	)
}