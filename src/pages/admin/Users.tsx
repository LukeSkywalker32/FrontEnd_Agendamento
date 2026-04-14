import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

// Mensagem centralizada para lista vazia ou erro
const EmptyState = styled.div`
   padding: ${({ theme }) => theme.spacing["2xl"]};
   text-align: center;
   color: ${({ theme }) => theme.colors.text.muted};
   font-size: ${({ theme }) => theme.typography.sizes.sm};
`;

export function Users() {
   const { get, remove, isLoading } = useApi();
   const [users, setUsers] = useState<User[]>([]);
   const [error, setError] = useState<string | null>(null);
   const navigate = useNavigate();

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

   // Desativa usuário via DELETE /api/admin/users/:id
   async function handleDeactivate(id: string, name: string) {
      if (!confirm(`Desativar o usuário "${name}"?`)) return;

      try {
         await remove(`/admin/users/${id}`);
         // Atualiza localmente: marca isActive = false sem refetch
         setUsers(prev => prev.map(u => (u._id === id ? { ...u, isActive: false } : u)));
      } catch {
         alert("Erro ao desativar usuário.");
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
                              {/* Só mostra botão se o usuário ainda está ativo */}
                              {user.isActive && (
                                 <Button
                                    variant="ghost"
                                    onClick={() => handleDeactivate(user._id, user.name)}
                                    style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                                 >
                                    Desativar
                                 </Button>
                              )}
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
