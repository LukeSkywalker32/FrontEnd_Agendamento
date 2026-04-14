import { useEffect, useState } from "react";
import styled from "styled-components";
import { Card } from "../../components/ui";
import { useApi } from "../../hooks/useApi";

interface DashboardData {
   totalUsuarios: number;
   totalEmpresas: number;
   totalTransportadoras: number;
   totalAgendamentos: number;
   agendamentosPendentes: number;
   agendamentosConfirmados: number;
   totalCheckins: number;
}

// Área scrollável do conteúdo interno da página
const Page = styled.main`
   flex: 1;
   overflow-y: auto;
   padding: ${({ theme }) => theme.spacing.xl};
   background: ${({ theme }) => theme.colors.background};
`;

// Cabeçalho da página: título + subtítulo (sem botão de tema — está no Header)
const PageHeader = styled.div`
   margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
   font-size: ${({ theme }) => theme.typography.sizes["2xl"]};
   font-weight: ${({ theme }) => theme.typography.weights.bold};
   color: ${({ theme }) => theme.colors.text.primary};
   margin-bottom: 4px;
`;

const Subtitle = styled.p`
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: ${({ theme }) => theme.colors.text.secondary};
`;

// Título de seção para separar grupos de cards
const SectionTitle = styled.h2`
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   font-weight: ${({ theme }) => theme.typography.weights.semibold};
   color: ${({ theme }) => theme.colors.text.secondary};
   text-transform: uppercase;
   letter-spacing: 0.8px;
   margin: ${({ theme }) => `${theme.spacing.xl} 0 ${theme.spacing.md}`};
`;

// Grid responsivo: 3 colunas no desktop, 1 no mobile
const CardGrid = styled.section`
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
   gap: ${({ theme }) => theme.spacing.md};
`;

// Valor numérico grande dentro dos cards
const CardValue = styled.strong`
   font-size: ${({ theme }) => theme.typography.sizes["3xl"]};
   font-weight: ${({ theme }) => theme.typography.weights.bold};
   color: ${({ theme }) => theme.colors.text.primary};
   display: block;
   margin-top: 4px;
`;

// Variação/tendência abaixo do número (ex: +12% vs ontem)
const CardHint = styled.span`
   font-size: ${({ theme }) => theme.typography.sizes.xs};
   color: ${({ theme }) => theme.colors.text.muted};
   margin-top: 4px;
   display: block;
`;

// Skeleton: bloco cinza animado que aparece enquanto carrega
const Skeleton = styled.div`
   height: 40px;
   width: 80px;
   border-radius: ${({ theme }) => theme.borderRadius.md};
   background: ${({ theme }) => theme.colors.border};

   // Animação de pulse: vai de opacidade 1 para 0.4 em loop
   @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
   }
   animation: pulse 1.5s ease-in-out infinite;
`;

function StatValue({ value, loading }: { value: number; loading: boolean }) {
   if (loading) return <Skeleton />;
   return <CardValue>{value}</CardValue>;
}

export function Dashboard() {
   const { get, isLoading } = useApi();
   const [data, setData] = useState<DashboardData | null>(null);

   useEffect(() => {
      async function fetchDashboard() {
         try {
            const result = await get<{ status: string; data: DashboardData }>("/admin/dashboard");
            setData(result.data);
         } catch {
            //erro ja tratado pelo hook useApi
         }
      }
      fetchDashboard();
   }, []);

   return (
      <Page>
         <PageHeader>
            <Title>Painel Administrativo</Title>
            <Subtitle>Visão geral do sistema de agendamento</Subtitle>
         </PageHeader>

         {/* ── Seção 1: Usuários ── */}
         <SectionTitle>Usuários cadastrados</SectionTitle>
         <CardGrid>
            <Card title="Total de usuários ativos">
               <StatValue value={data?.totalUsuarios ?? 0} loading={isLoading} />
               <CardHint>Todos os perfis ativos</CardHint>
            </Card>
            <Card title="Empresas (insumos)">
               <StatValue value={data?.totalEmpresas ?? 0} loading={isLoading} />
               <CardHint>Com role company</CardHint>
            </Card>
            <Card title="Transportadoras">
               <StatValue value={data?.totalTransportadoras ?? 0} loading={isLoading} />
               <CardHint>Com role carrier</CardHint>
            </Card>
         </CardGrid>

         {/* ── Seção 2: Agendamentos ── */}
         <SectionTitle>Agendamentos</SectionTitle>
         <CardGrid>
            <Card title="Total de agendamentos">
               <StatValue value={data?.totalAgendamentos ?? 0} loading={isLoading} />
               <CardHint>Todos os períodos</CardHint>
            </Card>
            <Card title="Pendentes">
               <StatValue value={data?.agendamentosPendentes ?? 0} loading={isLoading} />
               <CardHint>Aguardando aprovação</CardHint>
            </Card>
            <Card title="Confirmados">
               <StatValue value={data?.agendamentosConfirmados ?? 0} loading={isLoading} />
               <CardHint>Documentos aprovados</CardHint>
            </Card>
            <Card title="Check-ins realizados">
               <StatValue value={data?.totalCheckins ?? 0} loading={isLoading} />
               <CardHint>Motoristas chegaram</CardHint>
            </Card>
         </CardGrid>
      </Page>
   );
}
