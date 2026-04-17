import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import { Button, Input } from "../../components/ui";
import { useApi } from "../../hooks/useApi";
import { formatDateOnly } from "../../utils/dateUtils";

/* ─── Interfaces ─── */

interface TimeWindow {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  maxVehicles: number;
  currentCount: number;
  isActive: boolean;
}

interface BlockedDate {
  _id: string;
  date: string;
  reason: string;
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
   border-bottom: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary : "transparent")};
   margin-bottom: -2px;
   cursor: pointer;
   transition: all 0.15s ease;

   &:hover {
      color: ${({ theme }) => theme.colors.primary};
   }
`;

/* ── Cards / Tabela ── */

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
`;

const OccupancyBar = styled.div`
   display: flex;
   align-items: center;
   gap: 8px;
`;

const BarTrack = styled.div`
   flex: 1;
   height: 8px;
   background: ${({ theme }) => theme.colors.border};
   border-radius: 4px;
   min-width: 60px;
`;

const BarFill = styled.div<{ $pct: number }>`
   height: 100%;
   border-radius: 4px;
   width: ${({ $pct }) => Math.min($pct, 100)}%;
   background: ${({ $pct }) => ($pct >= 90 ? "#EF4444" : $pct >= 60 ? "#F59E0B" : "#22C55E")};
   transition: width 0.3s ease;
`;

const BarLabel = styled.span`
   font-size: 0.75rem;
   color: ${({ theme }) => theme.colors.text.muted};
   white-space: nowrap;
`;

/* ── Filtro de data ── */

const FilterRow = styled.div`
   display: flex;
   align-items: flex-end;
   gap: ${({ theme }) => theme.spacing.sm};
   margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

/* ── Modal genérico ── */

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
   width: ${({ $width }) => $width ?? "480px"};
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

const WarningText = styled.p`
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: ${({ theme }) => theme.colors.text.secondary};
   line-height: 1.6;
