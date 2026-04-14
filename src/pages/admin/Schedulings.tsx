import { useEffect, useState } from "react";
import styled from "styled-components";
import { useApi } from "../../hooks/useApi";

// Tipagem baseada no que /api/admin/schedulings retorna (com populate)
interface Scheduling {
   _id: string;
   driverName: string;
   driverCpf: string;
   vehiclePlate: string;
   vehicleType: string;
   status: string;
   documentStatus: string;
   createdAt: string;
   carrierId: { name: string; document: string } | null;
   companyId: { name: string; document: string } | null;
   timeWindowId: { date: string; startTime: string; endTime: string } | null;
}

const Page = styled.main`
   flex: 1;
   overflow-y: auto;
   padding: ${({ theme }) => theme.spacing.xl};
   background: ${({ theme }) => theme.colors.background};
`;

const PageHeader = styled.div`
   display: flex;
   align-items: center;
   justify-content: space-between;
   margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
   font-size: ${({ theme }) => theme.typography.sizes["2xl"]};
   font-weight: ${({ theme }) => theme.typography.weights.bold};
   color: ${({ theme }) => theme.colors.text.primary};
`;

// Filtros de status: botões de filtro rápido
const Filters = styled.div`
   display: flex;
   gap: ${({ theme }) => theme.spacing.sm};
   flex-wrap: wrap;
`;

// Botão de filtro: filled quando ativo, ghost quando inativo
const FilterBtn = styled.button<{ $active: boolean }>`
   font-size: ${({ theme }) => theme.typography.sizes.xs};
   font-weight: ${({ theme }) => theme.typography.weights.semibold};
   padding: 5px 14px;
   border-radius: ${({ theme }) => theme.borderRadius.full};
   cursor: pointer;
   border: 1px solid ${({ $active, theme }) =>
      $active ? theme.colors.primary : theme.colors.border};
   background: ${({ $active, theme }) => ($active ? theme.colors.primary : "transparent")};
   color: ${({ $active, theme }) =>
      $active ? theme.colors.text.inverse : theme.colors.text.secondary};
   transition: all 0.15s ease;
`;

const TableCard = styled.div`
   background: ${({ theme }) => theme.colors.surface};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.lg};
   overflow: hidden;
`;

const Table = styled.table`
   width: 100%;
   border-collapse: collapse;
`;

const Th = styled.th`
   text-align: left;
   padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
   font-size: ${({ theme }) => theme.typography.sizes.xs};
   font-weight: ${({ theme }) => theme.typography.weights.semibold};
   color: ${({ theme }) => theme.colors.text.secondary};
   text-transform: uppercase;
   letter-spacing: 0.5px;
   border-bottom: 1px solid ${({ theme }) => theme.colors.border};
   background: ${({ theme }) => theme.colors.background};
`;

const Td = styled.td`
   padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: ${({ theme }) => theme.colors.text.primary};
   border-bottom: 1px solid ${({ theme }) => theme.colors.border};
   vertical-align: middle;
   tr:last-child & { border-bottom: none; }
`;

// Mapeamento de status → cores do tema
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
   pending: { bg: "#FEF3C7", color: "#92400E" },
   confirmed: { bg: "#DCFCE7", color: "#14532D" },
   checked_in: { bg: "#DBEAFE", color: "#1E3A5F" },
   completed: { bg: "#F1F5F9", color: "#475569" },
   cancelled: { bg: "#FEE2E2", color: "#7F1D1D" },
};

// Labels em PT-BR para os status da API
const STATUS_LABELS: Record<string, string> = {
   pending: "Pendente",
   confirmed: "Confirmado",
   checked_in: "Check-in",
   completed: "Concluído",
   cancelled: "Cancelado",
};

const StatusBadge = styled.span<{ $status: string }>`
   font-size: 11px;
   font-weight: 600;
   padding: 3px 10px;
   border-radius: 9999px;
   background: ${({ $status }) => STATUS_COLORS[$status]?.bg ?? "#F1F5F9"};
   color:      ${({ $status }) => STATUS_COLORS[$status]?.color ?? "#475569"};
`;

const EmptyState = styled.div`
   padding: ${({ theme }) => theme.spacing["2xl"]};
   text-align: center;
   color: ${({ theme }) => theme.colors.text.muted};
   font-size: ${({ theme }) => theme.typography.sizes.sm};
`;

// Todos os filtros disponíveis
const ALL_FILTERS = ["todos", "pending", "confirmed", "checked_in", "completed", "cancelled"];

export function AdminSchedulings() {
   const { get, isLoading } = useApi();
   const [schedulings, setSchedulings] = useState<Scheduling[]>([]);
   const [filter, setFilter] = useState("todos"); // filtro ativo

   useEffect(() => {
      fetchSchedulings();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [filter]); // Re-busca quando o filtro muda

   async function fetchSchedulings() {
      try {
         // Se o filtro for "todos", não passa query param (retorna todos)
         const url =
            filter === "todos" ? "/admin/schedulings" : `/admin/schedulings?status=${filter}`;

         const result = await get<{ status: string; data: Scheduling[] }>(url);
         setSchedulings(result.data);
      } catch {
         setSchedulings([]);
      }
   }

   // Formata data ISO para DD/MM/YYYY
   function formatDate(iso: string) {
      return new Date(iso).toLocaleDateString("pt-BR");
   }

   return (
      <Page>
         <PageHeader>
            <Title>Agendamentos</Title>
         </PageHeader>

         {/* Botões de filtro rápido */}
         <Filters style={{ marginBottom: "1rem" }}>
            {ALL_FILTERS.map(f => (
               <FilterBtn key={f} $active={filter === f} onClick={() => setFilter(f)}>
                  {STATUS_LABELS[f] ?? "Todos"}
               </FilterBtn>
            ))}
         </Filters>

         <TableCard>
            {isLoading ? (
               <EmptyState>Carregando...</EmptyState>
            ) : schedulings.length === 0 ? (
               <EmptyState>Nenhum agendamento encontrado.</EmptyState>
            ) : (
               <Table>
                  <thead>
                     <tr>
                        <Th>Motorista</Th>
                        <Th>Transportadora</Th>
                        <Th>Empresa</Th>
                        <Th>Placa</Th>
                        <Th>Horário</Th>
                        <Th>Status</Th>
                        <Th>Criado em</Th>
                     </tr>
                  </thead>
                  <tbody>
                     {schedulings.map(s => (
                        <tr key={s._id}>
                           <Td>
                              <strong>{s.driverName}</strong>
                              <br />
                              <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                                 {s.driverCpf}
                              </span>
                           </Td>
                           <Td>{s.carrierId?.name ?? "—"}</Td>
                           <Td>{s.companyId?.name ?? "—"}</Td>
                           <Td>
                              <code>{s.vehiclePlate}</code>
                           </Td>
                           <Td>
                              {s.timeWindowId
                                 ? `${formatDate(s.timeWindowId.date)} ${s.timeWindowId.startTime}–${s.timeWindowId.endTime}`
                                 : "—"}
                           </Td>
                           <Td>
                              <StatusBadge $status={s.status}>
                                 {STATUS_LABELS[s.status] ?? s.status}
                              </StatusBadge>
                           </Td>
                           <Td>{formatDate(s.createdAt)}</Td>
                        </tr>
                     ))}
                  </tbody>
               </Table>
            )}
         </TableCard>
      </Page>
   );
}
