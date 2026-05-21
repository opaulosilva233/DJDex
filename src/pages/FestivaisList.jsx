import { useNavigate } from 'react-router-dom'

export default function FestivaisList({ festivais = [], handleDeleteFestival }) {
  const navigate = useNavigate()

  return (
    <section className="page-section flex-1 min-h-0 overflow-y-auto pr-1">
      <div className="section-header flex items-center justify-between">
        <div>
          <p className="eyebrow dark:text-gray-400">Catálogo</p>
          <h1 className="dark:text-gray-100">Festivais</h1>
          <p className="dark:text-slate-300">Festivais registados na aplicação.</p>
        </div>
        <div>
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            onClick={() => navigate('/festivais/adicionar')}
          >
            Adicionar Festival
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {festivais.length === 0 && <p className="dark:text-slate-400">Ainda não existem festivais.</p>}
        <div className="grid gap-4">
          {festivais.map((f) => (
            <div key={f.id} className="glass-card flex items-center justify-between">
              <div>
                <h2 className="m-0 text-lg font-semibold dark:text-gray-100">{f.nome}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">{f.local} — {f.ano}</p>
              </div>
              <div>
                <button type="button" onClick={() => handleDeleteFestival && handleDeleteFestival(f.id)} className="text-red-600">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