`;

/* ─── Tipos de modal ─── */

type ModalType = "createTW" | "editTW" | "deleteTW" | "createBD" | "deleteBD" | null;

/* ─── Componente ─── */

export function GerenciarSlots() {
  const { get, post, put, remove, isLoading } = useApi();

  const [activeTab, setActiveTab] = useState<"timeWindows" | "blockedDates">("timeWindows");

  /* ── Time Windows state ── */
  const [timeWindows, setTimeWindows] = useState<TimeWindow[]>([]);
  const [dateFilter, setDateFilter] = useState("");

  /* ── Blocked Dates state ── */
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);

  /* ── Modal state ── */
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedTW, setSelectedTW] = useState<TimeWindow | null>(null);
  const [selectedBD, setSelectedBD] = useState<BlockedDate | null>(null);

  /* ── Forms ── */
  const [twForm, setTwForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    maxVehicles: "",
  });

  const [editTwForm, setEditTwForm] = useState({
    startTime: "",
    endTime: "",
    maxVehicles: "",
  });

  const [bdForm, setBdForm] = useState({
    date: "",
    reason: "",
  });

  /* ════════════════════════════════════════════
      FETCH DATA
      ════════════════════════════════════════════ */

  const fetchTimeWindows = useCallback(async () => {
    try {
      const url = dateFilter ? `/company/time-windows?date=${dateFilter}` : "/company/time-windows";
      const result = await get<{ status: string; data: TimeWindow[] }>(url);
      setTimeWindows(result.data);
    } catch {
      setTimeWindows([]);
    }
  }, [get, dateFilter]);

  const fetchBlockedDates = useCallback(async () => {
    try {
      const result = await get<{ status: string; data: BlockedDate[] }>("/company/blocked-dates");
      setBlockedDates(result.data);
    } catch {
      setBlockedDates([]);
    }
  }, [get]);

  useEffect(() => {
    if (activeTab === "timeWindows") fetchTimeWindows();
    else fetchBlockedDates();
  }, [activeTab, fetchTimeWindows, fetchBlockedDates]);

  /* ════════════════════════════════════════════
      HELPERS
      ════════════════════════════════════════════ */

  // formatDateOnly importado de utils/dateUtils — trata datas UTC midnight sem shift de fuso

  function closeModal() {
    setModalType(null);
    setSelectedTW(null);
    setSelectedBD(null);
  }

  /* ════════════════════════════════════════════
      TIME WINDOWS — CRUD
      ════════════════════════════════════════════ */

  /* ── CREATE ── */

  function handleOpenCreateTW() {
    setTwForm({ date: "", startTime: "", endTime: "", maxVehicles: "" });
    setModalType("createTW");
  }

  async function handleSubmitCreateTW(e: React.FormEvent) {
    e.preventDefault();
    try {
      await post("/company/time-windows", {
        date: twForm.date,
        startTime: twForm.startTime,
        endTime: twForm.endTime,
        maxVehicles: Number(twForm.maxVehicles),
      });
      toast.success("Janela de horário criada com sucesso!");
      closeModal();
      fetchTimeWindows();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Erro ao criar janela de horário.";
      toast.error(msg);
    }
  }

  /* ── EDIT ── */

  function handleOpenEditTW(tw: TimeWindow) {
    setSelectedTW(tw);
    setEditTwForm({
      startTime: tw.startTime,
      endTime: tw.endTime,
      maxVehicles: String(tw.maxVehicles),
    });
    setModalType("editTW");
  }

  async function handleSubmitEditTW(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTW) return;

    try {
      await put(`/company/time-windows/${selectedTW._id}`, {
        startTime: editTwForm.startTime,
        endTime: editTwForm.endTime,
        maxVehicles: Number(editTwForm.maxVehicles),
      });
      toast.success("Janela atualizada com sucesso!");
      closeModal();
      fetchTimeWindows();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Erro ao atualizar janela.";
      toast.error(msg);
    }
  }

  /* ── DELETE ── */

  function handleOpenDeleteTW(tw: TimeWindow) {
    setSelectedTW(tw);
    setModalType("deleteTW");
  }

  async function handleConfirmDeleteTW() {
    if (!selectedTW) return;

    try {
      await remove(`/company/time-windows/${selectedTW._id}`);
      toast.success("Janela removida com sucesso!");
      closeModal();
      fetchTimeWindows();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Erro ao remover janela.";
      toast.error(msg);
    }
  }

  /* ════════════════════════════════════════════
      BLOCKED DATES — CRUD
      ════════════════════════════════════════════ */

  /* ── CREATE ── */

  function handleOpenCreateBD() {
    setBdForm({ date: "", reason: "" });
    setModalType("createBD");
  }

  async function handleSubmitCreateBD(e: React.FormEvent) {
    e.preventDefault();
    try {
      await post("/company/blocked-dates", {
        date: bdForm.date,
        reason: bdForm.reason,
      });
      toast.success("Data bloqueada com sucesso!");
      closeModal();
      fetchBlockedDates();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Erro ao bloquear data.";
      toast.error(msg);
    }
  }

  /* ── DELETE ── */

  function handleOpenDeleteBD(bd: BlockedDate) {
    setSelectedBD(bd);
    setModalType("deleteBD");
  }

  async function handleConfirmDeleteBD() {
    if (!selectedBD) return;

    try {
      await remove(`/company/blocked-dates/${selectedBD._id}`);
      toast.success("Data desbloqueada com sucesso!");
      closeModal();
      fetchBlockedDates();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Erro ao desbloquear data.";
      toast.error(msg);
    }
  }

  /* ════════════════════════════════════════════
      RENDER
      ════════════════════════════════════════════ */

  return (
    <Page>
      <PageHeader>
        <Title>Gerenciar Slots</Title>
      </PageHeader>

      {/* ── Tabs ── */}
      <TabBar>
        <Tab $active={activeTab === "timeWindows"} onClick={() => setActiveTab("timeWindows")}>
          Janelas de Horário
        </Tab>
        <Tab $active={activeTab === "blockedDates"} onClick={() => setActiveTab("blockedDates")}>
          Datas Bloqueadas
        </Tab>
      </TabBar>

      {/* ════════════════════════════════════════════
             ABA: JANELAS DE HORÁRIO
             ════════════════════════════════════════════ */}
      {activeTab === "timeWindows" && (
        <>
          <FilterRow>
            <div style={{ flex: 1, maxWidth: "220px" }}>
              <Input
                id="dateFilter"
                label="Filtrar por data"
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
              />
            </div>
            {dateFilter && (
              <Button
                variant="ghost"
                style={{ fontSize: "0.8rem" }}
                onClick={() => setDateFilter("")}
              >
                Limpar filtro
              </Button>
            )}
            <div style={{ marginLeft: "auto" }}>
              <Button onClick={handleOpenCreateTW}>+ Nova Janela</Button>
            </div>
          </FilterRow>

          <TableCard>
            {isLoading ? (
              <EmptyState>Carregando janelas de horário...</EmptyState>
            ) : timeWindows.length === 0 ? (
              <EmptyState>Nenhuma janela de horário encontrada.</EmptyState>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Data</Th>
                    <Th>Horário</Th>
                    <Th>Ocupação</Th>
                    <Th>Ações</Th>
                  </tr>
                </thead>
                <tbody>
                  {timeWindows.map(tw => {
                    const pct = tw.maxVehicles > 0 ? (tw.currentCount / tw.maxVehicles) * 100 : 0;
                    return (
                      <tr key={tw._id}>
                        <Td>{formatDateOnly(tw.date)}</Td>
                        <Td>
                          {tw.startTime} – {tw.endTime}
                        </Td>
                        <Td>
                          <OccupancyBar>
                            <BarTrack>
                              <BarFill $pct={pct} />
                            </BarTrack>
                            <BarLabel>
                              {tw.currentCount}/{tw.maxVehicles}
                            </BarLabel>
                          </OccupancyBar>
                        </Td>
                        <Td>
                          <ActionGroup>
                            <Button
                              variant="ghost"
                              style={{
                                fontSize: "0.7rem",
                                padding: "4px 8px",
                              }}
                              onClick={() => handleOpenEditTW(tw)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              style={{
                                fontSize: "0.7rem",
                                padding: "4px 8px",
                                color: "#DC2626",
                              }}
                              onClick={() => handleOpenDeleteTW(tw)}
                            >
                              Excluir
                            </Button>
                          </ActionGroup>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </TableCard>
        </>
      )}

      {/* ════════════════════════════════════════════
             ABA: DATAS BLOQUEADAS
             ════════════════════════════════════════════ */}
      {activeTab === "blockedDates" && (
        <>
          <FilterRow>
            <div style={{ marginLeft: "auto" }}>
              <Button onClick={handleOpenCreateBD}>+ Bloquear Data</Button>
            </div>
          </FilterRow>

          <TableCard>
            {isLoading ? (
              <EmptyState>Carregando datas bloqueadas...</EmptyState>
            ) : blockedDates.length === 0 ? (
              <EmptyState>Nenhuma data bloqueada.</EmptyState>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Data</Th>
                    <Th>Motivo</Th>
                    <Th>Ações</Th>
                  </tr>
                </thead>
                <tbody>
                  {blockedDates.map(bd => (
                    <tr key={bd._id}>
                      <Td>{formatDateOnly(bd.date)}</Td>
                      <Td>{bd.reason}</Td>
                      <Td>
                        <Button
                          variant="ghost"
                          style={{
                            fontSize: "0.7rem",
                            padding: "4px 8px",
                            color: "#DC2626",
                          }}
                          onClick={() => handleOpenDeleteBD(bd)}
                        >
                          Desbloquear
                        </Button>
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
             MODAL: CRIAR JANELA DE HORÁRIO
             ════════════════════════════════════════════ */}
      {modalType === "createTW" && (
        <Overlay onClick={closeModal}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <ModalTitle>Nova Janela de Horário</ModalTitle>
            <form onSubmit={handleSubmitCreateTW}>
              <FormStack>
                <Input
                  id="twDate"
                  label="Data"
                  type="date"
                  value={twForm.date}
                  onChange={e => setTwForm(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
                <FormRow>
                  <Input
                    id="twStart"
                    label="Horário Início (HH:mm)"
                    type="time"
                    value={twForm.startTime}
                    onChange={e =>
                      setTwForm(prev => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    required
                  />
                  <Input
                    id="twEnd"
                    label="Horário Fim (HH:mm)"
                    type="time"
                    value={twForm.endTime}
                    onChange={e =>
                      setTwForm(prev => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    required
                  />
                </FormRow>
                <Input
                  id="twMax"
                  label="Máximo de Veículos"
                  type="number"
                  min="1"
                  value={twForm.maxVehicles}
                  onChange={e =>
                    setTwForm(prev => ({
                      ...prev,
                      maxVehicles: e.target.value,
                    }))
                  }
                  required
                />
              </FormStack>
              <ModalActions>
                <Button variant="secondary" type="button" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Criando..." : "Criar Janela"}
                </Button>
              </ModalActions>
            </form>
          </ModalBox>
        </Overlay>
      )}

      {/* ════════════════════════════════════════════
             MODAL: EDITAR JANELA DE HORÁRIO
             ════════════════════════════════════════════ */}
      {modalType === "editTW" && selectedTW && (
        <Overlay onClick={closeModal}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <ModalTitle>Editar Janela de Horário</ModalTitle>
            <WarningText style={{ marginBottom: "12px" }}>
              Data: <strong>{formatDateOnly(selectedTW.date)}</strong> — Agendamentos atuais:{" "}
              <strong>{selectedTW.currentCount}</strong>
            </WarningText>
            <form onSubmit={handleSubmitEditTW}>
              <FormStack>
                <FormRow>
                  <Input
                    id="editStart"
                    label="Horário Início"
                    type="time"
                    value={editTwForm.startTime}
                    onChange={e =>
                      setEditTwForm(prev => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    required
                  />
                  <Input
                    id="editEnd"
                    label="Horário Fim"
                    type="time"
                    value={editTwForm.endTime}
                    onChange={e =>
                      setEditTwForm(prev => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    required
                  />
                </FormRow>
                <Input
                  id="editMax"
                  label="Máximo de Veículos"
                  type="number"
                  min="1"
                  value={editTwForm.maxVehicles}
                  onChange={e =>
                    setEditTwForm(prev => ({
                      ...prev,
                      maxVehicles: e.target.value,
                    }))
                  }
                  required
                />
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
             MODAL: CONFIRMAR EXCLUSÃO DE JANELA
             ════════════════════════════════════════════ */}
      {modalType === "deleteTW" && selectedTW && (
        <Overlay onClick={closeModal}>
          <ModalBox onClick={e => e.stopPropagation()} $width="440px">
            <ModalTitle>Excluir Janela de Horário</ModalTitle>
            <WarningText>
              Tem certeza que deseja excluir a janela de{" "}
              <strong>
                {formatDateOnly(selectedTW.date)} ({selectedTW.startTime}–{selectedTW.endTime})
              </strong>
              ?
            </WarningText>
            {selectedTW.currentCount > 0 && (
              <WarningText style={{ marginTop: "8px", color: "#DC2626" }}>
                ⚠️ Esta janela possui {selectedTW.currentCount} agendamento(s) ativo(s). O backend
                não permitirá a exclusão.
              </WarningText>
            )}
            <ModalActions>
              <Button variant="secondary" onClick={closeModal}>
                Voltar
              </Button>
              <Button
                onClick={handleConfirmDeleteTW}
                disabled={isLoading}
                style={{ background: "#DC2626" }}
              >
                {isLoading ? "Excluindo..." : "Confirmar Exclusão"}
              </Button>
            </ModalActions>
          </ModalBox>
        </Overlay>
      )}

      {/* ════════════════════════════════════════════
             MODAL: CRIAR DATA BLOQUEADA
             ════════════════════════════════════════════ */}
      {modalType === "createBD" && (
        <Overlay onClick={closeModal}>
          <ModalBox onClick={e => e.stopPropagation()}>
            <ModalTitle>Bloquear Data</ModalTitle>
            <form onSubmit={handleSubmitCreateBD}>
              <FormStack>
                <Input
                  id="bdDate"
                  label="Data"
                  type="date"
                  value={bdForm.date}
                  onChange={e => setBdForm(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
                <Input
                  id="bdReason"
                  label="Motivo"
                  value={bdForm.reason}
                  onChange={e => setBdForm(prev => ({ ...prev, reason: e.target.value }))}
                  required
                />
              </FormStack>
              <ModalActions>
                <Button variant="secondary" type="button" onClick={closeModal}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Bloqueando..." : "Bloquear Data"}
                </Button>
              </ModalActions>
            </form>
          </ModalBox>
        </Overlay>
      )}

      {/* ════════════════════════════════════════════
             MODAL: CONFIRMAR DESBLOQUEIO DE DATA
             ════════════════════════════════════════════ */}
      {modalType === "deleteBD" && selectedBD && (
        <Overlay onClick={closeModal}>
          <ModalBox onClick={e => e.stopPropagation()} $width="440px">
            <ModalTitle>Desbloquear Data</ModalTitle>
            <WarningText>
              Deseja desbloquear o dia <strong>{formatDateOnly(selectedBD.date)}</strong>?
            </WarningText>
            <WarningText style={{ marginTop: "8px" }}>
              Motivo original: <em>{selectedBD.reason}</em>
            </WarningText>
            <WarningText style={{ marginTop: "8px", color: "#F59E0B" }}>
              ⚠️ Atenção: as janelas de horário que foram desativadas ao bloquear esta data{" "}
              <strong>não serão reativadas automaticamente</strong>. Você precisará criar novas
              janelas.
            </WarningText>
            <ModalActions>
              <Button variant="secondary" onClick={closeModal}>
                Voltar
              </Button>
              <Button onClick={handleConfirmDeleteBD} disabled={isLoading}>
                {isLoading ? "Desbloqueando..." : "Confirmar Desbloqueio"}
              </Button>
            </ModalActions>
          </ModalBox>
        </Overlay>
      )}
    </Page>
  );
}
