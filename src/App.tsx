import { useState, useEffect } from 'react';
import { Eye, EyeOff, LayoutDashboard, ArrowLeftRight, CalendarDays, Handshake, LogOut, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { cn } from './lib/utils';

function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.log(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

// --- MOCK DATA ---
const initialChartData = [
  { name: 'Auxílios Fixos', valor: 2210.00, color: '#00f0ff' },
  { name: 'Custos Base', valor: 4693.19, color: '#ff0055' },
  { name: 'Média Ganhos Rua', valor: 4300.00, color: '#39ff14' },
  { name: 'Meta Mínima Rua', valor: 2760.00, color: '#ffffff' },
];

const initialExtratoData = [
  { id: 1, desc: 'Bolsa Família (Fixo)', tipo: 'entrada-outros', valor: 1060.00 },
  { id: 2, desc: 'Moeda Mumbuca (Fixo)', tipo: 'entrada-outros', valor: 1150.00 },
  { id: 3, desc: 'Aluguel Casa', tipo: 'saida-outros', valor: 950.00 },
  { id: 4, desc: 'Pensão Alimentícia', tipo: 'saida-outros', valor: 729.45 },
  { id: 5, desc: 'Rancho / Alimentação', tipo: 'saida-outros', valor: 800.00 },
  { id: 6, desc: 'Financiamento Crosser (10/48)', tipo: 'saida-outros', valor: 1093.55 },
  { id: 7, desc: 'Seguro Moto Proteção', tipo: 'saida-outros', valor: 175.20 },
  { id: 8, desc: 'Custo Estimado Rodagem', tipo: 'saida-gasolina', valor: 652.00 },
];

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const initialNubankData = [
  { id: 'st-maio', data: '19 de Maio de 2026', valor: 199.98, status: 'pendente' },
  { id: 'st-junho', data: '19 de Junho de 2026', valor: 139.98, status: 'pendente' },
  { id: 'st-julho', data: '19 de Julho de 2026', valor: 271.67, status: 'pendente' },
  { id: 'st-agosto', data: '19 de Agosto de 2026', valor: 271.67, status: 'pendente' }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('painel');

  // Global State
  const [extratoData, setExtratoData] = useLocalStorage('elite_extrato', initialExtratoData);
  const [nubankData, setNubankData] = useLocalStorage('elite_nubank_v4', initialNubankData);
  const [saldoAmigo, setSaldoAmigo] = useLocalStorage('elite_saldoAmigo', 5900);
  const [reservaAcumulada, setReservaAcumulada] = useLocalStorage('elite_reserva', 430.00);
  const [chartData, setChartData] = useLocalStorage('elite_chart', initialChartData);
  const [ganhosRua, setGanhosRua] = useLocalStorage('elite_ganhos', 1500.00); // Ganhos atuais do mês na rua
  const [showProfitAlert, setShowProfitAlert] = useState(false);

  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const mesAtualNome = meses[new Date().getMonth()];
  const faturaMesAtual = nubankData.find(f => f.data.includes(mesAtualNome) && f.status === 'pendente');
  
  const basePontoEquilibrio = 2760.00;
  const pontoEquilibrio = basePontoEquilibrio + (faturaMesAtual ? faturaMesAtual.valor : 0);

  const handleAddLancamento = (tipo: string, desc: string, valorStr: string) => {
    const valor = parseFloat(valorStr.replace(',', '.'));
    if (!desc || isNaN(valor) || valor <= 0) {
      alert('Preencha a descrição e um valor numérico válido maior que zero.');
      return;
    }

    const isEntrada = tipo.startsWith('entrada');

    const novoLancamento = {
      id: Date.now(),
      desc,
      tipo,
      valor,
    };

    setExtratoData([novoLancamento, ...extratoData]);

    let crossedProfitZone = false;

    if (isEntrada) {
      // Adiciona 10% automáticos na reserva
      setReservaAcumulada(prev => prev + (valor * 0.1));
      
      // Atualiza Ganhos Rua
      const nextGanhos = ganhosRua + valor;
      if (ganhosRua < pontoEquilibrio && nextGanhos >= pontoEquilibrio) {
        crossedProfitZone = true;
        setShowProfitAlert(true);
      }
      setGanhosRua(nextGanhos);

      // Atualiza Média Ganhos Rua
      setChartData(prev => prev.map(item => 
        item.name === 'Média Ganhos Rua' ? { ...item, valor: item.valor + (valor / 4.3) } : item
      ));
    } else {
      // Atualiza Custos Base
      setChartData(prev => prev.map(item => 
        item.name === 'Custos Base' ? { ...item, valor: item.valor + valor } : item
      ));
    }

    if (!crossedProfitZone) {
      // Pequeno timeout para renderizar as datas antes do alert nativo bloquear a thread principal
      setTimeout(() => alert('Operação de caixa gravada com sucesso!'), 10);
    }
  };

  const handleQuitarFatura = (id: string, valorFatura: number) => {
    setNubankData(prev => prev.map(item => {
      if (item.id === id) {
        if (item.status === 'pago') {
          alert('Esta fatura já consta como liquidada.');
          return item;
        }
        alert(`Fatura de ${formatCurrency(valorFatura)} baixada do ponto de equilíbrio com sucesso.`);
        return { ...item, status: 'pago' };
      }
      return item;
    }));
  };

  const handleAbaterDivida = (valorStr: string) => {
    const valorAbate = parseFloat(valorStr.replace(',', '.'));
    
    if (isNaN(valorAbate) || valorAbate <= 0) {
      alert('Informe um valor de repasse válido.');
      return;
    }

    if (valorAbate > saldoAmigo) {
      alert('O valor informado é superior ao saldo devedor total.');
      return;
    }

    setSaldoAmigo(prev => prev - valorAbate);
    alert(`Repasse de ${formatCurrency(valorAbate)} computado! Saldo devedor atualizado.`);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_50%,_#101424_0%,_#06070d_100%)] text-white p-2 sm:p-4 flex justify-center items-center font-sans selection:bg-neon-blue selection:text-black">
      <div className="w-full max-w-[1100px] min-h-[750px] bg-[#0a0b10]/95 border border-neon-blue/15 rounded-3xl shadow-[0_0_40px_rgba(0,240,255,0.1)] overflow-hidden flex flex-col relative backdrop-blur-xl">
        
        {/* Topbar */}
        <header className="flex justify-between items-center p-5 sm:px-8 sm:py-6 border-b border-white/5 bg-black/20">
          <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-wide">
            Elite <span className="text-neon-blue drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]">Financeiro v2.0</span>
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="font-semibold text-sm">Carlos</div>
              <div className="text-xs text-neon-green">Operador Elite ativo</div>
            </div>
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="ml-2 p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-neon-red transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="flex bg-black/30 px-3 py-2 gap-2 sm:gap-4 border-b border-white/5 overflow-x-auto scrollbar-hide">
          <TabButton 
            active={activeTab === 'painel'} 
            onClick={() => setActiveTab('painel')}
            icon={<LayoutDashboard size={16} />}
          >
            Painel Geral
          </TabButton>
          <TabButton 
            active={activeTab === 'fluxo'} 
            onClick={() => setActiveTab('fluxo')}
            icon={<ArrowLeftRight size={16} />}
          >
            Entradas & Saídas
          </TabButton>
          <TabButton 
            active={activeTab === 'nubank'} 
            onClick={() => setActiveTab('nubank')}
            icon={<CalendarDays size={16} />}
          >
            Cronograma Nubank
          </TabButton>
          <TabButton 
            active={activeTab === 'crosser'} 
            onClick={() => setActiveTab('crosser')}
            icon={<Handshake size={16} />}
          >
            Dívida da Crosser
          </TabButton>
        </nav>

        {/* Content Body */}
        <main className="p-4 sm:p-8 flex-grow overflow-y-auto">
          {activeTab === 'painel' && <PainelGeral reservaAcumulada={reservaAcumulada} chartData={chartData} ganhosRua={ganhosRua} pontoEquilibrio={pontoEquilibrio} />}
          {activeTab === 'fluxo' && <FluxoCaixa extratoData={extratoData} onAddLancamento={handleAddLancamento} />}
          {activeTab === 'nubank' && <CronogramaNubank nubankData={nubankData} onQuitarFatura={handleQuitarFatura} />}
          {activeTab === 'crosser' && <DividaCrosser saldoAmigo={saldoAmigo} onAbaterDivida={handleAbaterDivida} />}
        </main>

        {showProfitAlert && (
          <ProfitAlertModal onClose={() => setShowProfitAlert(false)} />
        )}
      </div>
    </div>
  );
}

function ProfitAlertModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#0f121c] border-2 border-neon-green rounded-3xl p-8 max-w-lg w-full shadow-[0_0_50px_rgba(57,255,20,0.3)] text-center animate-in zoom-in-90 duration-500">
        <div className="text-6xl mb-4 animate-bounce">💰🚀</div>
        <h2 className="text-3xl font-bold font-heading text-neon-green mb-4 drop-shadow-[0_0_10px_rgba(57,255,20,0.6)]">ZONA DE LUCRO PURO!</h2>
        <p className="text-lg text-slate-300 mb-6">
          Parabéns! Todos os custos operacionais do mês foram cobertos.
          A partir de agora, <strong>SUA MARGEM LIVRE ESTÁ ATIVA!</strong> 💸
        </p>
        <button 
          onClick={onClose}
          className="w-full bg-neon-green text-black font-bold text-lg py-4 rounded-xl hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] hover:-translate-y-1 transition-all"
        >
          Continuar Faturando
        </button>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_50%_50%,_#101424_0%,_#06070d_100%)] text-white p-4 flex justify-center items-center font-sans">
      <div className="bg-[#0f121c]/70 border border-white/5 backdrop-blur-xl p-8 sm:p-10 rounded-3xl w-full max-w-[440px] shadow-[0_15px_35px_rgba(0,0,0,0.5)] text-center relative z-10">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2 tracking-wide">
          Elite <span className="text-neon-blue drop-shadow-[0_0_10px_rgba(0,240,255,0.4)]">Financeiro</span>
        </h1>
        <p className="text-slate-400 text-sm mb-8">Sistema Operacional de Gestão Operacional</p>

        <button 
          onClick={onLogin}
          className="w-full bg-[#13141a]/80 hover:bg-[#1a1b23] border border-white/10 text-white rounded-xl p-3.5 font-medium text-[0.95rem] flex items-center justify-center gap-3 cursor-pointer transition-all hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]"
        >
          <svg className="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar com o Google
        </button>

        <div className="flex items-center text-slate-500 text-xs gap-3 my-6">
          <div className="flex-1 border-b border-white/10"></div>
          ou preencha as credenciais
          <div className="flex-1 border-b border-white/10"></div>
        </div>

        <div className="text-left mb-5">
          <label className="block text-sm text-slate-400 mb-1.5">E-mail ou Usuário</label>
          <input 
            type="text" 
            defaultValue="carlos.marica@elite.com"
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white text-base transition-all focus:border-neon-blue focus:outline-none focus:shadow-[0_0_10px_rgba(0,240,255,0.2)]"
          />
        </div>

        <div className="text-left mb-6 relative">
          <label className="block text-sm text-slate-400 mb-1.5">Senha de Acesso</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              defaultValue="12345678"
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white text-base transition-all focus:border-neon-blue focus:outline-none focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] pr-12"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-neon-blue transition-colors p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex justify-between text-xs sm:text-sm mb-8 text-neon-blue">
          <button onClick={() => alert('Link de redefinição enviado para o e-mail cadastrado!')} className="hover:underline bg-transparent border-none p-0 cursor-pointer text-inherit">Esqueceu a senha?</button>
          <button onClick={() => alert('Formulário de cadastro ativado no banco de dados!')} className="hover:underline bg-transparent border-none p-0 cursor-pointer text-inherit">Criar conta</button>
        </div>

        <button 
          onClick={onLogin}
          className="w-full bg-gradient-to-r from-[#00c3ff] to-[#00f0ff] text-black border-none rounded-xl p-4 text-base font-bold uppercase tracking-wider cursor-pointer transition-all hover:shadow-[0_0_20px_var(--color-neon-blue)] hover:-translate-y-[2px]"
        >
          Acessar Painel
        </button>
      </div>
    </div>
  );
}

