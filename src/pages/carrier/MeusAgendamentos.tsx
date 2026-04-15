import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import { Button } from "../../components/ui";
import { useApi } from "../../hooks/useApi";

//--- Interface espelho do backend---
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

// STYLED COMPONENTS

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

// Linha de filtros: botões que mudam de cor quando ativos
const Filters = styled.div`
   display: flex;
   gap: ${({ theme }) => theme.spacing.sm};
   flex-wrap: wrap;
   margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

// Botão de filtro que muda de aparência quando ativo
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

// Card branco que envolve a tabela
const TableCard = styled.div`
   background: ${({ theme }) => theme.colors.surface};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.lg};
   overflow: hidden;
`;

// Tabela nativa HTML com reset de estilos
const Table = styled.table`
   width: 100%;
   border-collapse: collapse;
`;

// Header da tabela: fundo cinza claro, texto pequeno
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

// Célula da tabela
const Td = styled.td`
   padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: ${({ theme }) => theme.colors.text.primary};
   border-bottom: 1px solid ${({ theme }) => theme.colors.border};
   vertical-align: middle;

   tr:last-child & {
      border-bottom: none;
   }
`;

// MAPEAMENTO DE CORES POR STATUS

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#FEF3C7", color: "#92400E" },
  confirmed: { bg: "#DCFCE7", color: "#14532D" },
  checked_in: { bg: "#DBEAFE", color: "#1E3A5F" },
  completed: { bg: "#F1F5F9", color: "#475569" },
  cancelled: { bg: "#FEE2E2", color: "#7F1D1D" },
};

// Labels em PT-BR para os status
const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  checked_in: "Check-in",
  completed: "Concluído",
  cancelled: "Cancelado",
};

// Badge colorida que mostra o status
const StatusBadge = styled.span<{ $status: string }>`
   font-size: 11px;
   font-weight: 600;
   padding: 3px 10px;
   border-radius: 9999px;
   background: ${({ $status }) => STATUS_COLORS[$status]?.bg ?? "#F1F5F9"};
   color: ${({ $status }) => STATUS_COLORS[$status]?.color ?? "#475569"};
`;

// Mensagem centralizada para tabela vazia ou erro
const EmptyState = styled.div`
   padding: ${({ theme }) => theme.spacing["2xl"]};
   text-align: center;
   color: ${({ theme }) => theme.colors.text.muted};
   font-size: ${({ theme }) => theme.typography.sizes.sm};
`;

// Container de ações (botões)
const ActionGroup = styled.div`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.xs};
   flex-wrap: wrap;
`;

// Todos os filtros disponíveis
const ALL_FILTERS = ["todos", "pending", "confirmed", "checked_in", "completed", "cancelled"];

export function MeusAgendamentos() {
  const { get, isLoading } = useApi();
  const [schedulings, setSchedulings] = useState<Scheduling[]>([]);
  const [filter, setFilter] = useState<string>("todos");

  const fetchSchedulings = useCallback(async () => {
    try {
      const url =
        filter === "todos" ? "carrier/schedulings" : `carrier/schedulings?status=${filter}`;
      const result = await get<{ status: string; data: Scheduling[] }>(url);
      setSchedulings(result.data);
    } catch (err) {
      console.error("Erro ao buscar agendamentos:", err);
      setSchedulings([]);
    }
  }, [get, filter]);

  useEffect(() => {
    fetchSchedulings();
  }, [fetchSchedulings]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR");
  }

  return (
    <Page>
      {/* Cabeçalho com título */}
      <PageHeader>
        <Title>Meus Agendamentos</Title>
      </PageHeader>
      {/* Filtros */}
      <Filters>
        {ALL_FILTERS.map(f => (
          <FilterBtn key={f} $active={filter === f} onClick={() => setFilter(f)}>
            {STATUS_LABELS[f] ?? "Todos"}
          </FilterBtn>
        ))}
      </Filters>

      {/* Tabela de agendamentos */}
      <TableCard>
        {isLoading ? (
          <EmptyState>Carregando seus agendamentos...</EmptyState>
        ) : schedulings.length === 0 ? (
          <EmptyState>Nenhum agendamento encontrado.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Motorista</Th>
                <Th>Empresa</Th>
                <Th>Placa</Th>
                <Th>Horário</Th>
                <Th>Status</Th>
                <Th>Documentos</Th>
                <Th>Criado em</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {schedulings.map(s => (
                <tr key={s._id}>
                  {/* Motorista + CPF em duas linhas */}
                  <Td>
                    <strong>{s.driverName}</strong>
                    <br />
                    <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>{s.driverCpf}</span>
                  </Td>

                  {/* Empresa contratante */}
                  <Td>{s.companyId?.name ?? "—"}</Td>

                  {/* Placa em monospace */}
                  <Td>
                    <code>{s.vehiclePlate}</code>
                  </Td>

                  {/* Data e horário */}
                  <Td>
                    {s.timeWindowId
                      ? `${formatDate(s.timeWindowId.date)} ${s.timeWindowId.startTime}–${s.timeWindowId.endTime}`
                      : "—"}
                  </Td>

                  {/* Status com cor */}
                  <Td>
                    <StatusBadge $status={s.status}>
                      {STATUS_LABELS[s.status] ?? s.status}
                    </StatusBadge>
                  </Td>

                  {/* Status dos documentos */}
                  <Td>
                    <StatusBadge $status={s.documentStatus}>
                      {s.documentStatus === "pending"
                        ? "Análise"
                        : s.documentStatus === "approved"
                          ? "✓ Aprovado"
                          : "✗ Rejeitado"}
                    </StatusBadge>
                  </Td>

                  {/* Data de criação */}
                  <Td>{formatDate(s.createdAt)}</Td>

                  {/* Ações: botões que mudam conforme status */}
                  <Td>
                    <ActionGroup>
                      {/*
                                    Se está "pending" e docs foram rejeitados,
                                    mostra botão pra enviar novos docs
                                 */}
                      {s.status === "pending" && s.documentStatus === "rejected" && (
                        <Button
                          variant="secondary"
                          style={{ fontSize: "0.7rem", padding: "4px 8px" }}
                        >
                          Reenviar
                        </Button>
                      )}

                      {/* Se está "pending", permite editar */}
                      {s.status === "pending" && (
                        <Button variant="ghost" style={{ fontSize: "0.7rem", padding: "4px 8px" }}>
                          Editar
                        </Button>
                      )}

                      {/* Se está "pending" ou "confirmed", permite cancelar */}
                      {(s.status === "pending" || s.status === "confirmed") && (
                        <Button
                          variant="ghost"
                          style={{
                            fontSize: "0.7rem",
                            padding: "4px 8px",
                            color: "var(--error-color)",
                          }}
                        >
                          Cancelar
                        </Button>
                      )}

                      {/* Sempre tem opção de ver detalhes */}
                      <Button
                        variant="secondary"
                        style={{ fontSize: "0.7rem", padding: "4px 8px" }}
                      >
                        Ver
                      </Button>
                    </ActionGroup>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </TableCard>
    </Page>
  );
}
