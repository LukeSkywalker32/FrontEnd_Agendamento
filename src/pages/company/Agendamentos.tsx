import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import { Button, Input } from "../../components/ui";
import { useApi } from "../../hooks/useApi";
import { formatDate, formatDateOnly, formatDateTime } from "../../utils/dateUtils";

/* ─── Interfaces ─── */

interface Scheduling {
  _id: string;
  driverName: string;
  driverCpf: string;
  driverPhone: string;
  vehiclePlate: string;
  vehicleType: string;
  cargoDescription: string;
  status: string;
  documentStatus: string;
  documents: { filename: string; originalName: string; uploadedAt: string }[];
  rejectionReason: string;
  createdAt: string;
  carrierId: { _id: string; name: string; document: string; phone?: string } | null;
  timeWindowId: {
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    maxVehicles?: number;
    currentCount?: number;
  } | null;
}

interface CheckInItem {
  _id: string;
  driverCpf: string;
  checkinTime: string;
  status: "on_time" | "late" | "early";
  schedulingId: {
    _id: string;
    driverName: string;
    vehiclePlate: string;
    vehicleType: string;
    carrierId: { _id: string; name: string } | null;
    companyId: { _id: string; name: string } | null;
  } | null;
}

/* ─── Styled Components ─── */

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

/* ── Tabs ── */

const TabBar = styled.div`
   display: flex;
   gap: ${({ theme }) => theme.spacing.xs};
   margin-bottom: ${({ theme }) => theme.spacing.lg};
   border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

const Tab = styled.button<{ $active: boolean }>`
   padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   font-weight: ${({ theme }) => theme.typography.weights.semibold};
   color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.text.secondary)};
   background: transparent;
   border: none;
   border-bottom: 2px solid
      ${({ $active, theme }) => ($active ? theme.colors.primary : "transparent")};
   margin-bottom: -2px;
   cursor: pointer;
   transition: all 0.15s ease;

   &:hover {
      color: ${({ theme }) => theme.colors.primary};
   }
`;

/* ── Filtros ── */

const Filters = styled.div`
   display: flex;
   gap: ${({ theme }) => theme.spacing.sm};
   flex-wrap: wrap;
   margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FilterBtn = styled.button<{ $active: boolean }>`
   font-size: ${({ theme }) => theme.typography.sizes.xs};
   font-weight: ${({ theme }) => theme.typography.weights.semibold};
   padding: 5px 14px;
   border-radius: ${({ theme }) => theme.borderRadius.full};
   cursor: pointer;
   border: 1px solid
      ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.border)};
   background: ${({ $active, theme }) => ($active ? theme.colors.primary : "transparent")};
   color: ${({ $active, theme }) =>
     $active ? theme.colors.text.inverse : theme.colors.text.secondary};
   transition: all 0.15s ease;

   &:hover {
      border-color: ${({ theme }) => theme.colors.primary};
   }
`;

/* ── Tabela ── */

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

   tr:last-child & {
      border-bottom: none;
   }
`;

const EmptyState = styled.div`
   padding: ${({ theme }) => theme.spacing["2xl"]};
   text-align: center;
   color: ${({ theme }) => theme.colors.text.muted};
   font-size: ${({ theme }) => theme.typography.sizes.sm};
`;

const ActionGroup = styled.div`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.xs};
   flex-wrap: wrap;
