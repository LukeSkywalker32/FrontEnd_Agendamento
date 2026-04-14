import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { Button } from "../../components/ui";
import { useApi } from "../../hooks/useApi";

// Tipagem de um usuário conforme o backend retorna
interface User {
   _id: string;
   name: string;
   email: string;
   role: "admin" | "company" | "carrier";
   document: string;
   phone: string;
   isActive: boolean;
   createdAt: string;
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

// Card branco que envolve a tabela
const TableCard = styled.div`
   background: ${({ theme }) => theme.colors.surface};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.lg};
   overflow: hidden;
`;

// Tabela sem estilos do browser, largura 100%
const Table = styled.table`
   width: 100%;
   border-collapse: collapse;
`;

// Cabeçalho da tabela
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

   // Remove borda da última linha
   tr:last-child & {
      border-bottom: none;
   }
`;

// Badge colorido por role
const RoleBadge = styled.span<{ $role: string }>`
   font-size: ${({ theme }) => theme.typography.sizes.xs};
   font-weight: ${({ theme }) => theme.typography.weights.semibold};
   padding: 3px 10px;
   border-radius: ${({ theme }) => theme.borderRadius.full};
   text-transform: uppercase;
   letter-spacing: 0.5px;

   // Cor diferente por role
   background: ${({ $role, theme }) =>
      $role === "admin"
         ? theme.colors.status.errorBg
         : $role === "company"
           ? theme.colors.status.infoBg
           : theme.colors.status.successBg};

   color: ${({ $role, theme }) =>
      $role === "admin"
         ? theme.colors.status.error
         : $role === "company"
           ? theme.colors.status.info
           : theme.colors.status.success};
`;

// Indicador visual de status ativo/inativo
const StatusDot = styled.span<{ $active: boolean }>`
   display: inline-flex;
   align-items: center;
   gap: 6px;
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: ${({ $active, theme }) =>
      $active ? theme.colors.status.success : theme.colors.text.muted};

   &::before {
      content: "";
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
   }
`;

// Container para botão de ação
const ActionGroup = styled.div`
display: flex;
align-items: center;
gap: ${({ theme }) => theme.spacing.xs};`;

// Botão ícone de lixeira: vermelho sutil
const DeleteIconButton = styled.button`
   display: inline-flex;
   align-items: center;
   justify-content: center;
   width: 30px;
   height: 30px;
   border-radius: ${({ theme }) => theme.borderRadius.md};
   border: 1px solid ${({ theme }) => theme.colors.status.error};
   background: transparent;
   color: ${({ theme }) => theme.colors.status.error};
   cursor: pointer;
   transition: all 0.15s ease;
   flex-shrink: 0;

   &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.status.errorBg};
   }

   &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
   }

   svg {
      width: 14px;
      height: 14px;
   }
`;

// Mensagem centralizada para lista vazia ou erro
const EmptyState = styled.div`
   padding: ${({ theme }) => theme.spacing["2xl"]};
   text-align: center;
   color: ${({ theme }) => theme.colors.text.muted};
   font-size: ${({ theme }) => theme.typography.sizes.sm};
`;

//MODAL DE CONFIRMAÇÃO DE EXCLUSÃO

const ModalOverlay = styled.div`
position: fixed;
inset: 0;
background: rgba(0,0,0,0.45);
display: flex;
align-items: center;
justify-content: center;
z-index: 1000;
`;
const ModalCard = styled.div`
   background: ${({ theme }) => theme.colors.surface};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.lg};
   padding: ${({ theme }) => theme.spacing.xl};
   max-width: 420px;
   width: 90%;
   box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const ModalTitle = styled.h3`
   font-size: ${({ theme }) => theme.typography.sizes.lg};
   font-weight: ${({ theme }) => theme.typography.weights.semibold};
   color: ${({ theme }) => theme.colors.text.primary};
   margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ModalDesc = styled.p`
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: ${({ theme }) => theme.colors.text.secondary};
   line-height: 1.6;
   margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ModalActions = styled.div`
   display: flex;
   justify-content: flex-end;
   gap: ${({ theme }) => theme.spacing.sm};
`;

// Botão vermelho de confirmação de exclusão
const DangerButton = styled.button`
display: inline-flex;
align-items: center;
justify-content: center;
padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
border-radius: ${({ theme }) => theme.borderRadius.md};
border: none;
background: ${({ theme }) => theme.colors.status.error};
color: #fff;
font-size: ${({ theme }) => theme.typography.sizes.sm};
font-weight: ${({ theme }) => theme.typography.weights.semibold};
cursor: pointer;
transition: opacity 0.15s ease;

&: hover {
   opacity: 0.88;
}

&: disabled {
opcaity: 0.6;
cursor: not-allowed;
}
`;
//---Icone de Lixeira---
function TrashIcon() {
   return (
      // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
         <polyline points="3 6 5 6 21 6" />
         <path d="M19 6l-1 14H6L5 6" />
         <path d="M10 11v6M14 11v6" />
         <path d="M9 6V4h6v2" />
      </svg>
   );
}