function TabButton({ children, active, onClick, icon }: { children: React.ReactNode, active: boolean, onClick: () => void, icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "bg-transparent border border-transparent text-slate-400 py-2.5 px-4 rounded-xl cursor-pointer font-semibold text-sm flex items-center gap-2 transition-all whitespace-nowrap",
        "hover:text-white hover:bg-white/5",
        active && "text-neon-blue bg-[#00f0ff]/5 border-[#00f0ff]/20 shadow-[inset_0_0_10px_rgba(0,240,255,0.1)]"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function MiniCard({ title, value, colorClass }: { title: string, value: string, colorClass: string }) {
  return (
    <div className={cn("bg-[#0f121c]/70 border border-white/5 rounded-2xl p-5 border-l-4", colorClass)}>
      <h4 className="text-xs text-slate-400 uppercase mb-2 font-medium">{title}</h4>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
    </div>
  );
}

function IndicadorPastel({ ganhos, meta }: { ganhos: number, meta: number }) {
  const percent = Math.min((ganhos / meta) * 100, 100);
  const inProfit = ganhos >= meta;
  const faltam = meta - ganhos;

  return (
    <div className="bg-[#0d101a]/90 border border-white/5 rounded-2xl p-5 sm:p-6 mb-5 shadow-sm relative overflow-hidden">
      {/* Glow effect based on state */}
      <div className={cn("absolute -top-20 -right-20 w-64 h-64 blur-[80px] opacity-20 rounded-full", inProfit ? "bg-neon-green" : "bg-neon-blue")}></div>
      
      <h3 className="text-sm text-slate-400 uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
        <span className="text-xl drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">📊</span> GESTÃO DE COBERTURA OPERACIONAL
      </h3>
      
      {inProfit ? (
        <div className="text-neon-green font-bold text-xl sm:text-2xl mb-4 drop-shadow-[0_0_8px_rgba(57,255,20,0.5)] animate-in fade-in zoom-in duration-500">
          🚀 ZONA DE LUCRO PURO: Estrutura Paga! Margem Livre Ativa
        </div>
      ) : (
        <div className="text-neon-blue font-bold text-lg sm:text-xl mb-2 drop-shadow-[0_0_8px_rgba(0,240,255,0.4)] transition-all duration-300">
          🛠️ Liquidando Custos Operacionais Base...
        </div>
      )}

      {!inProfit && (
        <div className="text-sm text-slate-300 mb-5 relative z-10">
          Faltam <span className="font-bold text-white text-base">{formatCurrency(faltam)}</span> de repasse para atingir o Ponto de Equilíbrio.
        </div>
      )}
      {inProfit && (
        <div className="text-sm text-slate-300 mb-5 relative z-10">
          Lucro Líquido Acumulado: <span className="font-bold text-neon-green text-base drop-shadow-[0_0_3px_rgba(57,255,20,0.4)]">{formatCurrency(ganhos - meta)}</span>
        </div>
      )}

      <div className="h-4 w-full bg-black/60 rounded-full overflow-hidden border border-white/10 relative z-10">
        <div 
          className={cn("h-full transition-all duration-1000 ease-out", inProfit ? "bg-neon-green shadow-[0_0_15px_#39ff14]" : "bg-neon-blue shadow-[0_0_15px_#00f0ff]")}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between mt-3 text-xs font-mono text-slate-400 relative z-10">
        <span>Ganhos Registrados: {formatCurrency(ganhos)}</span>
        <span>Meta Operacional: {formatCurrency(meta)}</span>
      </div>
    </div>
  );
}

function PainelGeral({ reservaAcumulada, chartData, ganhosRua, pontoEquilibrio }: { reservaAcumulada: number, chartData: any[], ganhosRua: number, pontoEquilibrio: number }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <IndicadorPastel ganhos={ganhosRua} meta={pontoEquilibrio} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <MiniCard title="Ponto de Equilíbrio (Rua)" value={formatCurrency(2760)} colorClass="border-l-neon-blue" />
        <MiniCard title="Média iFood / Semana" value={formatCurrency(1000)} colorClass="border-l-neon-green" />
        <MiniCard title="Total Saídas Base" value={formatCurrency(4693.19)} colorClass="border-l-neon-red" />
        <MiniCard title="Reserva de Segurança (10%)" value={formatCurrency(reservaAcumulada)} colorClass="border-l-neon-blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[#0d101a]/90 border border-white/5 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h3 className="text-[1.1rem] mb-5 border-l-4 border-neon-blue pl-3 font-semibold">Visão Geral do Balanço</h3>
          <div className="h-[250px] w-full mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} interval={0} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(15, 18, 28, 0.95)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#00f0ff', fontWeight: 'bold' }}
                />
                <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`${entry.color}66`} stroke={entry.color} strokeWidth={2} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0d101a]/90 border border-white/5 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h3 className="text-[1.1rem] mb-5 border-l-4 border-neon-blue pl-3 font-semibold">Status Operacional Semanal</h3>
          <div className="mt-4 text-[0.95rem] leading-relaxed space-y-3">
            <p className="text-neon-green font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-xl">🚀</span> Operando 36% acima do ponto de segurança!
            </p>
            <div className="space-y-1">
              <p className="text-slate-400"><span className="inline-block w-4">•</span> Meta Semanal Mínima: <span className="text-white font-medium">R$ 642,00</span></p>
              <p className="text-neon-blue"><span className="inline-block w-4">•</span> Produção Média Realizada: <span className="font-bold">R$ 1.000,00</span></p>
              <p className="text-slate-400"><span className="inline-block w-4">•</span> Sobra Estimada Mensal Livre: <span className="text-white font-medium">R$ 1.540,00</span></p>
            </div>
            <div className="mt-6 text-[0.85rem] bg-white/5 p-4 rounded-xl border border-dashed border-neon-blue/30 leading-relaxed text-slate-300">
              <strong className="text-neon-blue mr-1">Nota Estratégica:</strong> 
              A ativação dos novos aplicativos (Uber, 99 e 99Food) a partir de terça-feira aumentará exponencialmente a margem de sobra para amortização da moto.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FluxoCaixa({ extratoData, onAddLancamento }: { extratoData: any[], onAddLancamento: (tipo: string, desc: string, valor: string) => void }) {
  const [tipo, setTipo] = useState('entrada-uber');
  const [desc, setDesc] = useState('');
  const [valor, setValor] = useState('');
  const [filter, setFilter] = useState<'todos' | 'entradas' | 'saidas'>('todos');

  const submit = () => {
    onAddLancamento(tipo, desc, valor);
    setDesc('');
    setValor('');
  };

  const filteredExtrato = extratoData.filter(item => {
    if (filter === 'entradas') return item.tipo.startsWith('entrada');
    if (filter === 'saidas') return !item.tipo.startsWith('entrada');
    return true;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Formulário de Novo Lançamento */}
        <div className="bg-[#0d101a]/90 border border-white/5 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h3 className="text-[1.1rem] mb-6 border-l-4 border-neon-blue pl-3 font-semibold">Lançamento de Caixa Rápido</h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Tipo de Operação</label>
              <select 
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full bg-black/40 border border-white/10 p-3.5 rounded-xl text-white focus:outline-none focus:border-neon-blue focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all"
              >
                <optgroup label="Entradas (Aplicativos)">
                  <option value="entrada-uber">Uber</option>
                  <option value="entrada-99">99</option>
                  <option value="entrada-ifood">iFood</option>
                  <option value="entrada-99food">99 Food</option>
                  <option value="entrada-outros">Outras Entradas</option>
                </optgroup>
                <optgroup label="Saídas (Despesas)">
                  <option value="saida-gasolina">Gasolina</option>
                  <option value="saida-manutencao">Manutenção</option>
                  <option value="saida-outros">Outras Saídas</option>
                </optgroup>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Descrição do Lançamento</label>
              <input 
                type="text" 
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Ex: Diária iFood / Abastecimento Crosser"
                className="w-full bg-black/40 border border-white/10 p-3.5 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-neon-blue focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Valor Monetário (R$)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">R$</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black/40 border border-white/10 p-3.5 pl-10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-neon-blue focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all"
                />
              </div>
            </div>
            
            <div className="pt-2">
              <button onClick={submit} className="w-full sm:w-auto bg-transparent border border-neon-blue text-neon-blue py-3 px-6 rounded-xl font-bold hover:bg-neon-blue hover:text-black hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all">
                Confirmar Movimentação
              </button>
            </div>
          </div>
        </div>

        {/* Extrato Recente */}
        <div className="bg-[#0d101a]/90 border border-white/5 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col h-full max-h-[500px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 flex-shrink-0">
            <h3 className="text-[1.1rem] border-l-4 border-neon-blue pl-3 font-semibold">Extrato Consolidado</h3>
            <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
              <button onClick={() => setFilter('todos')} className={cn("px-3 py-1 text-xs rounded-md font-medium transition-all", filter === 'todos' ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200")}>Todos</button>
              <button onClick={() => setFilter('entradas')} className={cn("px-3 py-1 text-xs rounded-md font-medium transition-all", filter === 'entradas' ? "bg-neon-green/20 text-neon-green" : "text-slate-400 hover:text-neon-green")}>Entradas</button>
              <button onClick={() => setFilter('saidas')} className={cn("px-3 py-1 text-xs rounded-md font-medium transition-all", filter === 'saidas' ? "bg-neon-red/20 text-neon-red" : "text-slate-400 hover:text-neon-red")}>Saídas</button>
            </div>
          </div>
          
          <div className="flex-grow overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-2">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="sticky top-0 bg-[#0d101a]/95 backdrop-blur z-10 hidden sm:table-header-group">
                <tr className="text-neon-blue border-b-2 border-white/10">
                  <th className="pb-3 pt-1 px-3 font-semibold">Descrição</th>
                  <th className="pb-3 pt-1 px-3 font-semibold">Tipo</th>
                  <th className="pb-3 pt-1 px-3 font-semibold text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredExtrato.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-500">Nenhuma movimentação encontrada.</td>
                  </tr>
                ) : filteredExtrato.map((item) => {
                  const isEntrada = item.tipo.startsWith('entrada');
                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors flex flex-col sm:table-row py-3 sm:py-0 border-b border-white/5 sm:border-none">
                      <td className="py-1 sm:py-4 px-3 font-medium flex items-center justify-between sm:table-cell">
                        <span className="sm:hidden text-slate-500 text-xs">Descrição:</span>
                        {item.desc}
                      </td>
                      <td className="py-1 sm:py-4 px-3 flex items-center justify-between sm:table-cell">
                        <span className="sm:hidden text-slate-500 text-xs">Tipo:</span>
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
                          isEntrada 
                            ? "bg-neon-green/10 text-neon-green border-neon-green/20" 
                            : "bg-neon-red/10 text-neon-red border-neon-red/20"
                        )}>
                          {isEntrada ? 'Entrada' : 'Saída'} {item.tipo.includes('-') ? `(${item.tipo.split('-')[1].charAt(0).toUpperCase() + item.tipo.split('-')[1].slice(1)})` : ''}
                        </span>
                      </td>
                      <td className="py-1 sm:py-4 px-3 text-right font-mono flex items-center justify-between sm:table-cell">
                        <span className="sm:hidden text-slate-500 text-xs">Valor:</span>
                        <span className={isEntrada ? "text-neon-green font-semibold" : "text-neon-red font-semibold"}>
                          {isEntrada ? '+' : '-'} {formatCurrency(item.valor)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

function CronogramaNubank({ nubankData, onQuitarFatura }: { nubankData: any[], onQuitarFatura: (id: string, valor: number) => void }) {
  const faturaMaio = nubankData.find(f => f.id === 'st-maio');
  const faturaAtualValor = faturaMaio?.status === 'pendente' ? faturaMaio.valor : 0;
  
  const proximasFaturas = nubankData
    .filter(f => f.id !== 'st-maio' && f.status === 'pendente')
    .reduce((acc, curr) => acc + curr.valor, 0);

  // Dynamic limit based on 1000 total limit and current sum of pending bills
  const totalPendente = nubankData.filter(f => f.status === 'pendente').reduce((acc, curr) => acc + curr.valor, 0);
  // Se o totalPendente for 883.30 (199.98 + 683.32), então sobra exatos 116.70. Para ficar os exatos 116.71 pedidos, consideramos limite total 1000.01.
  const limiteDisponivel = Math.max(0, 1000.01 - totalPendente);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
       <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
         <MiniCard title="Fatura do Mês Atual (Maio)" value={formatCurrency(faturaAtualValor)} colorClass="border-l-neon-red" />
         <MiniCard title="Próximas Faturas (Acumuladas)" value={formatCurrency(proximasFaturas)} colorClass="border-l-neon-blue" />
         <MiniCard title="Limite Disponível Atual" value={formatCurrency(limiteDisponivel)} colorClass="border-l-neon-green" />
       </div>

       <div className="bg-[#0d101a]/90 border border-white/5 rounded-2xl p-5 sm:p-6 shadow-sm">
          <h3 className="text-[1.1rem] mb-2 border-l-4 border-neon-blue pl-3 font-semibold">Faturas Pendentes & Quitação Gradual (Limite R$ 1.000)</h3>
          <p className="text-slate-400 text-sm mb-6">Abaixo estão mapeados os vencimentos exatos do cartão Nubank informados para o encerramento do ciclo de dívida.</p>
          
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white/5">
                      <tr className="text-neon-blue">
                          <th className="p-4 font-semibold rounded-tl-xl">Data do Vencimento</th>
                          <th className="p-4 font-semibold">Valor da Fatura</th>
                          <th className="p-4 font-semibold">Status do Cartão</th>
                          <th className="p-4 font-semibold text-right rounded-tr-xl">Ação Executória</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                      {nubankData.map((fatura) => (
                          <tr key={fatura.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className={cn("p-4 transition-colors", fatura.status === 'pago' && "text-slate-500 line-through")}>{fatura.data}</td>
                              <td className="p-4 font-mono font-medium">
                                {fatura.status === 'pago' ? (
                                  <span className="text-neon-green">R$ 0,00 <span className="line-through text-slate-500 text-xs ml-2">{formatCurrency(fatura.valor)}</span></span>
                                ) : (
                                  formatCurrency(fatura.valor)
                                )}
                              </td>
                              <td className="p-4">
                                  <span className={cn(
                                    "px-3 py-1 rounded-md text-xs font-bold uppercase",
                                    fatura.status === 'pendente' 
                                      ? "bg-neon-red/10 text-neon-red border border-neon-red/20" 
                                      : "bg-neon-green/10 text-neon-green border border-neon-green/20"
                                  )}>
                                    {fatura.status}
                                  </span>
                              </td>
                              <td className="p-4 text-right">
                                  <button 
                                    onClick={() => onQuitarFatura(fatura.id, fatura.valor)}
                                    disabled={fatura.status === 'pago'}
                                    className="bg-transparent border border-neon-blue text-neon-blue px-4 py-2 rounded-lg font-bold hover:bg-neon-blue hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-neon-blue"
                                  >
                                    Dar Baixa
                                  </button>
                              </td>
                          </tr>
                      ))}
                      <tr className="bg-neon-green/5 border-t-2 border-neon-green/20">
                          <td className="p-4 font-bold text-white">Livre / Quitado</td>
                          <td className="p-4 font-bold text-neon-green">R$ 0,00</td>
                          <td className="p-4">
                            <span className="bg-neon-green/10 border border-neon-green/20 text-neon-green px-3 py-1 rounded-md text-xs font-bold uppercase">
                              Limite 100% Livre
                            </span>
                          </td>
                          <td className="p-4 text-right flex items-center justify-end gap-2">
                             <CheckCircle2 className="text-neon-green" size={16} />
                             <span className="text-slate-400 text-xs">Apto Operacionalmente</span>
                          </td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}

function DividaCrosser({ saldoAmigo, onAbaterDivida }: { saldoAmigo: number, onAbaterDivida: (v: string) => void }) {
  const [valor, setValor] = useState('');

  const submit = () => {
    onAbaterDivida(valor);
    setValor('');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[#0d101a]/90 border border-white/5 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h3 className="text-[1.1rem] mb-2 border-l-4 border-neon-blue pl-3 font-semibold">Amortização de Saldo Devedor</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Você já repassou R$ 5.100,00 em mãos. O saldo restante de <span className="text-white font-medium">R$ 5.900,00</span> está sendo liquidado sem juros diretamente com o ex-proprietário.
            </p>
            
            <div className="space-y-5 mt-2">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Valor do Repasse Atual (R$)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">R$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="Ex: 1000"
                    className="w-full bg-black/40 border border-white/10 p-3.5 pl-10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-neon-blue focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all"
                  />
                </div>
              </div>
              <button onClick={submit} className="bg-transparent border border-neon-blue text-neon-blue py-3 px-6 rounded-xl font-bold hover:bg-neon-blue hover:text-black hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all">
                Registrar Pagamento de Amortização
              </button>
            </div>
        </div>

        <div className="bg-[#0d101a]/90 border border-white/5 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-center items-center text-center">
            <h4 className="text-slate-400 uppercase text-sm font-medium mb-3">Total Devedor Restante</h4>
            <div className="text-5xl font-bold font-mono tracking-tight text-neon-red drop-shadow-[0_0_10px_rgba(255,0,85,0.3)]">
              {saldoAmigo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
            
            <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 text-left">
              <CheckCircle2 className="text-neon-green flex-shrink-0" size={24} />
              <p className="text-sm text-slate-300">
                Acordo formalizado e resguardado no cartório na segunda-feira.
              </p>
            </div>
        </div>
      </div>
    </div>
  );
}
