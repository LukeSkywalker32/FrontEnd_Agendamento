import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useApi } from "../../hooks/useApi";
import { Button, Input } from "../../components/ui";

const Page = styled.main`
   flex: 1;
   overflow-y: auto;
   padding: ${({ theme }) => theme.spacing.xl};
   background: ${({ theme }) => theme.colors.background};
`;

const PageHeader = styled.div`
   margin-bottom: ${({ theme }) => theme.spacing.xl};
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

// Card branco com largura máxima para não esticar em telas largas
const FormCard = styled.div`
   background: ${({ theme }) => theme.colors.surface};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.lg};
   padding: ${({ theme }) => theme.spacing.xl};
   max-width: 560px;
`;

// Grid de dois inputs lado a lado
const Row = styled.div`
   display: grid;
   grid-template-columns: 1fr 1fr;
   gap: ${({ theme }) => theme.spacing.md};
`;

// Empilha inputs verticalmente com espaço entre eles
const Stack = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.md};
`;

// Select estilizado com o theme
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

// Label genérico para o select (reutiliza estilo do Input)
const Label = styled.label`
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: ${({ theme }) => theme.colors.text.secondary};
   font-weight: ${({ theme }) => theme.typography.weights.medium};
   display: block;
   margin-bottom: 4px;
`;

// Banner de feedback após tentativa
const Banner = styled.div<{ $type: "success" | "error" }>`
   border-radius: ${({ theme }) => theme.borderRadius.md};
   padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   margin-bottom: ${({ theme }) => theme.spacing.md};

   background: ${({ $type, theme }) =>
      $type === "success" ? theme.colors.status.successBg : theme.colors.status.errorBg};
   color: ${({ $type, theme }) =>
      $type === "success" ? theme.colors.status.success : theme.colors.status.error};
   border: 1px solid ${({ $type, theme }) =>
      $type === "success" ? theme.colors.status.success : theme.colors.status.error};
`;

// Linha divisória
const Divider = styled.hr`
   border: none;
   border-top: 1px solid ${({ theme }) => theme.colors.border};
   margin: ${({ theme }) => `${theme.spacing.lg} 0`};
`;

// Linha de botões: alinha à direita
const Actions = styled.div`
   display: flex;
   justify-content: flex-end;
   gap: ${({ theme }) => theme.spacing.sm};
`;

interface FormData {
   name:     string;
   email:    string;
   password: string;
   role:     "admin" | "company" | "carrier";
   document: string;
   phone:    string;
}

export function RegisterUser() {
   const { post, isLoading } = useApi();
   const navigate = useNavigate();

   const [form, setForm] = useState<FormData>({
      name:     "",
      email:    "",
      password: "",
      role:     "company",   // padrão: empresa de insumos
      document: "",
      phone:    "",
   });

   // Banner de feedback: null enquanto não houve tentativa
   const [feedback, setFeedback] = useState<{
      type: "success" | "error";
      message: string;
   } | null>(null);

   // Atualiza um campo do form pelo nome do input
   // Evita ter um handler separado por campo
   function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
      const { name, value } = e.target;
      setForm(prev => ({ ...prev, [name]: value }));
   }

   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setFeedback(null);

      try {
         // POST /api/auth/register — exige token de admin no header
         // O header já está configurado via api.defaults pelo login
         await post("/auth/register", form);

         setFeedback({ type: "success", message: "Usuário cadastrado com sucesso!" });

         // Limpa o form após sucesso
         setForm({ name: "", email: "", password: "", role: "company", document: "", phone: "" });
      } catch (err: unknown) {
         // Tenta extrair a mensagem de erro da API
         const message =
            (err as { response?: { data?: { message?: string } } })
               ?.response?.data?.message ?? "Erro ao cadastrar usuário.";
         setFeedback({ type: "error", message });
      }
   }

   return (
      <Page>
         <PageHeader>
            <Title>Cadastrar Usuário</Title>
            <Subtitle>Crie acesso para empresas, transportadoras ou administradores</Subtitle>
         </PageHeader>

         <FormCard>
            {feedback && (
               <Banner $type={feedback.type}>{feedback.message}</Banner>
            )}

            <form onSubmit={handleSubmit}>
               <Stack>
                  {/* Linha 1: Nome + E-mail */}
                  <Row>
                     <Input
                        id="name"
                        name="name"
                        label="Nome completo"
                        placeholder="Empresa XYZ"
                        value={form.name}
                        onChange={handleChange}
                        required
                     />
                     <Input
                        id="email"
                        name="email"
                        label="E-mail"
                        type="email"
                        placeholder="contato@empresa.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                     />
                  </Row>

                  {/* Linha 2: Senha + Perfil */}
                  <Row>
                     <Input
                        id="password"
                        name="password"
                        label="Senha inicial"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={form.password}
                        onChange={handleChange}
                        required
                     />
                     <div>
                        <Label htmlFor="role">Perfil de acesso</Label>
                        <Select
                           id="role"
                           name="role"
                           value={form.role}
                           onChange={handleChange}
                        >
                           {/* admin: acesso total */}
                           <option value="admin">Administrador</option>
                           {/* company: empresa que recebe os caminhões */}
                           <option value="company">Empresa (insumos)</option>
                           {/* carrier: transportadora que agenda */}
                           <option value="carrier">Transportadora</option>
                        </Select>
                     </div>
                  </Row>

                  {/* Linha 3: CNPJ + Telefone */}
                  <Row>
                     <Input
                        id="document"
                        name="document"
                        label="CNPJ"
                        placeholder="00.000.000/0000-00"
                        value={form.document}
                        onChange={handleChange}
                        required
                     />
                     <Input
                        id="phone"
                        name="phone"
                        label="Telefone (opcional)"
                        placeholder="(18) 99999-9999"
                        value={form.phone}
                        onChange={handleChange}
                     />
                  </Row>
               </Stack>

               <Divider />

               <Actions>
                  {/* Volta para a lista sem submeter */}
                  <Button
                     variant="secondary"
                     type="button"
                     onClick={() => navigate("/admin/users")}
                  >
                     Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                     {isLoading ? "Salvando..." : "Cadastrar"}
                  </Button>
               </Actions>
            </form>
         </FormCard>
      </Page>
   );
}