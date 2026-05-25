import React, { useState, useEffect } from 'react';
import { Calculator, AlertCircle, CheckCircle2, TrendingUp, CreditCard, Home, CarFront, Settings, Pencil, Check, LayoutDashboard, Wallet, Layers, Trash2, PlusCircle, Lock, LogOut } from 'lucide-react';

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

const formatCurrency = (val: number) => {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const InputField = ({ label, value, onChange, readOnly = false, highlight = false, formatType: overrideFormatType }: any) => {
  let formatType = overrideFormatType || 'currency';
  if (label.includes('%')) formatType = 'percentage';
  if (label.includes('Dias')) formatType = 'integer';

  const numericValue = typeof value === 'string' ? parseFloat(value) : (value || 0);

  const formatValue = (val: number) => {
    if (isNaN(val) || val === 0) return '';
    if (formatType === 'currency') {
       let v = val.toFixed(2).replace(".", ",");
       v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
       return v;
    }
    return val.toString(); 
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const raw = e.target.value;
     
     if (raw === '') {
       onChange && onChange(0);
       return;
     }

     if (formatType === 'currency') {
       const digits = raw.replace(/\D/g, '');
       const num = parseInt(digits || '0', 10) / 100;
       onChange && onChange(isNaN(num) ? 0 : num);
     } else if (formatType === 'percentage' || formatType === 'integer') {
       const cleaned = raw.replace(/[^\d.-]/g, '');
       onChange && onChange(parseFloat(cleaned) || 0);
     } else {
       const cleaned = raw.replace(',', '.').replace(/[^\d.-]/g, '');
       onChange && onChange(parseFloat(cleaned) || 0);
     }
  };

  const inputValue = formatValue(numericValue);
  const showPrefix = formatType === 'currency';
  const showSuffix = formatType === 'percentage';

  return (
    <div className="flex flex-col w-full relative">
      <label className="text-xs text-[#8a99ad] mb-1 font-medium flex justify-between items-center">
        {label}
      </label>
      <div className="relative group flex items-center">
        {showPrefix && <span className="absolute left-3 text-[#8a99ad] text-sm font-medium z-10 transition-opacity duration-200">R$</span>}
        <input 
          type="text"
          inputMode={formatType === 'currency' ? 'numeric' : 'decimal'}
          value={inputValue}
          onChange={readOnly ? undefined : handleChange}
          readOnly={readOnly}
          placeholder={formatType === 'currency' ? "0,00" : "0"}
          className={cn(
            "w-full bg-[#141828] border border-white/10 rounded-lg text-[#f5f5f7] p-2 text-sm outline-none transition-all focus:border-[#00e5ff] focus:shadow-[0_0_8px_rgba(0,229,255,0.4)]",
            showPrefix ? "pl-9" : "",
            showSuffix ? "pr-8" : "",
            readOnly ? "bg-black/40 text-slate-400 cursor-not-allowed border-transparent" : "hover:border-white/20",
            highlight && "text-[#ff0055] font-bold"
          )}
        />
        {showSuffix && <span className="absolute right-3 text-[#8a99ad] text-sm font-medium z-10">%</span>}
      </div>
    </div>
  );
};

const ExpenseInput = ({ label, valor, onChangeValor, dia, onChangeDia, isReadOnly = false }: any) => (
  <div className="flex gap-2 w-full">
    <div className="flex-[2]">
      <InputField label={label} value={valor} onChange={onChangeValor} readOnly={isReadOnly} />
    </div>
    {dia !== undefined && (
      <div className="flex-[1] min-w-[70px]">
        <InputField label="Dia" value={dia} onChange={onChangeDia} formatType="integer" />
      </div>
    )}
  </div>
);

export default function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recovery'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Ganhos Diários
  const [ganhosDiarios, setGanhosDiarios] = useState<GanhoDiario[]>([
    { id: 'initial-ifood-saldo', data: (() => { const d = new Date(); return d.toISOString().split('T')[0]; })(), app: 'iFood', valor: 414.31 }
  ]);
  const [novoGanhoAppData, setNovoGanhoAppData] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [novoGanhoOutroData, setNovoGanhoOutroData] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  
  const [novoGanhoApp, setNovoGanhoApp] = useState('Uber');
  const [novoGanhoAppValor, setNovoGanhoAppValor] = useState(0);

  const [novoGanhoOutroDesc, setNovoGanhoOutroDesc] = useState('');
  const [novoGanhoOutroValor, setNovoGanhoOutroValor] = useState(0);

  // Config
  const entradaBruta = ganhosDiarios.reduce((acc, ganho) => acc + ganho.valor, 0);
  const [descontoPct, setDescontoPct] = useState(10.0);
  const [mesRef, setMesRef] = useState('junho');

  // Casa
  const [casaAluguel, setCasaAluguel] = useState(950.00);
  const [casaAluguelDia, setCasaAluguelDia] = useState(29);
  const [casaConect, setCasaConect] = useState(79.99);
  const [casaConectDia, setCasaConectDia] = useState(20);
  const [casaVivo, setCasaVivo] = useState(53.00);
  const [casaVivoDia, setCasaVivoDia] = useState(10);
  const [casaTim, setCasaTim] = useState(20.00);
  const [casaTimDia, setCasaTimDia] = useState(10);
  const [casaPensao, setCasaPensao] = useState(729.45);
  const [casaPensaoDia, setCasaPensaoDia] = useState(10);
  const [casaBarbeiro, setCasaBarbeiro] = useState(105.00);
  const [casaBarbeiroDia, setCasaBarbeiroDia] = useState(5);
  const [casaCompra, setCasaCompra] = useState(850.00);
  const [casaCompraDia, setCasaCompraDia] = useState(7);
  const [casaLuz, setCasaLuz] = useState(169.44);
  const [casaLuzDia, setCasaLuzDia] = useState(15);

  // Moto
  const [motoParcela, setMotoParcela] = useState(980.00);
  const [motoParcelaDia, setMotoParcelaDia] = useState(5);
  const [motoPrestacao, setMotoPrestacao] = useState(1093.55);
  const [motoPrestacaoDia, setMotoPrestacaoDia] = useState(8);
  const [motoSeguro, setMotoSeguro] = useState(175.20);
  const [motoSeguroDia, setMotoSeguroDia] = useState(20);
  const [motoLitrosSemana, setMotoLitrosSemana] = useState(12);
  const [motoPrecoLitro, setMotoPrecoLitro] = useState(6.50);
  const motoCombustivel = motoLitrosSemana * 4 * motoPrecoLitro;
  const [motoCombustivelDia, setMotoCombustivelDia] = useState(30);
  const [motoOleo, setMotoOleo] = useState(59.90);
  const [motoOleoDia, setMotoOleoDia] = useState(30);
  const [motoFiltro, setMotoFiltro] = useState(16.90);
  const [motoFiltroDia, setMotoFiltroDia] = useState(30);

  // Crédito
  const [cartaoNubank, setCartaoNubank] = useState(139.98);
  const [cartaoNubankDia, setCartaoNubankDia] = useState(10);
  const [lisePrincipal, setLisePrincipal] = useState(410.00);
  const [liseSantanderDia, setLiseSantanderDia] = useState(15);
  const [liseJurosPct, setLiseJurosPct] = useState(8.00);
  const [liseDias, setLiseDias] = useState(14);
  const [liseIof, setLiseIof] = useState(3.10);

  // Effect for Mes Ref
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

  const adicionarGanhoApp = () => {
    if (!novoGanhoAppData || novoGanhoAppValor <= 0) {
      alert("Preencha o valor do aplicativo!");
      return;
    }
    const novo: GanhoDiario = {
      id: Math.random().toString(36).substr(2, 9),
      data: novoGanhoAppData,
      app: novoGanhoApp,
      valor: novoGanhoAppValor
    };
    setGanhosDiarios([novo, ...ganhosDiarios]);
    setNovoGanhoAppValor(0);
  };

  const adicionarGanhoOutro = () => {
    if (!novoGanhoOutroData || novoGanhoOutroValor <= 0 || !novoGanhoOutroDesc.trim()) {
      alert("Preencha a descrição e o valor da entrada!");
      return;
    }
    const novo: GanhoDiario = {
      id: Math.random().toString(36).substr(2, 9),
      data: novoGanhoOutroData,
      app: novoGanhoOutroDesc,
      valor: novoGanhoOutroValor
    };
    setGanhosDiarios([novo, ...ganhosDiarios]);
    setNovoGanhoOutroValor(0);
    setNovoGanhoOutroDesc('');
  };

  const deletarGanho = (id: string) => {
    setGanhosDiarios(ganhosDiarios.filter(g => g.id !== id));
  };

  const hoje = new Date();
  const listaGastos = [
    { id: 'moto_prestacao', nome: 'Prestação Moto', valorTotal: motoPrestacao, diaVencimento: motoPrestacaoDia },
    { id: 'casa_aluguel', nome: 'Aluguel', valorTotal: casaAluguel, diaVencimento: casaAluguelDia },
    { id: 'casa_conect', nome: 'Conect', valorTotal: casaConect, diaVencimento: casaConectDia },
    { id: 'casa_vivo', nome: 'Vivo', valorTotal: casaVivo, diaVencimento: casaVivoDia },
    { id: 'casa_tim', nome: 'Tim', valorTotal: casaTim, diaVencimento: casaTimDia },
    { id: 'casa_pensao', nome: 'Pensão', valorTotal: casaPensao, diaVencimento: casaPensaoDia },
    { id: 'casa_barbeiro', nome: 'Barbeiro', valorTotal: casaBarbeiro, diaVencimento: casaBarbeiroDia },
    { id: 'casa_compra', nome: 'Compra Mês', valorTotal: casaCompra, diaVencimento: casaCompraDia },
    { id: 'casa_luz', nome: 'Luz', valorTotal: casaLuz, diaVencimento: casaLuzDia },
    { id: 'moto_seguro', nome: 'Seguro Moto', valorTotal: motoSeguro, diaVencimento: motoSeguroDia },
    { id: 'cartao_nubank', nome: 'Nubank Fatura', valorTotal: cartaoNubank, diaVencimento: cartaoNubankDia },
    { id: 'lise_santander', nome: 'Santander Lise', valorTotal: lisePrincipal + totalEncargosLise, diaVencimento: liseSantanderDia },
    { id: 'moto_parcela_entrada', nome: 'Parcela Entrada', valorTotal: motoParcela, diaVencimento: motoParcelaDia },
    { id: 'moto_combustivel', nome: 'Combustível', valorTotal: motoCombustivel, diaVencimento: motoCombustivelDia },
    { id: 'moto_oleo', nome: 'Troca de Óleo', valorTotal: motoOleo, diaVencimento: motoOleoDia },
    { id: 'moto_filtro', nome: 'Filtro Moto', valorTotal: motoFiltro, diaVencimento: motoFiltroDia }
  ].filter(g => g.valorTotal > 0);

  const gastosCascata = listaGastos.map(gasto => {
     let dataVencimento = new Date(hoje.getFullYear(), hoje.getMonth(), gasto.diaVencimento);
     if (dataVencimento < hoje) {
        dataVencimento.setMonth(dataVencimento.getMonth() + 1);
     }
     let diferencaTempo = dataVencimento.getTime() - hoje.getTime();
     let faltaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));
     if (faltaDias <= 0) faltaDias = 1;
     return { ...gasto, dataVencimento, faltaDias, valorPago: 0 };
  }).sort((a, b) => a.faltaDias - b.faltaDias);

  let saldoCascata = entradaLiquida;
  gastosCascata.forEach(gasto => {
      if (saldoCascata >= gasto.valorTotal) {
          gasto.valorPago = gasto.valorTotal;
          saldoCascata -= gasto.valorTotal;
      } else {
          gasto.valorPago = saldoCascata;
          saldoCascata = 0;
      }
  });



  const executarLoginComum = () => {
    if (!authEmail) {
      alert('Por favor, informe seu e-mail corporativo ou pessoal.');
      return;
    }

    if (authMode === 'recovery') {
      alert('Instruções de redefinição enviadas para o e-mail informado!');
      setAuthMode('login');
    } else if (authMode === 'register') {
      alert('Conta criada com sucesso! Realize o acesso.');
      setAuthMode('login');
    } else {
      setIsAuthenticated(true);
    }
  };

  const simularLoginGoogle = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#05070f] flex justify-center items-center p-5 font-sans text-[#f5f5f7]">
        <div className="w-full max-w-[380px] bg-white/5 backdrop-blur-xl border border-[#00e5ff]/25 rounded-2xl p-6 text-center shadow-[0_4px_30px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-500">
          <h1 className="text-2xl font-bold text-[#00e5ff] tracking-wide drop-shadow-[0_0_8px_rgba(0,229,255,0.5)] mb-2">
            {authMode === 'login' ? 'ELITE LOGIN' : authMode === 'register' ? 'CRIAR CONTA' : 'RECUPERAR SENHA'}
          </h1>
          <p className="text-sm text-[#8a99ad] mb-6">Acesse o ecossistema financeiro v3.0</p>
          
          <div className="flex flex-col mb-3 text-left">
            <label className="text-xs text-[#8a99ad] mb-1 font-medium">E-mail</label>
            <input 
              type="email" 
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              placeholder="seu-email@provedor.com"
              className="bg-white/5 border border-[#00e5ff]/20 rounded-lg text-[#f5f5f7] p-2.5 text-sm outline-none transition-all focus:border-[#00e5ff] focus:bg-white/10 focus:shadow-[0_0_8px_rgba(0,229,255,0.6)]"
            />
          </div>
          
          {authMode !== 'recovery' && (
            <div className="flex flex-col mb-4 text-left">
              <label className="text-xs text-[#8a99ad] mb-1 font-medium">Senha</label>
              <input 
                type="password" 
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white/5 border border-[#00e5ff]/20 rounded-lg text-[#f5f5f7] p-2.5 text-sm outline-none transition-all focus:border-[#00e5ff] focus:bg-white/10 focus:shadow-[0_0_8px_rgba(0,229,255,0.6)]"
              />
            </div>
          )}

          <button 
            onClick={executarLoginComum}
            className="w-full bg-transparent border border-[#00e5ff] rounded-lg text-[#f5f5f7] p-3 text-sm font-bold uppercase tracking-wide transition-all shadow-[0_0_10px_rgba(0,229,255,0.2)] hover:bg-[#00e5ff] hover:text-black hover:shadow-[0_0_20px_rgba(0,229,255,0.6)] flex items-center justify-center gap-2 mt-2"
          >
            <Lock className="w-4 h-4" />
            {authMode === 'login' ? 'Entrar' : authMode === 'register' ? 'Cadastrar' : 'Recuperar'}
          </button>

          {authMode === 'login' && (
            <button 
              onClick={simularLoginGoogle}
              className="w-full bg-white/5 border border-white/20 rounded-lg text-[#f5f5f7] p-2.5 text-sm font-bold mt-4 flex items-center justify-center gap-2.5 transition-all hover:bg-white/10 hover:border-white/30"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Entrar com o Google
            </button>
          )}

          <div className="flex justify-between mt-5 text-xs text-[#00e5ff]">
            {authMode !== 'recovery' ? (
              <button className="hover:underline" onClick={() => setAuthMode('recovery')}>Esqueceu a senha?</button>
            ) : (
              <button className="hover:underline" onClick={() => setAuthMode('login')}>Voltar ao login</button>
            )}
            
            {authMode !== 'register' ? (
              <button className="hover:underline" onClick={() => setAuthMode('register')}>Criar conta</button>
            ) : (
              <button className="hover:underline" onClick={() => setAuthMode('login')}>Já tenho conta</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070f] text-[#f5f5f7] p-4 font-sans selection:bg-[#00e5ff] selection:text-black pb-20 fade-in duration-500">
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* Header */}
        <div className="bg-white/5 backdrop-blur-xl border border-[#00e5ff]/20 rounded-2xl p-5 flex justify-between items-center shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <div className="text-left">
            <h1 className="text-lg sm:text-xl font-bold text-[#00e5ff] tracking-wide drop-shadow-[0_0_8px_rgba(0,229,255,0.5)] flex items-center gap-2 m-0">
              <Calculator className="w-5 h-5" />
              ELITE FINANCEIRO v3.0
            </h1>
            <p className="text-xs sm:text-sm text-[#8a99ad] mt-1 font-medium m-0">Controle Operacional & Ponto de Equilíbrio</p>
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-1.5 bg-transparent border border-[#ff3366] text-[#ff3366] rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors hover:bg-[#ff3366]/10"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end relative mt-2">
                {/* Apps */}
                  <div className="bg-[#141c2f]/70 border border-[#00ffcc]/20 rounded-xl p-4 backdrop-blur-md relative">
                   <h3 className="text-[13px] font-bold text-[#00ffcc] mb-3 uppercase tracking-wider flex items-center gap-2">
                     <CarFront className="w-4 h-4" /> Entradas de Apps
                   </h3>
                   <div className="flex flex-col gap-3">
                     <div className="flex flex-col">
                       <label className="text-xs text-[#8a99ad] mb-[4px] font-medium">Data</label>
                       <input 
                         type="date" 
                         value={novoGanhoAppData}
                         onChange={(e) => setNovoGanhoAppData(e.target.value)}
                         className="w-full bg-[#141828] border border-white/10 rounded-lg text-[#f5f5f7] p-2 text-sm outline-none transition-all focus:border-[#00e5ff] focus:shadow-[0_0_8px_rgba(0,229,255,0.4)]"
                       />
                     </div>
                     <div className="flex flex-col">
                       <label className="text-xs text-[#8a99ad] mb-[4px] font-medium">Aplicativo</label>
                       <select 
                         value={novoGanhoApp}
                         onChange={(e) => setNovoGanhoApp(e.target.value)}
                         className="w-full bg-[#141828] border border-white/10 rounded-lg text-[#f5f5f7] p-2 text-sm outline-none transition-all focus:border-[#00e5ff] focus:shadow-[0_0_8px_rgba(0,229,255,0.4)]"
                       >
                         <option value="iFood">iFood</option>
                         <option value="Uber">Uber</option>
                         <option value="99 Food">99 Food</option>
                         <option value="99 Passageiro">99 Passageiro</option>
                       </select>
                     </div>
                     <InputField label="Valor Feito (R$)" value={novoGanhoAppValor} onChange={setNovoGanhoAppValor} />
                     <button 
                       onClick={adicionarGanhoApp}
                       className="w-full bg-gradient-to-r from-[#0077ff] to-[#00ffcc] border-none rounded-lg text-black p-2.5 font-bold cursor-pointer hover:shadow-[0_0_15px_rgba(0,255,204,0.4)] transition-all flex items-center justify-center text-xs uppercase tracking-wide mt-2"
                     >
                       Injetar Saldo App
                     </button>
                   </div>
                </div>

                {/* Outros */}
                <div className="bg-[#141c2f]/70 border border-[#ff0055]/20 rounded-xl p-4 backdrop-blur-md relative">
                   <h3 className="text-[13px] font-bold text-[#ff0055] mb-3 uppercase tracking-wider flex items-center gap-2">
                     <Wallet className="w-4 h-4" /> Outras Entradas
                   </h3>
                   <div className="flex flex-col gap-3">
                     <div className="flex flex-col">
                       <label className="text-xs text-[#8a99ad] mb-[4px] font-medium">Data</label>
                       <input 
                         type="date" 
                         value={novoGanhoOutroData}
                         onChange={(e) => setNovoGanhoOutroData(e.target.value)}
                         className="w-full bg-[#141828] border border-white/10 rounded-lg text-[#f5f5f7] p-2 text-sm outline-none transition-all focus:border-[#00e5ff] focus:shadow-[0_0_8px_rgba(0,229,255,0.4)]"
                       />
                     </div>
                     <div className="flex flex-col">
                        <label className="text-xs text-[#8a99ad] mb-[4px] font-medium">Descrição da Entrada</label>
                        <input 
                          type="text"
                          placeholder="Bico, Venda..."
                          value={novoGanhoOutroDesc}
                          onChange={(e) => setNovoGanhoOutroDesc(e.target.value)}
                          className="w-full bg-[#141828] border border-white/10 rounded-lg text-[#f5f5f7] p-2 text-sm outline-none transition-all focus:border-[#00e5ff] focus:shadow-[0_0_8px_rgba(0,229,255,0.4)]"
                        />
                     </div>
                     <InputField label="Valor (R$)" value={novoGanhoOutroValor} onChange={setNovoGanhoOutroValor} />
                     <button 
                       onClick={adicionarGanhoOutro}
                       className="w-full bg-gradient-to-r from-[#ff0055] to-[#ff6699] border-none rounded-lg text-white p-2.5 font-bold cursor-pointer hover:shadow-[0_0_15px_rgba(255,0,85,0.4)] transition-all flex items-center justify-center text-xs uppercase tracking-wide mt-2"
                     >
                       Injetar Saldo Extra
                     </button>
                   </div>
                </div>
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
                <div className="bg-white/5 border-l-4 border-[#ff0055] p-4 rounded-md">
                  <div className="text-xs text-[#8a99ad] font-medium uppercase tracking-wide">Total Custo Operacional</div>
                  <div className="text-xl font-bold mt-1 text-white">{formatCurrency(totalCustosGerais)}</div>
                </div>
                <div className="bg-white/5 border-l-4 border-[#00ffcc] p-4 rounded-md">
                  <div className="text-xs text-[#8a99ad] font-medium uppercase tracking-wide">Entrada Líquida Atual</div>
                  <div className="text-xl font-bold mt-1 text-[#00ffcc]">{formatCurrency(entradaLiquida)}</div>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-md mb-3 border border-white/10">
                <div className="flex justify-between text-xs text-[#8a99ad] font-medium mb-2 uppercase tracking-wide">
                  <span>Progresso da Meta</span>
                  <span>{Math.min(100, Math.round((entradaLiquida / (totalCustosGerais || 1)) * 100))}%</span>
                </div>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#0077ff] to-[#00ffcc] transition-all duration-500 ease-in-out" 
                    style={{ width: `${Math.min(100, Math.max(0, (entradaLiquida / (totalCustosGerais || 1)) * 100))}%` }}
                  />
                </div>
              </div>

              <div className={cn("bg-white/5 border-l-4 p-4 rounded-md", inProfit ? "border-[#00ffcc]" : "border-[#ff0055]")}>
                 <div className="text-xs text-[#8a99ad] font-medium uppercase tracking-wide">Resultado Atual para Alcançar a Meta</div>
                 <div className={cn("text-xl font-bold mt-1", inProfit ? "text-[#00ffcc]" : "text-[#ff0055]")}>
                   {inProfit ? (
                     <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Meta Atingida! Lucro: {formatCurrency(saldoFinal)}</span>
                   ) : (
                     <span className="flex items-center gap-2"><AlertCircle className="w-5 h-5" /> Faltam {formatCurrency(Math.abs(saldoFinal))}</span>
                   )}
                 </div>
              </div>

              {/* Progressão de Vencimentos */}
              <h3 className="text-md font-bold text-[#0077ff] uppercase tracking-wide mb-3 mt-6 border-b border-white/10 pb-2">
                Ponto de Equilíbrio / Vencimentos
              </h3>
              
              <div className="space-y-3">
                {gastosCascata.map((gasto) => {
                  let faltaValor = gasto.valorTotal - gasto.valorPago;
                  if (faltaValor < 0) faltaValor = 0;

                  let porcentagemAtingida = (gasto.valorPago / gasto.valorTotal) * 100;
                  if (porcentagemAtingida > 100) porcentagemAtingida = 100;
                  let porcentagemFalta = 100 - porcentagemAtingida;
                  
                  let metaDiaria = faltaValor / gasto.faltaDias;
                  
                  let corBorda = faltaValor === 0 ? '#00ffcc' : (gasto.faltaDias <= 5 ? '#ff0055' : 'rgba(255,255,255,0.1)');

                  return (
                    <div key={gasto.id} className="bg-[#141c2f]/70 border border-white/5 rounded-xl p-4 backdrop-blur-md relative overflow-hidden" style={{ borderLeft: `4px solid ${corBorda}` }}>
                        <div className="flex justify-between items-center font-bold text-[1.05rem] mb-2">
                            <span>{gasto.nome}</span>
                            <span className="text-[#8a99ad] text-sm">
                                R$ {gasto.valorPago.toFixed(2)} / <span className="text-white">R$ {gasto.valorTotal.toFixed(2)}</span>
                            </span>
                        </div>
                        
                        <div className="text-sm mt-2">
                            {faltaValor === 0 ? (
                                <span className="text-[#00ffcc] font-bold">✓ Ponto de equilíbrio atingido!</span>
                            ) : (
                                <span>Falta <b className="text-[#ff0055]">R$ {faltaValor.toFixed(2)}</b> ({porcentagemFalta.toFixed(0)}%) até o vencimento.</span>
                            )}
                        </div>

                        {faltaValor > 0 && (
                            <div className="text-xs text-[#8a99ad] mt-1.5">
                                Meta necessária nos apps: <b className="text-white">R$ {metaDiaria.toFixed(2)}/dia</b> ({gasto.faltaDias} dias restantes)
                            </div>
                        )}

                        <div className="w-full bg-black/40 h-1.5 mt-3 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#0077ff] to-[#00ffcc] transition-all duration-500" 
                              style={{ width: `${porcentagemAtingida}%` }}
                            />
                        </div>
                    </div>
                  );
                })}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-4">
                <ExpenseInput label="Aluguel" valor={casaAluguel} onChangeValor={setCasaAluguel} dia={casaAluguelDia} onChangeDia={setCasaAluguelDia} />
                <ExpenseInput label="Conect" valor={casaConect} onChangeValor={setCasaConect} dia={casaConectDia} onChangeDia={setCasaConectDia} />
                <ExpenseInput label="Vivo" valor={casaVivo} onChangeValor={setCasaVivo} dia={casaVivoDia} onChangeDia={setCasaVivoDia} />
                <ExpenseInput label="Tim" valor={casaTim} onChangeValor={setCasaTim} dia={casaTimDia} onChangeDia={setCasaTimDia} />
                <ExpenseInput label="Pensão" valor={casaPensao} onChangeValor={setCasaPensao} dia={casaPensaoDia} onChangeDia={setCasaPensaoDia} />
                <ExpenseInput label="Barbeiro" valor={casaBarbeiro} onChangeValor={setCasaBarbeiro} dia={casaBarbeiroDia} onChangeDia={setCasaBarbeiroDia} />
                <ExpenseInput label="Compra Mês" valor={casaCompra} onChangeValor={setCasaCompra} dia={casaCompraDia} onChangeDia={setCasaCompraDia} />
                <ExpenseInput label="Luz" valor={casaLuz} onChangeValor={setCasaLuz} dia={casaLuzDia} onChangeDia={setCasaLuzDia} />
              </div>
            </div>

            {/* Moto */}
            <div className="bg-[#141828]/65 backdrop-blur-md border border-[#00e5ff]/20 rounded-2xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.37)]">
              <h2 className="text-lg font-bold text-[#00e5ff] border-b border-[#00e5ff]/20 pb-2 mb-4 drop-shadow-[0_0_8px_rgba(0,229,255,0.5)] flex items-center gap-2">
                <CarFront className="w-5 h-5" />
                Gastos com a Moto
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-4 mb-3">
                 <ExpenseInput label="Parcela Entrada" valor={motoParcela} onChangeValor={setMotoParcela} dia={motoParcelaDia} onChangeDia={setMotoParcelaDia} />
                 <ExpenseInput label="Prestação Moto" valor={motoPrestacao} onChangeValor={setMotoPrestacao} dia={motoPrestacaoDia} onChangeDia={setMotoPrestacaoDia} />
                 <ExpenseInput label="Seguro Moto" valor={motoSeguro} onChangeValor={setMotoSeguro} dia={motoSeguroDia} onChangeDia={setMotoSeguroDia} />
                 <ExpenseInput label="Óleo Yamalube" valor={motoOleo} onChangeValor={setMotoOleo} dia={motoOleoDia} onChangeDia={setMotoOleoDia} />
                 <ExpenseInput label="Filtro Moto" valor={motoFiltro} onChangeValor={setMotoFiltro} dia={motoFiltroDia} onChangeDia={setMotoFiltroDia} />
                 
                 <div className="col-span-1 sm:col-span-2 bg-[#141828]/50 p-4 rounded-xl border border-white/5 mt-2">
                    <h3 className="text-sm font-bold text-[#f5f5f7] mb-3">Calculadora de Combustível</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       <InputField label="Litros/Semana" value={motoLitrosSemana} onChange={setMotoLitrosSemana} formatType="integer" />
                       <InputField label="Valor Litro" value={motoPrecoLitro} onChange={setMotoPrecoLitro} />
                       <ExpenseInput label="Custo Mês" valor={motoCombustivel} isReadOnly={true} dia={motoCombustivelDia} onChangeDia={setMotoCombustivelDia} />
                    </div>
                 </div>
              </div>
              <p className="text-[#8a99ad] text-xs italic mt-4">* Combustível calculado: (Litros/semana × 4 semanas) × Valor Litro.</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-4">
                <ExpenseInput label="Nubank Fatura" valor={cartaoNubank} onChangeValor={setCartaoNubank} dia={cartaoNubankDia} onChangeDia={setCartaoNubankDia} />
                <ExpenseInput label="Santander Lise Total" valor={lisePrincipal + totalEncargosLise} isReadOnly={true} dia={liseSantanderDia} onChangeDia={setLiseSantanderDia} />
                <InputField label="Lise Saque Principal" value={lisePrincipal} onChange={setLisePrincipal} />
                <InputField label="Juros Lise (Mês %)" value={liseJurosPct} onChange={setLiseJurosPct} />
                <InputField label="Dias de Uso Lise" value={liseDias} onChange={setLiseDias} formatType="integer" />
                <InputField label="IOF Fixo R$" value={liseIof} onChange={setLiseIof} />
              </div>
              <p className="text-[#8a99ad] text-xs italic mt-6">* A fatura do Nubank é atualizada automaticamente com base no mês de referência na aba de configurações.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