`;

/* ── Badges ── */

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#FEF3C7", color: "#92400E" },
  confirmed: { bg: "#DCFCE7", color: "#14532D" },
  checked_in: { bg: "#DBEAFE", color: "#1E3A5F" },
  completed: { bg: "#F1F5F9", color: "#475569" },
  cancelled: { bg: "#FEE2E2", color: "#7F1D1D" },
  approved: { bg: "#DCFCE7", color: "#14532D" },
  rejected: { bg: "#FEE2E2", color: "#7F1D1D" },
  on_time: { bg: "#DCFCE7", color: "#14532D" },
  late: { bg: "#FEE2E2", color: "#7F1D1D" },
  early: { bg: "#FEF3C7", color: "#92400E" },
  not_attached: { bg: "#F1F5F9", color: "#475569" },
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  checked_in: "Check-in",
  completed: "Concluído",
  cancelled: "Cancelado",
  approved: "Aprovado",
  rejected: "Rejeitado",
  on_time: "No horário",
  late: "Atrasado",
  early: "Adiantado",
  note_attached: "Sem Documento",
};

const StatusBadge = styled.span<{ $status: string }>`
   font-size: 11px;
   font-weight: 600;
   padding: 3px 10px;
   border-radius: 9999px;
   background: ${({ $status }) => STATUS_COLORS[$status]?.bg ?? "#F1F5F9"};
   color: ${({ $status }) => STATUS_COLORS[$status]?.color ?? "#475569"};
`;

/* ── Modal ── */

const Overlay = styled.div`
   position: fixed;
   inset: 0;
   background: rgba(0, 0, 0, 0.5);
   display: flex;
   align-items: center;
   justify-content: center;
   z-index: 1000;
`;

const ModalBox = styled.div<{ $width?: string }>`
   background: ${({ theme }) => theme.colors.surface};
   border-radius: ${({ theme }) => theme.borderRadius.lg};
   padding: ${({ theme }) => theme.spacing.xl};
   width: ${({ $width }) => $width ?? "560px"};
   max-width: 95vw;
   max-height: 90vh;
   overflow-y: auto;
   box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalTitle = styled.h2`
   font-size: ${({ theme }) => theme.typography.sizes.lg};
   font-weight: ${({ theme }) => theme.typography.weights.bold};
   color: ${({ theme }) => theme.colors.text.primary};
   margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ModalActions = styled.div`
   display: flex;
   justify-content: flex-end;
   gap: ${({ theme }) => theme.spacing.sm};
   margin-top: ${({ theme }) => theme.spacing.lg};
`;

const DetailRow = styled.div`
   display: flex;
   justify-content: space-between;
   padding: ${({ theme }) => `${theme.spacing.xs} 0`};
   border-bottom: 1px solid ${({ theme }) => theme.colors.border};

   &:last-child {
      border-bottom: none;
   }
`;

const DetailLabel = styled.span`
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: ${({ theme }) => theme.colors.text.muted};
`;

const DetailValue = styled.span`
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: ${({ theme }) => theme.colors.text.primary};
   font-weight: ${({ theme }) => theme.typography.weights.medium};
   text-align: right;
   max-width: 60%;
`;

const FormStack = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.md};
`;

const RejectionBox = styled.div`
   background: #fef2f2;
   border: 1px solid #fecaca;
   border-radius: ${({ theme }) => theme.borderRadius.md};
   padding: ${({ theme }) => theme.spacing.md};
   margin-top: ${({ theme }) => theme.spacing.md};
`;

const RejectionText = styled.p`
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: #991b1b;
   font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

const DocValidationBox = styled.div`
   background: ${({ theme }) => theme.colors.background};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.md};
   padding: ${({ theme }) => theme.spacing.md};
   margin-top: ${({ theme }) => theme.spacing.lg};
