import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import { Button, Input } from "../../components/ui";
import { useApi } from "../../hooks/useApi";
import { formatDate, formatDateOnly } from "../../utils/dateUtils";

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
  documents: { originalName: string; uploadedAt: string }[];
  rejectionReason: string;
  createdAt: string;
  companyId: { _id: string; name: string; document: string; phone?: string } | null;
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

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#FEF3C7", color: "#92400E" },
  confirmed: { bg: "#DCFCE7", color: "#14532D" },
  checked_in: { bg: "#DBEAFE", color: "#1E3A5F" },
  completed: { bg: "#F1F5F9", color: "#475569" },
  cancelled: { bg: "#FEE2E2", color: "#7F1D1D" },
};

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
   color: ${({ $status }) => STATUS_COLORS[$status]?.color ?? "#475569"};
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

/* ─── Modal genérico ─── */

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
   width: ${({ $width }) => $width ?? "520px"};
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

const FormRow = styled.div`
   display: grid;
   grid-template-columns: 1fr 1fr;
   gap: ${({ theme }) => theme.spacing.md};

   @media (max-width: 640px) {
      grid-template-columns: 1fr;
   }
`;

const FormGroup = styled.div`
   display: flex;
   flex-direction: column;
   gap: 4px;
`;

const Label = styled.label`
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: ${({ theme }) => theme.colors.text.secondary};
   font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

const Select = styled.select`
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.md};
   padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
   background: ${({ theme }) => theme.colors.surface};
   color: ${({ theme }) => theme.colors.text.primary};
   font-size: ${({ theme }) => theme.typography.sizes.md};
   font-family: inherit;
   width: 100%;

   &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
   }
`;

const FileInput = styled.input`
   margin-top: 4px;
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: ${({ theme }) => theme.colors.text.secondary};

   &::file-selector-button {
      padding: 8px 16px;
      border-radius: ${({ theme }) => theme.borderRadius.md};
      border: 1px solid ${({ theme }) => theme.colors.border};
      background: ${({ theme }) => theme.colors.surface};
      cursor: pointer;
      margin-right: 12px;
      transition: all 0.2s;

      &:hover {
         background: ${({ theme }) => theme.colors.surfaceHover};
      }
   }
`;

const WarningText = styled.p`
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: ${({ theme }) => theme.colors.text.secondary};
   line-height: 1.6;
