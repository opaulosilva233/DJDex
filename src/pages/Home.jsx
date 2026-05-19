import { Link } from 'react-router-dom'

function calculateAverageRating(sets) {
	const ratedSets = sets.filter(
		(set) => set.avaliacao !== null && set.avaliacao !== undefined,
	)

	if (ratedSets.length === 0) {
		return 0
	}

	const totalRating = ratedSets.reduce((sum, set) => sum + Number(set.avaliacao), 0)

	return totalRating / ratedSets.length
}

const pageStyle = {
	display: 'grid',
	gap: '24px',
}

const heroStyle = {
	padding: '32px',
	borderRadius: '24px',
	background: 'linear-gradient(180deg, rgba(12, 18, 35, 0.95) 0%, rgba(8, 12, 24, 0.88) 100%)',
	border: '1px solid rgba(255, 255, 255, 0.08)',
	boxShadow: '0 24px 80px rgba(0, 0, 0, 0.32)',
}

export default function Home({ sets }) {
	const averageRating = calculateAverageRating(sets)

	return (
		<div style={pageStyle}>
			<section style={heroStyle}>
				<p className="eyebrow">DJDex</p>
				<h1>RaveDex 🎧</h1>
				<p>
					Explora os sets guardados, acompanha estatísticas rápidas e navega entre
					as páginas principais da aplicação.
				</p>
			</section>

			<section
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
					gap: '16px',
				}}
			>
				<div className="glass-card">
					<p className="card-label">Total de Sets Vistos</p>
					<strong className="card-value">{sets.length}</strong>
				</div>
				<div className="glass-card">
					<p className="card-label">Média de Avaliações</p>
					<strong className="card-value">{averageRating.toFixed(1)}/10</strong>
				</div>
			</section>

			<section className="action-grid">
				<Link className="action-card" to="/lista">
					<span>Ver Lista</span>
					<small>Consultar todos os DJs guardados</small>
				</Link>
				<Link className="action-card" to="/adicionar">
					<span>Adicionar Set</span>
					<small>Registar um novo set na coleção</small>
				</Link>
			</section>
		</div>
	)
}