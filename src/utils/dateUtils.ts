/**
 * Utilitários de formatação de datas vindas do backend.
 *
 * O backend persiste datas do tipo "dia do agendamento" como UTC midnight
 * (ex: 2025-12-25T00:00:00.000Z). Se usarmos `new Date(iso)` direto, o
 * JavaScript converte para o fuso local (UTC-3 no Brasil), exibindo 24/12.
 *
 * Solução: para campos que representam apenas uma data (sem horário),
 * extraímos a parte YYYY-MM-DD e parseamos sem o sufixo Z (timezone-naive),
 * forçando o parse como meia-noite no horário local.
 *
 * Para timestamps reais (createdAt, checkinTime, uploadedAt), a conversão
 * para horário local *é* o comportamento correto — usando toLocaleString normal.
 */

/**
 * Formata uma data no formato YYYY-MM-DD ou ISO UTC midnight para DD/MM/YYYY.
 * Ignora o timezone do string — trata sempre como data local pura.
 *
 * Use para: `timeWindowId.date`, `blockedDate.date`, etc.
 */
export function formatDateOnly(iso: string): string {
   // Extrai apenas a parte YYYY-MM-DD (antes do "T" ou espaço, se houver)
   const datePart = iso.split("T")[0];
   const [year, month, day] = datePart.split("-");
   return `${day}/${month}/${year}`;
}

/**
 * Formata um timestamp ISO (UTC) para DD/MM/YYYY no fuso local.
 * A conversão para horário local é intencional para timestamps de criação.
 *
 * Use para: `createdAt`, `uploadedAt`.
 */
export function formatDate(iso: string): string {
   return new Date(iso).toLocaleDateString("pt-BR");
}

/**
 * Formata um timestamp ISO (UTC) para DD/MM/YYYY HH:mm no fuso local.
 * A conversão para horário local é intencional para timestamps de eventos.
 *
 * Use para: `checkinTime`.
 */
export function formatDateTime(iso: string): string {
   return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
   });
}