`;

const RejectionBox = styled.div`
   background: #fef2f2;
   border: 1px solid #fecaca;
   border-radius: ${({ theme }) => theme.borderRadius.md};
   padding: ${({ theme }) => theme.spacing.md};
   margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const RejectionText = styled.p`
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: #991b1b;
   font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

/* ─── Filtros ─── */

const ALL_FILTERS = ["todos", "pending", "confirmed", "checked_in", "completed", "cancelled"];

/* ─── Tipos de modal ─── */

type ModalType = "detail" | "edit" | "cancel" | "resend" | null;

/* ─── Componente ─── */

export function MeusAgendamentos() {
  const { get, put, patch, post, isLoading } = useApi();

  const [schedulings, setSchedulings] = useState<Scheduling[]>([]);
  const [filter, setFilter] = useState<string>("todos");

  // Modal
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selected, setSelected] = useState<Scheduling | null>(null);

  // Form de edição
  const [editForm, setEditForm] = useState({
    driverName: "",
    driverCpf: "",
    driverPhone: "",
    vehiclePlate: "",
    vehicleType: "",
    cargoDescription: "",
  });

  // Reenvio de documentos
  const [resendFiles, setResendFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Buscar agendamentos ── */

  const fetchSchedulings = useCallback(async () => {
    try {
      const url =
        filter === "todos" ? "/carrier/schedulings" : `/carrier/schedulings?status=${filter}`;
      const result = await get<{ status: string; data: Scheduling[] }>(url);
      setSchedulings(result.data);
    } catch {
      setSchedulings([]);
    }
  }, [get, filter]);

  useEffect(() => {
    fetchSchedulings();
  }, [fetchSchedulings]);

  /* ── Helpers ── */

  // formatDate e formatDateOnly importados de utils/dateUtils

  function closeModal() {
    setModalType(null);
    setSelected(null);
    setResendFiles([]);
  }

  /* ── 1. VER DETALHES ── */

  async function handleOpenDetail(id: string) {
    try {
      const result = await get<{ status: string; data: Scheduling }>(`/carrier/schedulings/${id}`);
      setSelected(result.data);
      setModalType("detail");
    } catch {
      toast.error("Erro ao carregar detalhes do agendamento.");
    }
  }

  /* ── 2. EDITAR ── */

  function handleOpenEdit(s: Scheduling) {
    setSelected(s);
    setEditForm({
      driverName: s.driverName,
      driverCpf: s.driverCpf,
      driverPhone: s.driverPhone ?? "",
      vehiclePlate: s.vehiclePlate,
      vehicleType: s.vehicleType,
      cargoDescription: s.cargoDescription ?? "",
    });
    setModalType("edit");
  }

  async function handleSubmitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;

    try {
      await put(`/carrier/schedulings/${selected._id}`, editForm);
      toast.success("Agendamento atualizado com sucesso!");
      closeModal();
      fetchSchedulings();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Erro ao atualizar agendamento.";
      toast.error(msg);
    }
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  }

  /* ── 3. CANCELAR ── */

  function handleOpenCancel(s: Scheduling) {
    setSelected(s);
    setModalType("cancel");
  }

  async function handleConfirmCancel() {
    if (!selected) return;

    try {
      await patch(`/carrier/schedulings/${selected._id}/cancel`);
      toast.success("Agendamento cancelado com sucesso.");
      closeModal();
      fetchSchedulings();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Erro ao cancelar agendamento.";
      toast.error(msg);
    }
  }

  /* ── 4. REENVIAR DOCUMENTOS ── */

  function handleOpenResend(s: Scheduling) {
    setSelected(s);
    setResendFiles([]);
    setModalType("resend");
  }

  function handleResendFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setResendFiles(Array.from(e.target.files));
    }
  }

  async function handleSubmitResend(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;

    if (resendFiles.length === 0) {
      toast.warning("Selecione pelo menos um arquivo.");
      return;
    }

    try {
      const formData = new FormData();
      // biome-ignore lint/suspicious/useIterableCallbackReturn: <explanation>
      resendFiles.forEach(file => formData.append("documents", file));

      await post(`/carrier/schedulings/${selected._id}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Documentos reenviados com sucesso!");
      closeModal();
      fetchSchedulings();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Erro ao reenviar documentos.";
      toast.error(msg);
    }
  }

  /* ─── Render ─── */

  return (
    <Page>
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

      {/* Tabela */}
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
                  <Td>
                    <strong>{s.driverName}</strong>
                    <br />
                    <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>{s.driverCpf}</span>
                  </Td>
                  <Td>{s.companyId?.name ?? "—"}</Td>
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
                      {s.documentStatus === "pending"
                        ? "Análise"
                        : s.documentStatus === "approved"
                          ? "✓ Aprovado"
                          : "✗ Rejeitado"}
                    </StatusBadge>
                  </Td>
                  <Td>{formatDate(s.createdAt)}</Td>
                  <Td>
                    <ActionGroup>
                      {/* REENVIAR: docs rejeitados + status pending */}
                      {s.status === "pending" && s.documentStatus === "rejected" && (
                        <Button
                          variant="secondary"
                          style={{ fontSize: "0.7rem", padding: "4px 8px" }}
                          onClick={() => handleOpenResend(s)}
                        >
                          Reenviar
                        </Button>
                      )}

                      {/* EDITAR: só se pending */}
                      {s.status === "pending" && (
                        <Button
                          variant="ghost"
                          style={{ fontSize: "0.7rem", padding: "4px 8px" }}
                          onClick={() => handleOpenEdit(s)}
                        >
                          Editar
                        </Button>
                      )}

                      {/* CANCELAR: pending ou confirmed */}
                      {(s.status === "pending" || s.status === "confirmed") && (
                        <Button
                          variant="ghost"
                          style={{
                            fontSize: "0.7rem",
                            padding: "4px 8px",
                            color: "#DC2626",
                          }}
                          onClick={() => handleOpenCancel(s)}
                        >
                          Cancelar
                        </Button>
                      )}

                      {/* VER: sempre disponível */}
                      <Button
                        variant="secondary"
                        style={{ fontSize: "0.7rem", padding: "4px 8px" }}
                        onClick={() => handleOpenDetail(s._id)}
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

      {/* ════════════════════════════════════════════
             MODAL: VER DETALHES
             ════════════════════════════════════════════ */}
      {modalType === "detail" && selected && (
        <Overlay onClick={closeModal}>
          <ModalBox onClick={e => e.stopPropagation()} $width="560px">
            <ModalTitle>Detalhes do Agendamento</ModalTitle>

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
              <DetailLabel>Empresa</DetailLabel>
              <DetailValue>{selected.companyId?.name ?? "—"}</DetailValue>
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
                  {selected.documentStatus === "pending"
                    ? "Em análise"
                    : selected.documentStatus === "approved"
                      ? "✓ Aprovado"
                      : "✗ Rejeitado"}
                </StatusBadge>
              </DetailValue>
            </DetailRow>

            {/* Se rejeitado, mostra o motivo */}
            {selected.documentStatus === "rejected" && selected.rejectionReason && (
              <RejectionBox>
                <RejectionText>Motivo da rejeição: {selected.rejectionReason}</RejectionText>
              </RejectionBox>
            )}

            {/* Lista de documentos enviados */}
            {selected.documents && selected.documents.length > 0 && (
              <>
                <DetailLabel style={{ display: "block", marginTop: "12px" }}>
                  Arquivos enviados:
                </DetailLabel>
                {selected.documents.map((doc, i) => (
                  <DetailRow key={`${doc.originalName}-${i}`}>
                    <DetailLabel>📄 {doc.originalName}</DetailLabel>
                    <DetailValue style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                      {formatDate(doc.uploadedAt)}
                    </DetailValue>
                  </DetailRow>
                ))}
              </>
            )}

            <ModalActions>
              <Button variant="secondary" onClick={closeModal}>
                Fechar
              </Button>
            </ModalActions>
          </ModalBox>
        </Overlay>
      )}

      {/* ════════════════════════════════════════════
             MODAL: EDITAR AGENDAMENTO
             ════════════════════════════════════════════ */}
      {modalType === "edit" && selected && (
        <Overlay onClick={closeModal}>
          <ModalBox onClick={e => e.stopPropagation()} $width="600px">
            <ModalTitle>Editar Agendamento</ModalTitle>

            <form onSubmit={handleSubmitEdit}>
              <FormStack>
                <FormRow>
                  <Input
                    id="driverName"
                    name="driverName"
                    label="Nome do Motorista"
                    value={editForm.driverName}
                    onChange={handleEditChange}
                    required
                  />
                  <Input
                    id="driverCpf"
                    name="driverCpf"
                    label="CPF do Motorista"
                    value={editForm.driverCpf}
                    onChange={handleEditChange}
                    required
                  />
                </FormRow>

                <FormRow>
                  <Input
                    id="driverPhone"
                    name="driverPhone"
                    label="Telefone"
                    value={editForm.driverPhone}
                    onChange={handleEditChange}
                  />
                  <Input
                    id="vehiclePlate"
                    name="vehiclePlate"
                    label="Placa do Veículo"
                    value={editForm.vehiclePlate}
                    onChange={handleEditChange}
                    required
                  />
                </FormRow>

                <FormRow>
                  <FormGroup>
                    <Label htmlFor="vehicleType">Tipo de Veículo</Label>
                    <Select
                      id="vehicleType"
                      name="vehicleType"
                      value={editForm.vehicleType}
                      onChange={handleEditChange}
                      required
                    >
                      <option value="">Selecione</option>
                      <option value="Bitrem">Bitrem</option>
                      <option value="Carreta">Carreta</option>
                      <option value="Truck">Truck</option>
                      <option value="Toco">Toco</option>
                      <option value="VLC">VLC</option>
                    </Select>
                  </FormGroup>
                  <Input
                    id="cargoDescription"
                    name="cargoDescription"
                    label="Descrição da Carga"
                    value={editForm.cargoDescription}
                    onChange={handleEditChange}
                  />
                </FormRow>
              </FormStack>

              <ModalActions>
                <Button variant="secondary" type="button" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </ModalActions>
            </form>
          </ModalBox>
        </Overlay>
      )}

      {/* ════════════════════════════════════════════
             MODAL: CONFIRMAR CANCELAMENTO
             ════════════════════════════════════════════ */}
      {modalType === "cancel" && selected && (
        <Overlay onClick={closeModal}>
          <ModalBox onClick={e => e.stopPropagation()} $width="440px">
            <ModalTitle>Cancelar Agendamento</ModalTitle>

            <WarningText>
              Tem certeza que deseja cancelar o agendamento do motorista{" "}
              <strong>{selected.driverName}</strong> (placa <strong>{selected.vehiclePlate}</strong>
              )?
            </WarningText>
            <WarningText style={{ marginTop: "8px", color: "#DC2626" }}>
              ⚠️ Esta ação não pode ser desfeita. A vaga na janela de horário será liberada.
            </WarningText>

            <ModalActions>
              <Button variant="secondary" onClick={closeModal}>
                Voltar
              </Button>
              <Button
                onClick={handleConfirmCancel}
                disabled={isLoading}
                style={{ background: "#DC2626" }}
              >
                {isLoading ? "Cancelando..." : "Confirmar Cancelamento"}
              </Button>
            </ModalActions>
          </ModalBox>
        </Overlay>
      )}

      {/* ════════════════════════════════════════════
             MODAL: REENVIAR DOCUMENTOS
             ════════════════════════════════════════════ */}
      {modalType === "resend" && selected && (
        <Overlay onClick={closeModal}>
          <ModalBox onClick={e => e.stopPropagation()} $width="480px">
            <ModalTitle>Reenviar Documentos</ModalTitle>

            {/* Mostra motivo da rejeição */}
            {selected.rejectionReason && (
              <RejectionBox>
                <RejectionText>Motivo da rejeição: {selected.rejectionReason}</RejectionText>
              </RejectionBox>
            )}

            <WarningText>
              Selecione os novos documentos para o agendamento de{" "}
              <strong>{selected.driverName}</strong>. Os documentos serão adicionados aos já
              existentes e o status voltará para "Em análise".
            </WarningText>

            <form onSubmit={handleSubmitResend}>
              <FormGroup style={{ marginTop: "16px" }}>
                <Label htmlFor="resendDocs">Documentos (PDF/Imagens)</Label>
                <FileInput
                  ref={fileInputRef}
                  id="resendDocs"
                  type="file"
                  multiple
                  accept=".pdf,image/*"
                  onChange={handleResendFileChange}
                />
                {resendFiles.length > 0 && (
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "#16a34a",
                      marginTop: "4px",
                    }}
                  >
                    {resendFiles.length} arquivo(s) selecionado(s)
                  </span>
                )}
              </FormGroup>

              <ModalActions>
                <Button variant="secondary" type="button" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading || resendFiles.length === 0}>
                  {isLoading ? "Enviando..." : "Enviar Documentos"}
                </Button>
              </ModalActions>
            </form>
          </ModalBox>
        </Overlay>
      )}
    </Page>
  );
}
