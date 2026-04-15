import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../../components/ui";
import { useApi } from "../../hooks/useApi";

interface Scheduling {
   _id: string;
   driverName: string;
   driverCpf: string;
   vehiclePlate: string;
   vehicleType: string;
   status: string;
   documentStatus: string;
   createdAt: string;
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

   @media (max-width: 640px) {
      flex-direction: column;
      align-items: flex-start;
      gap: ${({ theme }) => theme.spacing.md};
   }
`;

const Title = styled.h1`
   font-size: ${({ theme }) => theme.typography.sizes["2xl"]};
   font-weight: ${({ theme }) => theme.typography.weights.bold};
   color: ${({ theme }) => theme.colors.text.primary};
`;

const Filters = styled.div`
   display: flex;
   gap: ${({ theme }) => theme.spacing.sm};
   flex-wrap: wrap;
   margin-bottom: 1rem;
`;

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

   &:hover {
      border-color: ${({ theme }) => theme.colors.primary};
   }
`;

const TableCard = styled.div`
   background: ${({ theme }) => theme.colors.surface};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.lg};
   overflow-x: auto;
`;

const Table = styled.table`
   width: 100%;
   border-collapse: collapse;
   min-width: 800px;
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
`;

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
   pending: { bg: "#FEF3C7", color: "#92400E" },
   confirmed: { bg: "#DCFCE7", color: "#14532D" },
   checked_in: { bg: "#DBEAFE", color: "#1E3A5F" },
   completed: { bg: "#F1F5F9", color: "#475569" },
   cancelled: { bg: "#FEE2E2", color: "#7F1D1D" },
};

const STATUS_LABELS: Record<string, string> = {
   todos: "Todos",
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

const ALL_FILTERS = ["todos", "pending", "confirmed", "checked_in", "completed", "cancelled"];

export function MeusAgendamentos() {
   const { get, isLoading } = useApi();
   const navigate = useNavigate();
   const [schedulings, setSchedulings] = useState<Scheduling[]>([]);
   const [filter, setFilter] = useState("todos");

   const fetchSchedulings = useCallback(async () => {
      try {
         const url = filter === "todos" ? "/carrier/schedulings" : `/carrier/schedulings?status=${filter}`;
         const result = await get(url);
         setSchedulings(result.data || []);
      } catch {
         setSchedulings([]);
      }
   }, [filter, get]);

   useEffect(() => {
      fetchSchedulings();
   }, [fetchSchedulings]);

   function formatDate(iso: string) {
      return new Date(iso).toLocaleDateString("pt-BR");
   }

   return (
      <Page>
         <PageHeader>
            <Title>Meus Agendamentos</Title>
            <Button onClick={() => navigate("/carrier/novo")}>
               Novo Agendamento
            </Button>
         </PageHeader>

         <Filters>
            {ALL_FILTERS.map(f => (
               <FilterBtn key={f} $active={filter === f} onClick={() => setFilter(f)}>
                  {STATUS_LABELS[f]}
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
                        <Th>Empresa Destino</Th>
                        <Th>Placa / Veículo</Th>
                        <Th>Data / Horário</Th>
                        <Th>Status</Th>
                        <Th>Documentos</Th>
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
                           <Td>{s.companyId?.name ?? "—"}</Td>
                           <Td>
                              <code>{s.vehiclePlate}</code>
                              <br />
                              <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                                 {s.vehicleType}
                              </span>
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
                           <Td>
                              <span style={{ 
                                 fontSize: "0.75rem", 
                                 color: s.documentStatus === "approved" ? "#16A34A" : s.documentStatus === "rejected" ? "#DC2626" : "#D97706"
                              }}>
                                 {s.documentStatus === "approved" ? "Aprovados" : s.documentStatus === "rejected" ? "Rejeitados" : "Em análise"}
                              </span>
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
