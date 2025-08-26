export default async function BillingPage(){
  // TODO: puxar dados reais quando a tabela existir
  const items: any[] = [];

  return (
    <div className="card" style={{padding:16}}>
      <div className="card-head">
        <h1 style={{margin:0}}>Pagamentos</h1>
        <div className="toolbar">
          <button className="btn chip" aria-pressed="true">Todos</button>
          <button className="btn chip" aria-pressed="false">Recebidos</button>
          <button className="btn chip" aria-pressed="false">Pendentes</button>
          <button className="btn chip" aria-pressed="false">Reembolsos</button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="muted" style={{padding:'20px 8px'}}>
          Ainda não há pagamentos.
        </div>
      ) : (
        <table className="table" style={{width:'100%', borderCollapse:'separate', borderSpacing:0}}>
          {/* …quando houver dados, render aqui… */}
        </table>
      )}
    </div>
  );
}
