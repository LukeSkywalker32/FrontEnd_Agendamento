import { useState } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import { Button, Input } from "../../components/ui";
import { useApi } from "../../hooks/useApi";
import { formatDateOnly } from "../../utils/dateUtils";

/* ─── Interfaces espelho do backend ─── */

interface SchedulingFromApi {
  _id: string;
  driverName: string;
  driverCpf: string;
  vehiclePlate: string;
  vehicleType: string;
  status: string;
  documentStatus: string;
  companyId: { name: string } | null;
  timeWindowId: { date: string; startTime: string; endTime: string } | null;
}

interface CheckinResult {
  message: string;
  scheduling: SchedulingFromApi;
}

/* ─── Styled Components ─── */

const Page = styled.main`
   flex: 1;
   overflow-y: auto;
   padding: ${({ theme }) => theme.spacing.xl};
   background: ${({ theme }) => theme.colors.background};
   display: flex;
   flex-direction: column;
   align-items: center;
`;

const PageHeader = styled.div`
   text-align: center;
   margin-bottom: ${({ theme }) => theme.spacing.xl};
   max-width: 480px;
   width: 100%;
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

const SearchCard = styled.div`
   background: ${({ theme }) => theme.colors.surface};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.lg};
   padding: ${({ theme }) => theme.spacing.xl};
   max-width: 480px;
   width: 100%;
   margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SearchRow = styled.div`
   display: flex;
   gap: ${({ theme }) => theme.spacing.sm};
   align-items: flex-end;
`;

/* ─── Cards de agendamento encontrados ─── */

const ResultsArea = styled.div`
   max-width: 480px;
   width: 100%;
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.md};
`;

const SchedulingCard = styled.div`
   background: ${({ theme }) => theme.colors.surface};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.lg};
   padding: ${({ theme }) => theme.spacing.lg};
`;

const CardRow = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const CardLabel = styled.span`
   font-size: ${({ theme }) => theme.typography.sizes.xs};
   color: ${({ theme }) => theme.colors.text.muted};
   text-transform: uppercase;
   letter-spacing: 0.5px;
`;

const CardValue = styled.span`
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: ${({ theme }) => theme.colors.text.primary};
   font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  checked_in: "Check-in realizado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: "#FEF3C7", color: "#92400E" },
  confirmed: { bg: "#DCFCE7", color: "#14532D" },
  checked_in: { bg: "#DBEAFE", color: "#1E3A5F" },
  completed: { bg: "#F1F5F9", color: "#475569" },
  cancelled: { bg: "#FEE2E2", color: "#7F1D1D" },
};

const StatusBadge = styled.span<{ $status: string }>`
   font-size: 11px;
   font-weight: 600;
   padding: 3px 10px;
   border-radius: 9999px;
   background: ${({ $status }) => STATUS_COLORS[$status]?.bg ?? "#F1F5F9"};
   color: ${({ $status }) => STATUS_COLORS[$status]?.color ?? "#475569"};
`;

const Divider = styled.hr`
   border: none;
   border-top: 1px solid ${({ theme }) => theme.colors.border};
   margin: ${({ theme }) => `${theme.spacing.md} 0`};
`;

/* ─── Mensagem de sucesso do check-in ─── */

const SuccessBox = styled.div`
   background: ${({ theme }) => theme.colors.status.successBg};
   border: 1px solid ${({ theme }) => theme.colors.status.success};
   border-radius: ${({ theme }) => theme.borderRadius.lg};
   padding: ${({ theme }) => theme.spacing.lg};
   text-align: center;
   max-width: 480px;
   width: 100%;
`;

const SuccessText = styled.p`
   font-size: ${({ theme }) => theme.typography.sizes.md};
   font-weight: ${({ theme }) => theme.typography.weights.semibold};
   color: ${({ theme }) => theme.colors.status.success};
