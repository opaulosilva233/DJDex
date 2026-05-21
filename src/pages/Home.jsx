import { Link } from 'react-router-dom'

export default function Home({ sets = [], djs = [], festivais = [] }) {
	const totalSets = sets.length
	const totalDjs = djs.length
	const totalFestivais = festivais.length

	return (
		<div className="page-section">
			<section className="section-header">
				<p className="eyebrow">DJDex</p>
				<h1>Bem-vindo ao DJDex</h1>
				<p>
					Guarda os teus sets, DJs e festivais num modelo relacional simples e navega entre os registos.
				</p>
			</section>

			<section className="action-grid">
				<Link className="action-card" to="/lista">
					<span>Ver Lista</span>
					<small>Consultar os {totalSets} sets guardados</small>
				</Link>
				<Link className="action-card" to="/estatisticas">
					<span>Estatísticas</span>
					<small>Explorar gráficos e métricas avançadas</small>
				</Link>
				<Link className="action-card" to="/adicionar">
					<span>Adicionar Set</span>
					<small>Registar um novo set na coleção</small>
				</Link>
				<Link className="action-card" to="/djs/adicionar">
					<span>Adicionar DJ</span>
					<small>Gerir {totalDjs} DJs com imagem local</small>
				</Link>
				<Link className="action-card" to="/festivais/adicionar">
					<span>Adicionar Festival</span>
					<small>Gerir {totalFestivais} festivais com imagem local</small>
				</Link>
			</section>
		</div>
	)
}