`;

const DocValidationTitle = styled.h3`
   font-size: ${({ theme }) => theme.typography.sizes.md};
   font-weight: ${({ theme }) => theme.typography.weights.semibold};
   color: ${({ theme }) => theme.colors.text.primary};
   margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Label = styled.label`
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: ${({ theme }) => theme.colors.text.secondary};
   font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

/* ─── Filtros de status ─── */

const ALL_FILTERS = ["todos", "pending", "confirmed", "checked_in", "completed", "cancelled"];

/* ─── Tipos de modal ─── */

type ModalType = "detail" | null;

/* ─── Componente ─── */

export function Agendamentos() {
  const { get, patch, isLoading } = useApi();

  const [activeTab, setActiveTab] = useState<"schedulings" | "checkins">("schedulings");

  /* ── Schedulings state ── */
  const [schedulings, setSchedulings] = useState<Scheduling[]>([]);
  const [filter, setFilter] = useState("todos");

  /* ── Check-ins state ── */
  const [checkins, setCheckins] = useState<CheckInItem[]>([]);

  /* ── Modal state ── */
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selected, setSelected] = useState<Scheduling | null>(null);

  /* ── Validação de documentos ── */
  const [rejectionReason, setRejectionReason] = useState("");

  /* ════════════════════════════════════════════
      FETCH DATA
      ════════════════════════════════════════════ */

  const fetchSchedulings = useCallback(async () => {
    try {
      const url =
        filter === "todos" ? "/company/schedulings" : `/company/schedulings?status=${filter}`;
      const result = await get<{ status: string; data: Scheduling[] }>(url);
      setSchedulings(result.data);
    } catch {
      setSchedulings([]);
    }
  }, [get, filter]);

  const fetchCheckins = useCallback(async () => {
    try {
      const result = await get<{ status: string; data: CheckInItem[] }>("/company/checkins");
      setCheckins(result.data);
    } catch {
      setCheckins([]);
    }
  }, [get]);

  useEffect(() => {
    if (activeTab === "schedulings") fetchSchedulings();
    else fetchCheckins();
  }, [activeTab, fetchSchedulings, fetchCheckins]);

  /* ════════════════════════════════════════════
      HELPERS
      ════════════════════════════════════════════ */

  // formatDate, formatDateOnly e formatDateTime importados de utils/dateUtils

  function closeModal() {
    setModalType(null);
    setSelected(null);
    setRejectionReason("");
  }

  /* ════════════════════════════════════════════
      VER DETALHES (GET /company/schedulings/:id)
      ════════════════════════════════════════════ */

  async function handleOpenDetail(id: string) {
    try {
      const result = await get<{ status: string; data: Scheduling }>(`/company/schedulings/${id}`);
      setSelected(result.data);
      setRejectionReason("");
      setModalType("detail");
    } catch {
      toast.error("Erro ao carregar detalhes do agendamento.");
    }
  }

  /* ════════════════════════════════════════════
      VALIDAR DOCUMENTOS
      PATCH /company/schedulings/:id/documents
      ════════════════════════════════════════════ */

  async function handleApproveDocuments() {
    if (!selected) return;

    try {
      await patch(`/company/schedulings/${selected._id}/documents`, {
        status: "approved",
      });
      toast.success("Documentos aprovados! Agendamento confirmado.");
      closeModal();
      fetchSchedulings();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Erro ao aprovar documentos.";
      toast.error(msg);
    }
  }

  async function handleRejectDocuments() {
    if (!selected) return;

    if (!rejectionReason.trim()) {
      toast.warning("Informe o motivo da rejeição.");
      return;
    }

    try {
      await patch(`/company/schedulings/${selected._id}/documents`, {
        status: "rejected",
        rejectionReason: rejectionReason.trim(),
      });
      toast.success("Documentos rejeitados. A transportadora será notificada.");
      closeModal();
      fetchSchedulings();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Erro ao rejeitar documentos.";
      toast.error(msg);
    }
  }

  /* ════════════════════════════════════════════
      RENDER
      ════════════════════════════════════════════ */

  return (
    <Page>
      <PageHeader>
        <Title>Agendamentos</Title>
      </PageHeader>

      {/* ── Tabs ── */}
      <TabBar>
        <Tab $active={activeTab === "schedulings"} onClick={() => setActiveTab("schedulings")}>
          Agendamentos Recebidos
        </Tab>
        <Tab $active={activeTab === "checkins"} onClick={() => setActiveTab("checkins")}>
          Check-ins
        </Tab>
      </TabBar>

      {/* ════════════════════════════════════════════
             ABA: AGENDAMENTOS RECEBIDOS
             ════════════════════════════════════════════ */}
      {activeTab === "schedulings" && (
        <>
          <Filters>
            {ALL_FILTERS.map(f => (
              <FilterBtn key={f} $active={filter === f} onClick={() => setFilter(f)}>
                {STATUS_LABELS[f] ?? "Todos"}
              </FilterBtn>
            ))}
          </Filters>

          <TableCard>
            {isLoading ? (
              <EmptyState>Carregando agendamentos...</EmptyState>
            ) : schedulings.length === 0 ? (
              <EmptyState>Nenhum agendamento encontrado.</EmptyState>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Motorista</Th>
                    <Th>Transportadora</Th>
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
                      <Td>
                        <strong>{s.driverName}</strong>
                        <br />
                        <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>{s.driverCpf}</span>
                      </Td>
                      <Td>{s.carrierId?.name ?? "—"}</Td>
                      <Td>
                        <code>{s.vehiclePlate}</code>
                      </Td>
                      <Td>
                        {s.timeWindowId
                          ? `${formatDateOnly(s.timeWindowId.date)} ${s.timeWindowId.startTime}–${s.timeWindowId.endTime}`
                          : "—"}
                      </Td>
                      <Td>
                        <StatusBadge $status={s.status}>
                          {STATUS_LABELS[s.status] ?? s.status}
                        </StatusBadge>
                      </Td>
                      <Td>
                        <StatusBadge $status={s.documentStatus}>
                          {STATUS_LABELS[s.documentStatus] ?? s.documentStatus}
                        </StatusBadge>
                      </Td>
                      <Td>{formatDate(s.createdAt)}</Td>
                      <Td>
                        <ActionGroup>
                          <Button
                            variant="secondary"
                            style={{
                              fontSize: "0.7rem",
                              padding: "4px 8px",
                            }}
                            onClick={() => handleOpenDetail(s._id)}
                          >
                            Ver
                          </Button>

                          {/* Atalho: se docs pendentes, mostra botão direto */}
                          {s.documentStatus === "pending" &&
                            s.documents?.length > 0 &&
                            s.status !== "cancelled" && (
                              <Button
                                style={{
                                  fontSize: "0.7rem",
                                  padding: "4px 8px",
                                }}
                                onClick={() => handleOpenDetail(s._id)}
                              >
                                Validar Docs
                              </Button>
                            )}
                        </ActionGroup>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </TableCard>
        </>
      )}

      {/* ════════════════════════════════════════════
             ABA: CHECK-INS
             ════════════════════════════════════════════ */}
      {activeTab === "checkins" && (
        <TableCard>
          {isLoading ? (
            <EmptyState>Carregando check-ins...</EmptyState>
          ) : checkins.length === 0 ? (
            <EmptyState>Nenhum check-in registrado.</EmptyState>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Motorista</Th>
                  <Th>CPF</Th>
                  <Th>Placa</Th>
                  <Th>Tipo Veículo</Th>
                  <Th>Transportadora</Th>
                  <Th>Horário Check-in</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {checkins.map(ci => (
                  <tr key={ci._id}>
                    <Td>
                      <strong>{ci.schedulingId?.driverName ?? "—"}</strong>
                    </Td>
                    <Td>{ci.driverCpf}</Td>
                    <Td>
                      <code>{ci.schedulingId?.vehiclePlate ?? "—"}</code>
                    </Td>
                    <Td>{ci.schedulingId?.vehicleType ?? "—"}</Td>
                    <Td>{ci.schedulingId?.carrierId?.name ?? "—"}</Td>
                    <Td>{formatDateTime(ci.checkinTime)}</Td>
                    <Td>
                      <StatusBadge $status={ci.status}>
                        {STATUS_LABELS[ci.status] ?? ci.status}
                      </StatusBadge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </TableCard>
      )}

      {/* ════════════════════════════════════════════
             MODAL: DETALHES + VALIDAÇÃO DE DOCUMENTOS
             ════════════════════════════════════════════ */}
      {modalType === "detail" && selected && (
        <Overlay onClick={closeModal}>
          <ModalBox onClick={e => e.stopPropagation()} $width="600px">
            <ModalTitle>Detalhes do Agendamento</ModalTitle>

            {/* ── Dados gerais ── */}
            <DetailRow>
              <DetailLabel>Motorista</DetailLabel>
              <DetailValue>{selected.driverName}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>CPF</DetailLabel>
              <DetailValue>{selected.driverCpf}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Telefone</DetailLabel>
              <DetailValue>{selected.driverPhone || "—"}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Transportadora</DetailLabel>
              <DetailValue>{selected.carrierId?.name ?? "—"}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Placa</DetailLabel>
              <DetailValue>
                <code>{selected.vehiclePlate}</code>
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Tipo de Veículo</DetailLabel>
              <DetailValue>{selected.vehicleType}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Carga</DetailLabel>
              <DetailValue>{selected.cargoDescription || "—"}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Horário</DetailLabel>
              <DetailValue>
                {selected.timeWindowId
                  ? `${formatDateOnly(selected.timeWindowId.date)} ${selected.timeWindowId.startTime}–${selected.timeWindowId.endTime}`
                  : "—"}
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Status</DetailLabel>
              <DetailValue>
                <StatusBadge $status={selected.status}>
                  {STATUS_LABELS[selected.status] ?? selected.status}
                </StatusBadge>
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Documentos</DetailLabel>
              <DetailValue>
                <StatusBadge $status={selected.documentStatus}>
                  {STATUS_LABELS[selected.documentStatus] ?? selected.documentStatus}
                </StatusBadge>
              </DetailValue>
            </DetailRow>

            {/* ── Motivo de rejeição anterior ── */}
            {selected.documentStatus === "rejected" && selected.rejectionReason && (
              <RejectionBox>
                <RejectionText>Motivo da última rejeição: {selected.rejectionReason}</RejectionText>
              </RejectionBox>
            )}

            {/* ── Lista de documentos enviados ── */}
            {selected.documents && selected.documents.length > 0 && (
              <>
                <Label style={{ display: "block", marginTop: "16px" }}>Arquivos enviados:</Label>
                {selected.documents.map(doc => (
                  <DetailRow key={doc.filename}>
                    <DetailLabel>
                      <a
                        href={`http://localhost:3333/uploads/${doc.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        📄 {doc.originalName}
                      </a>
                    </DetailLabel>
                    <DetailValue style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                      {formatDate(doc.uploadedAt)}
                    </DetailValue>
                  </DetailRow>
                ))}
              </>
            )}

            {/* modal para quando não tem documentos */}
            {selected.documentStatus === "not_attached" && (
              <RejectionBox
                style={{ background: "#FEF3C7", borderColor: "#FDE68A", marginTop: "12px" }}
              >
                <RejectionText style={{ color: "#92400E" }}>
                  ⏳ Nenhum documento enviado ainda. Aguarde o envio da transportadora.
                </RejectionText>
              </RejectionBox>
            )}

            {/* ════════════════════════════════════
                      SEÇÃO DE VALIDAÇÃO DE DOCUMENTOS
                      Só aparece quando faz sentido validar
                      ════════════════════════════════════ */}
            {selected.documentStatus === "pending" &&
              selected.documents?.length > 0 &&
              selected.status !== "cancelled" && (
                <DocValidationBox>
                  <DocValidationTitle>✅ Validar Documentos</DocValidationTitle>

                  <FormStack>
                    <Input
                      id="rejectionReason"
                      label="Motivo da rejeição (obrigatório se rejeitar)"
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      placeholder="Ex: CNH vencida, documento ilegível..."
                    />

                    <div style={{ display: "flex", gap: "8px" }}>
                      <Button
                        onClick={handleApproveDocuments}
                        disabled={isLoading}
                        style={{ flex: 1 }}
                      >
                        {isLoading ? "Aprovando..." : "✓ Aprovar Documentos"}
                      </Button>
                      <Button
                        onClick={handleRejectDocuments}
                        disabled={isLoading}
                        style={{
                          flex: 1,
                          background: "#DC2626",
                        }}
                      >
                        {isLoading ? "Rejeitando..." : "✗ Rejeitar Documentos"}
                      </Button>
                    </div>
                  </FormStack>
                </DocValidationBox>
              )}

            <ModalActions>
              <Button variant="secondary" onClick={closeModal}>
                Fechar
              </Button>
            </ModalActions>
          </ModalBox>
        </Overlay>
      )}
    </Page>
  );
}
