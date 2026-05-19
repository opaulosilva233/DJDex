export default function DjCard({ set }) {
  return (
    <div
      style={{
        border: '1px solid #d9d9d9',
        padding: '16px',
        borderRadius: '12px',
        width: '280px',
        boxSizing: 'border-box',
      }}
    >
      <h2 style={{ marginTop: 0 }}>{set.nome}</h2>
      <p><strong>Festival:</strong> {set.festival}</p>
      <p><strong>Local:</strong> {set.local}</p>
      <p><strong>Data:</strong> {set.data}</p>
      <p><strong>Hora:</strong> {set.hora}</p>
      {set.avaliacao !== undefined && set.avaliacao !== null && (
        <p>⭐ {set.avaliacao}/10</p>
      )}
    </div>
  )
}