export function Users() {
   const { get, put, remove, isLoading } = useApi();
   const [users, setUsers] = useState<User[]>([]);
   const [error, setError] = useState<string | null>(null);
   const navigate = useNavigate();

   const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
   const [deleting, setDeleting] = useState(false);
   const [processingUserId, setProcessingUserId] = useState<string | null>(null);

   // Busca usuários via GET /api/admin/users
   const fetchUsers = useCallback(async () => {
      try {
         const result = await get<{ status: string; data: User[] }>("/admin/users");
         setUsers(result.data);
      } catch {
         setError("Não foi possível carregar os usuários.");
      }
   }, [get]);

   // Carrega lista de usuários ao montar
   useEffect(() => {
      fetchUsers();
   }, [fetchUsers]);

   // Desativa usuário via (PATCH /api/admin/users/:id/deactivate)
   async function handleDeactivate(id: string, name: string) {
      setProcessingUserId(id);
      try {
         await put(`/admin/users/${id}/deactivate`, {});
         setUsers(prev => prev.map(u => (u._id === id ? { ...u, isActive: false } : u)));
         toast.warning(`Usuário "${name}" desativado.`);
      } catch {
         toast.error("Erro ao desativar usuário. Verifique o backend.");
      } finally {
         setProcessingUserId(null);
      }
   }
   // Ativa usuário via (PATCH /api/admin/users/:id/activate)
   async function handleActivate(id: string, name: string) {
      setProcessingUserId(id);
      try {
         await put(`/admin/users/${id}/activate`, {});
         setUsers(prev => prev.map(u => (u._id === id ? { ...u, isActive: true } : u)));
         toast.success(`Usuário "${name}" ativado com sucesso.`);
      } catch {
         toast.error("Erro ao ativar usuário. Verifique o backend:");
      } finally {
         setProcessingUserId(null);
      }
   }

   // ── Confirmar e excluir permanentemente ───────────────────────────────────
   async function handleConfirmDelete() {
      if (!deleteTarget) return;
      setDeleting(true);
      try {
         await remove(`/admin/users/${deleteTarget.id}`);
         setUsers(prev => prev.filter(u => u._id !== deleteTarget.id));
         toast.error(`Usuário "${deleteTarget.name}" excluído permanentemente.`);
         setDeleteTarget(null);
      } catch {
         toast.error("Erro ao excluir usuário. Tente novamente.");
      } finally {
         setDeleting(false);
      }
   }

   // Formata CNPJ: 00000000000000 → 00.000.000/0000-00
   function formatDoc(doc: string) {
      const d = doc.replace(/\D/g, "");
      return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
   }

   return (
      <Page>
         <PageHeader>
            <Title>Usuários</Title>
            {/* Botão que leva para o cadastro de novo usuário */}
            <Button variant="primary" onClick={() => navigate("/admin/register")}>
               + Cadastrar usuário
            </Button>
         </PageHeader>

         <TableCard>
            {isLoading ? (
               <EmptyState>Carregando...</EmptyState>
            ) : error ? (
               <EmptyState>{error}</EmptyState>
            ) : users.length === 0 ? (
               <EmptyState>Nenhum usuário encontrado.</EmptyState>
            ) : (
               <Table>
                  <thead>
                     <tr>
                        <Th>Nome</Th>
                        <Th>E-mail</Th>
                        <Th>Perfil</Th>
                        <Th>CNPJ</Th>
                        <Th>Status</Th>
                        <Th>Ações</Th>
                     </tr>
                  </thead>
                  <tbody>
                     {users.map(user => (
                        <tr key={user._id}>
                           <Td>
                              <strong>{user.name}</strong>
                           </Td>
                           <Td style={{ color: "inherit" }}>{user.email}</Td>
                           <Td>
                              <RoleBadge $role={user.role}>{user.role}</RoleBadge>
                           </Td>
                           <Td>{formatDoc(user.document)}</Td>
                           <Td>
                              <StatusDot $active={user.isActive}>
                                 {user.isActive ? "Ativo" : "Inativo"}
                              </StatusDot>
                           </Td>
                           <Td>
                              <ActionGroup>
                                 {user.isActive ? (
                                    /* Usuário ativo → botão Desativar */
                                    <Button
                                       variant="ghost"
                                       onClick={() => handleDeactivate(user._id, user.name)}
                                       disabled={processingUserId === user._id}
                                       style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                                    >
                                       {processingUserId === user._id
                                          ? "Desativando..."
                                          : "Desativar"}
                                    </Button>
                                 ) : (
                                    /* Usuário inativo → botão Ativar + lixeira */
                                    <>
                                       <Button
                                          variant="secondary"
                                          onClick={() => handleActivate(user._id, user.name)}
                                          disabled={processingUserId === user._id}
                                          style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                                       >
                                          {processingUserId === user._id ? "Ativando..." : "Ativar"}
                                       </Button>

                                       <DeleteIconButton
                                          title={`Excluir "${user.name}" permanentemente`}
                                          onClick={() =>
                                             setDeleteTarget({ id: user._id, name: user.name })
                                          }
                                          disabled={processingUserId === user._id}
                                       >
                                          <TrashIcon />
                                       </DeleteIconButton>
                                    </>
                                 )}
                              </ActionGroup>
                           </Td>
                        </tr>
                     ))}
                  </tbody>
               </Table>
            )}
         </TableCard>
         {/* ── Modal de confirmação de exclusão ── */}
         {deleteTarget && (
            <ModalOverlay onClick={() => !deleting && setDeleteTarget(null)}>
               <ModalCard onClick={e => e.stopPropagation()}>
                  <ModalTitle>Excluir usuário permanentemente?</ModalTitle>
                  <ModalDesc>
                     Você está prestes a excluir <strong>"{deleteTarget.name}"</strong>. Esta ação
                     não pode ser desfeita e todos os dados do usuário serão removidos do sistema.
                  </ModalDesc>
                  <ModalActions>
                     <Button
                        variant="secondary"
                        onClick={() => setDeleteTarget(null)}
                        disabled={deleting}
                     >
                        Cancelar
                     </Button>
                     <DangerButton onClick={handleConfirmDelete} disabled={deleting}>
                        {deleting ? "Excluindo..." : "Sim, excluir"}
                     </DangerButton>
                  </ModalActions>
               </ModalCard>
            </ModalOverlay>
         )}
      </Page>
   );
}
