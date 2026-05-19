import DjCard from '../components/DjCard'

export default function SetList({ sets }) {
	return (
		<section className="page-section">
			<div className="section-header">
				<p className="eyebrow">Biblioteca</p>
				<h1>Lista de DJs</h1>
				<p>Todos os sets atualmente carregados na aplicação.</p>
			</div>

			<div className="sets-grid">
				{sets.map((set) => (
					<DjCard key={set.id} set={set} />
				))}
			</div>
		</section>
	)
}