`;

const EmptyState = styled.p`
   text-align: center;
   color: ${({ theme }) => theme.colors.text.muted};
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   padding: ${({ theme }) => theme.spacing.lg};
`;

export function Checkin() {
  const { get, post, isLoading } = useApi();

  const [cpf, setCpf] = useState("");
  const [searched, setSearched] = useState(false);
  const [schedulings, setSchedulings] = useState<SchedulingFromApi[]>([]);
  const [checkinDone, setCheckinDone] = useState<CheckinResult | null>(null);

  // - 1 Buscar agendamento pelo CPF

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    // limpa antes de buscar
    setCheckinDone(null);
    setSchedulings([]);

    //Remove pontos e traços
    const cleanCpf = cpf.replace(/\D/g, "");

    if (cleanCpf.length !== 11) {
      toast.error("CPF deve conter 11 dígitos");
      return;
    }

    try {
      const result = await get<{ status: string; data: SchedulingFromApi[] }>(
        `/driver/schedulings${cleanCpf}`,
      );
      setSchedulings(result.data);
      setSearched(true);

      if (result.data.length === 0) {
        toast.info("Nenhum agendamento encontrado para este CPF");
      }
    } catch (error) {
      toast.error("Erro ao buscar agendamento. Verifique o CPF");
      setSearched(true);
    }
  }

  // - 2 Realizar checkin

  async function handleCheckin() {
    const cleanCpf = cpf.replace(/\D/g, "");

    try {
      const result = await post<{ status: string; data: CheckinResult }>("/driver/checkin", {
        cpf: cleanCpf,
      });
      setCheckinDone(result.data);
      toast.success("Check-in realizado com sucesso!");
    } catch (err: any) {
      const message = err.response?.data?.message ?? "Erro ao realizar check-in";
      toast.error(message);
    }
  }

  // formatDateOnly importado de utils/dateUtils — trata datas UTC midnight sem shift de fuso

  //Verifica se existe ao menos 1 agendamento confirmado para o CPF pesquisado
  const hasConfirmed = schedulings.some(s => s.status === "confirmed");

  return (
    <Page>
      <PageHeader>
        <Title>Check-in do Motorista</Title>
        <Subtitle>Digite seu CPF para consultar seus agendamentos e realizar o check-in</Subtitle>
      </PageHeader>

      {/* ── Formulário de busca ── */}
      <SearchCard>
        <form onSubmit={handleSearch}>
          <SearchRow>
            <div style={{ flex: 1 }}>
              <Input
                id="cpf"
                name="cpf"
                label="CPF do Motorista"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={e => setCpf(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading} style={{ marginBottom: "2px" }}>
              {isLoading ? "Buscando..." : "Buscar"}
            </Button>
          </SearchRow>
        </form>
      </SearchCard>

      {/* ── Se já fez check-in, mostra mensagem de sucesso ── */}
      {checkinDone && (
        <SuccessBox>
          <SuccessText>{checkinDone.message}</SuccessText>
        </SuccessBox>
      )}

      {/* ── Lista de agendamentos encontrados ── */}
      {!checkinDone && searched && (
        <ResultsArea>
          {schedulings.length === 0 ? (
            <EmptyState>Nenhum agendamento pendente ou confirmado encontrado.</EmptyState>
          ) : (
            <>
              {schedulings.map(s => (
                <SchedulingCard key={s._id}>
                  <CardRow>
                    <CardLabel>Motorista</CardLabel>
                    <CardValue>{s.driverName}</CardValue>
                  </CardRow>
                  <CardRow>
                    <CardLabel>Empresa</CardLabel>
                    <CardValue>{s.companyId?.name ?? "—"}</CardValue>
                  </CardRow>
                  <CardRow>
                    <CardLabel>Placa</CardLabel>
                    <CardValue>
                      <code>{s.vehiclePlate}</code>
                    </CardValue>
                  </CardRow>
                  <CardRow>
                    <CardLabel>Veículo</CardLabel>
                    <CardValue>{s.vehicleType}</CardValue>
                  </CardRow>
                  <CardRow>
                    <CardLabel>Horário</CardLabel>
                    <CardValue>
                      {s.timeWindowId
                        ? `${formatDateOnly(s.timeWindowId.date)} ${s.timeWindowId.startTime}–${s.timeWindowId.endTime}`
                        : "—"}
                    </CardValue>
                  </CardRow>
                  <CardRow>
                    <CardLabel>Status</CardLabel>
                    <StatusBadge $status={s.status}>
                      {STATUS_LABELS[s.status] ?? s.status}
                    </StatusBadge>
                  </CardRow>
                </SchedulingCard>
              ))}

              <Divider />

              {/* Botão de check-in: só aparece se tem agendamento confirmado */}
              {hasConfirmed ? (
                <Button onClick={handleCheckin} disabled={isLoading} style={{ width: "100%" }}>
                  {isLoading ? "Realizando check-in..." : "✅ Realizar Check-in"}
                </Button>
              ) : (
                <EmptyState>
                  Nenhum agendamento com status "Confirmado" para realizar check-in. Aguarde a
                  aprovação dos documentos.
                </EmptyState>
              )}
            </>
          )}
        </ResultsArea>
      )}
    </Page>
  );
}
