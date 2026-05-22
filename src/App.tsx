import React, { useState, useEffect } from 'react';
import { Calculator, AlertCircle, CheckCircle2, TrendingUp, CreditCard, Home, CarFront, Settings, Pencil, Check, LayoutDashboard, Wallet, Layers, Trash2, PlusCircle } from 'lucide-react';

type GanhoDiario = {
  id: string;
  data: string;
  app: string;
  valor: number;
};
import { cn } from './lib/utils';

const faturasNubank: Record<string, number> = {
  junho: 139.98,
  julho: 271.67,
  agosto: 271.67,
  setembro: 0.00,
  outubro: 0.00
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Ganhos Diários
  const [ganhosDiarios, setGanhosDiarios] = useState<GanhoDiario[]>([]);
  const [novoGanhoData, setNovoGanhoData] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [novoGanhoApp, setNovoGanhoApp] = useState('Uber');
  const [novoGanhoValor, setNovoGanhoValor] = useState(0);

  // Config
  const entradaBruta = ganhosDiarios.reduce((acc, ganho) => acc + ganho.valor, 0);
  const [descontoPct, setDescontoPct] = useState(10.0);
  const [mesRef, setMesRef] = useState('junho');

  // Casa
  const [casaAluguel, setCasaAluguel] = useState(950.00);
  const [casaConect, setCasaConect] = useState(79.99);
  const [casaVivo, setCasaVivo] = useState(53.00);
  const [casaTim, setCasaTim] = useState(20.00);
  const [casaPensao, setCasaPensao] = useState(729.45);
  const [casaBarbeiro, setCasaBarbeiro] = useState(105.00);
  const [casaCompra, setCasaCompra] = useState(850.00);
  const [casaLuz, setCasaLuz] = useState(169.44);

  // Moto
  const [motoParcela, setMotoParcela] = useState(980.00);
  const [motoPrestacao, setMotoPrestacao] = useState(1093.55);
  const [motoSeguro, setMotoSeguro] = useState(175.20);
  const [motoCombustivel, setMotoCombustivel] = useState(312.00);
  const [motoOleo, setMotoOleo] = useState(59.90);
  const [motoFiltro, setMotoFiltro] = useState(16.90);

  // Crédito
  const [cartaoNubank, setCartaoNubank] = useState(139.98);
  const [lisePrincipal, setLisePrincipal] = useState(410.00);
  const [liseJurosPct, setLiseJurosPct] = useState(8.00);
  const [liseDias, setLiseDias] = useState(14);
  const [liseIof, setLiseIof] = useState(3.10);

  // Update Nubank and Moto Parcela on month change
  useEffect(() => {
    if (faturasNubank[mesRef] !== undefined) {
      setCartaoNubank(faturasNubank[mesRef]);
    }
    
    const validMonths = ['junho', 'julho', 'agosto', 'setembro', 'outubro'];
    if (!validMonths.includes(mesRef)) {
      setMotoParcela(0);
    } else {
      setMotoParcela(980);
    }
  }, [mesRef]);

  // Calculations
  const entradaLiquida = entradaBruta * (1 - (descontoPct / 100));
  const totalCasa = casaAluguel + casaConect + casaVivo + casaTim + casaPensao + casaBarbeiro + casaCompra + casaLuz;
  const totalMoto = motoParcela + motoPrestacao + motoSeguro + motoCombustivel + motoOleo + motoFiltro;
  
  const jurosCalculado = (lisePrincipal * (liseJurosPct / 100) / 30) * liseDias;
  const totalEncargosLise = jurosCalculado + liseIof;
  
  const totalCustosGerais = totalCasa + totalMoto + cartaoNubank + lisePrincipal + totalEncargosLise;
  const saldoFinal = entradaLiquida - totalCustosGerais;
  const inProfit = saldoFinal >= 0;

  const adicionarGanhoDoDia = () => {
    if (!novoGanhoData || novoGanhoValor <= 0) return;
    const novo: GanhoDiario = {
      id: Math.random().toString(36).substr(2, 9),
      data: novoGanhoData,
      app: novoGanhoApp,
      valor: novoGanhoValor
    };
    setGanhosDiarios([novo, ...ganhosDiarios]);
    setNovoGanhoValor(0);
  };

  const deletarGanho = (id: string) => {
    setGanhosDiarios(ganhosDiarios.filter(g => g.id !== id));
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const InputField = ({ label, value, onChange, readOnly = false, highlight = false }: any) => {
    let formatType = 'currency';
    if (label.includes('%')) formatType = 'percentage';
    if (label.includes('Dias')) formatType = 'integer';

    const numericValue = typeof value === 'string' ? parseFloat(value) : (value || 0);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(numericValue.toString());

    const formatValue = (val: number) => {
      if (isNaN(val)) return '0';
      if (formatType === 'currency') {
         let v = val.toFixed(2).replace(".", ",");
         v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
         return v;
      }
      return val.toString(); 
    };

    const handleEditClick = () => {
       if (readOnly) return;
       setIsEditing(true);
       setEditValue(numericValue.toString());
       setTimeout(() => {
          document.getElementById(`input-${label.replace(/\s+/g, '-')}`)?.focus();
       }, 50);
    };

    const handleBlur = () => {
       setIsEditing(false);
       if (editValue.trim() !== '') {
          const parsed = parseFloat(editValue);
          onChange && onChange(isNaN(parsed) ? 0 : parsed);
       } else {
          onChange && onChange(0);
       }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleBlur();
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
       setEditValue(e.target.value);
    };

    // Calculate display values based on mode
    const inputValue = isEditing ? editValue : formatValue(numericValue);
    const showPrefix = formatType === 'currency' && !isEditing;
    const showSuffix = formatType === 'percentage' && !isEditing;

    return (
      <div className="flex flex-col">
        <label className="text-xs text-[#8a99ad] mb-1 font-medium flex justify-between items-center">
          {label}
        </label>
        <div className="relative group">
          {showPrefix && <span className="absolute left-3 top-2.5 text-[#8a99ad] text-sm font-medium z-10 transition-opacity duration-200">R$</span>}
          <input 
            id={`input-${label.replace(/\s+/g, '-')}`}
            type={isEditing ? "number" : "text"}
            step={formatType === 'integer' ? "1" : "0.01"}
            value={inputValue}
            onChange={readOnly ? undefined : handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onClick={!isEditing && !readOnly ? handleEditClick : undefined}
            readOnly={readOnly || !isEditing}
            className={cn(
              "w-full bg-white/5 border border-white/10 rounded-lg text-[#f5f5f7] p-2 text-sm outline-none transition-all focus:border-[#00e5ff] focus:shadow-[0_0_8px_rgba(0,229,255,0.4)]",
              showPrefix ? "pl-9" : "",
              showSuffix ? "pr-8" : "",
              readOnly ? "bg-black/40 text-slate-400 cursor-not-allowed" : (!isEditing ? "cursor-pointer hover:bg-white/10" : "bg-[#141828]"),
              highlight && "text-[#ff3366] bg-[#ff3366]/10 border-[#ff3366]/30 font-bold",
              isEditing && "border-[#00e5ff] shadow-[0_0_8px_rgba(0,229,255,0.4)] [&::-webkit-inner-spin-button]:appearance-none"
            )}
          />
          {showSuffix && <span className="absolute right-3 top-2.5 text-[#8a99ad] text-sm font-medium z-10">%</span>}
          
          {!readOnly && (
            <button 
              type="button"
              onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
              onClick={(e) => {
                e.preventDefault();
                isEditing ? handleBlur() : handleEditClick();
              }}
              className={cn(
                "absolute right-2 top-2 p-1 rounded-md transition-colors",
                showSuffix ? "right-8" : "",
                isEditing ? "text-[#00e5ff] bg-[#00e5ff]/10" : "text-[#8a99ad] opacity-60 hover:opacity-100 hover:text-white hover:bg-white/10"
              )}
            >
              {isEditing ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-[#0d0e15] text-[#f5f5f7] p-4 font-sans selection:bg-[#00e5ff] selection:text-black pb-20">
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* Header */}
        <div className="bg-[#141828]/65 backdrop-blur-md border border-[#00e5ff]/20 rounded-2xl p-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
          <h1 className="text-2xl font-bold text-[#00e5ff] tracking-wide drop-shadow-[0_0_8px_rgba(0,229,255,0.5)] flex items-center justify-center gap-3">
            <Calculator className="w-6 h-6" />
            ELITE FINANCEIRO v3.0
          </h1>
          <p className="text-sm text-[#8a99ad] mt-2 font-medium">Controle Operacional & Ponto de Equilíbrio</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#141828]/65 backdrop-blur-md border border-[#00e5ff]/20 rounded-xl p-1 gap-1 overflow-x-auto shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn("flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center whitespace-nowrap", activeTab === 'dashboard' ? "bg-[#00e5ff]/10 text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.2)]" : "text-[#8a99ad] hover:text-[#00e5ff] hover:bg-white/5")}
          >
            <LayoutDashboard className="w-4 h-4" /> Configuração & Status
          </button>
          <button 
            onClick={() => setActiveTab('gastos')}
            className={cn("flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center whitespace-nowrap", activeTab === 'gastos' ? "bg-[#00e5ff]/10 text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.2)]" : "text-[#8a99ad] hover:text-[#00e5ff] hover:bg-white/5")}
          >
            <Layers className="w-4 h-4" /> Casa & Moto
          </button>
          <button 
            onClick={() => setActiveTab('credito')}
            className={cn("flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 justify-center whitespace-nowrap", activeTab === 'credito' ? "bg-[#00e5ff]/10 text-[#00e5ff] shadow-[0_0_10px_rgba(0,229,255,0.2)]" : "text-[#8a99ad] hover:text-[#00e5ff] hover:bg-white/5")}
          >
            <Wallet className="w-4 h-4" /> Crédito & Lise
          </button>
        </div>

        {/* Tab Content: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Lançamentos Diários */}
            <div className="bg-[#141828]/65 backdrop-blur-md border border-[#00e5ff]/20 rounded-2xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
              <h2 className="text-lg font-bold text-[#00e5ff] border-b border-[#00e5ff]/20 pb-2 mb-4 drop-shadow-[0_0_8px_rgba(0,229,255,0.5)] flex items-center gap-2">
                <PlusCircle className="w-5 h-5" />
                Lançamento Diário de Ganhos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                <div className="flex flex-col">
                  <label className="text-xs text-[#8a99ad] mb-1 font-medium">Data (DD/MM/AAAA)</label>
                  <input 
                    type="date" 
                    value={novoGanhoData}
                    onChange={(e) => setNovoGanhoData(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg text-[#f5f5f7] p-2 text-sm outline-none transition-all focus:border-[#00e5ff] focus:shadow-[0_0_8px_rgba(0,229,255,0.4)]"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-xs text-[#8a99ad] mb-1 font-medium">Origem / App</label>
                  <select 
                    value={novoGanhoApp}
                    onChange={(e) => setNovoGanhoApp(e.target.value)}
                    className="w-full bg-[#141828] border border-white/10 rounded-lg text-[#f5f5f7] p-2 text-sm outline-none transition-all focus:border-[#00e5ff] focus:shadow-[0_0_8px_rgba(0,229,255,0.4)]"
                  >
                    <option value="Uber">Uber</option>
                    <option value="99">99 App</option>
                    <option value="iFood">iFood</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <InputField label="Valor Feito (R$)" value={novoGanhoValor} onChange={setNovoGanhoValor} />
                <button 
                  onClick={adicionarGanhoDoDia}
                  className="w-full bg-gradient-to-r from-[#00ff66] to-[#00aa50] border-none rounded-lg text-black p-2 font-bold cursor-pointer hover:shadow-[0_0_15px_rgba(0,255,102,0.4)] transition-all h-[38px] flex items-center justify-center"
                >
                  Inserir
                </button>
              </div>

              {ganhosDiarios.length > 0 && (
                <div className="mt-4 max-h-[150px] overflow-y-auto border border-white/5 rounded-lg bg-black/20">
                  {ganhosDiarios.map((ganho) => (
                    <div key={ganho.id} className="flex justify-between items-center p-2.5 text-sm border-b border-white/5 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[#8a99ad]">{ganho.data.split('-').reverse().join('/')}</span>
                        <span className="font-medium px-2 py-0.5 rounded-full bg-white/5 text-xs border border-white/10">{ganho.app}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#f5f5f7]">{formatCurrency(ganho.valor)}</span>
                        <button 
                          onClick={() => deletarGanho(ganho.id)}
                          className="text-[#ff3366] hover:text-[#ff3366] hover:bg-[#ff3366]/10 p-1 rounded transition-colors"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Configurações */}
            <div className="bg-[#141828]/65 backdrop-blur-md border border-[#00e5ff]/20 rounded-2xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
              <h2 className="text-lg font-bold text-[#00e5ff] border-b border-[#00e5ff]/20 pb-2 mb-4 drop-shadow-[0_0_8px_rgba(0,229,255,0.5)] flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configuração Operacional
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <InputField label="Entrada Bruta Acumulada" value={entradaBruta} readOnly onChange={() => {}} />
                <InputField label="Desconto Bruto (%)" value={descontoPct} onChange={setDescontoPct} />
                <div className="flex flex-col">
                  <label className="text-xs text-[#8a99ad] mb-1 font-medium">Mês de Referência</label>
                  <select 
                    value={mesRef}
                    onChange={(e) => setMesRef(e.target.value)}
                    className="w-full bg-[#141828] border border-white/10 rounded-lg text-[#f5f5f7] p-2 text-sm outline-none transition-all focus:border-[#00e5ff] focus:shadow-[0_0_8px_rgba(0,229,255,0.4)]"
                  >
                    <option value="junho">Junho / 2026</option>
                    <option value="julho">Julho / 2026</option>
                    <option value="agosto">Agosto / 2026</option>
                    <option value="setembro">Setembro / 2026</option>
                    <option value="outubro">Outubro / 2026</option>
                    <option value="novembro">Novembro / 2026</option>
                    <option value="dezembro">Dezembro / 2026</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dashboards */}
            <div className="bg-[#141828]/65 backdrop-blur-md border border-[#00e5ff]/20 rounded-2xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
              <h2 className="text-lg font-bold text-[#00e5ff] border-b border-[#00e5ff]/20 pb-2 mb-4 drop-shadow-[0_0_8px_rgba(0,229,255,0.5)] flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Status do Ponto de Equilíbrio
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div className="bg-white/5 border-l-4 border-[#ff3366] p-4 rounded-md">
                  <div className="text-xs text-[#8a99ad] font-medium">Total Custo Operacional</div>
                  <div className="text-xl font-bold mt-1 text-white">{formatCurrency(totalCustosGerais)}</div>
                </div>
                <div className="bg-white/5 border-l-4 border-[#00ff66] p-4 rounded-md">
                  <div className="text-xs text-[#8a99ad] font-medium">Entrada Líquida Atual</div>
                  <div className="text-xl font-bold mt-1 text-[#00ff66]">{formatCurrency(entradaLiquida)}</div>
                </div>
              </div>

              <div className={cn("bg-white/5 border-l-4 p-4 rounded-md", inProfit ? "border-[#00ff66]" : "border-[#ff3366]")}>
                 <div className="text-xs text-[#8a99ad] font-medium">Resultado Atual para Alcançar a Meta</div>
                 <div className={cn("text-xl font-bold mt-1", inProfit ? "text-[#00ff66]" : "text-[#ff3366]")}>
                   {inProfit ? (
                     <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Meta Atingida! Lucro Líquido: {formatCurrency(saldoFinal)}</span>
                   ) : (
                     <span className="flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Faltam {formatCurrency(Math.abs(saldoFinal))} p/ o Ponto de Equilíbrio</span>
                   )}
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Gastos Fixos de Casa e Moto */}
        {activeTab === 'gastos' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Casa */}
            <div className="bg-[#141828]/65 backdrop-blur-md border border-[#00e5ff]/20 rounded-2xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
              <h2 className="text-lg font-bold text-[#00e5ff] border-b border-[#00e5ff]/20 pb-2 mb-4 drop-shadow-[0_0_8px_rgba(0,229,255,0.5)] flex items-center gap-2">
                <Home className="w-5 h-5" />
                Gastos Fixos de Casa
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4">
                <InputField label="Aluguel (29)" value={casaAluguel} onChange={setCasaAluguel} />
                <InputField label="Conect (20)" value={casaConect} onChange={setCasaConect} />
                <InputField label="Vivo (10)" value={casaVivo} onChange={setCasaVivo} />
                <InputField label="Tim" value={casaTim} onChange={setCasaTim} />
                <InputField label="Pensão (10)" value={casaPensao} onChange={setCasaPensao} />
                <InputField label="Barbeiro (5)" value={casaBarbeiro} onChange={setCasaBarbeiro} />
                <InputField label="Compra Mês (7)" value={casaCompra} onChange={setCasaCompra} />
                <InputField label="Luz (15)" value={casaLuz} onChange={setCasaLuz} />
              </div>
            </div>

            {/* Moto */}
            <div className="bg-[#141828]/65 backdrop-blur-md border border-[#00e5ff]/20 rounded-2xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
              <h2 className="text-lg font-bold text-[#00e5ff] border-b border-[#00e5ff]/20 pb-2 mb-4 drop-shadow-[0_0_8px_rgba(0,229,255,0.5)] flex items-center gap-2">
                <CarFront className="w-5 h-5" />
                Gastos com a Moto
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-4 mb-3">
                 <InputField label="Parcela Entrada" value={motoParcela} onChange={setMotoParcela} />
                 <InputField label="Prestação (8)" value={motoPrestacao} onChange={setMotoPrestacao} />
                 <InputField label="Seguro (20)" value={motoSeguro} onChange={setMotoSeguro} />
                 <InputField label="Combustível (Mês)" value={motoCombustivel} onChange={setMotoCombustivel} />
                 <InputField label="Óleo Yamalube" value={motoOleo} onChange={setMotoOleo} />
                 <InputField label="Filtro Moto" value={motoFiltro} onChange={setMotoFiltro} />
              </div>
              <p className="text-[#8a99ad] text-xs italic mt-4">* Combustível baseado em R$6,50/L no Posto Shell (12L por semana).</p>
            </div>
          </div>
        )}

        {/* Tab Content: Crédito */}
        {activeTab === 'credito' && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-[#141828]/65 backdrop-blur-md border border-[#00e5ff]/20 rounded-2xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
              <h2 className="text-lg font-bold text-[#00e5ff] border-b border-[#00e5ff]/20 pb-2 mb-4 drop-shadow-[0_0_8px_rgba(0,229,255,0.5)] flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Cartão Nubank & Lise Santander
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-4">
                <InputField label="Nubank Fatura" value={cartaoNubank} onChange={setCartaoNubank} />
                <InputField label="Santander Lise (Uso)" value={lisePrincipal} onChange={setLisePrincipal} />
                <InputField label="Juros Lise (Mês %)" value={liseJurosPct} onChange={setLiseJurosPct} />
                <InputField label="Dias de Uso Lise" value={liseDias} onChange={setLiseDias} />
                <InputField label="IOF Fixo R$" value={liseIof} onChange={setLiseIof} />
                <InputField label="Total Encargos Lise" value={totalEncargosLise.toFixed(2)} readOnly highlight />
              </div>
              <p className="text-[#8a99ad] text-xs italic mt-6">* A fatura do Nubank é atualizada automaticamente com base no mês de referência na aba de configurações.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
