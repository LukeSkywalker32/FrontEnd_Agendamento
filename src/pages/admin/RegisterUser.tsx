import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { Button, Input } from "../../components/ui";
import { useApi } from "../../hooks/useApi";

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
   name: string;
   email: string;
   password: string;
   role: "admin" | "company" | "carrier";
   document: string;
   phone: string;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function validateEmail(email: string): string | null {
   if (!email) return null; // campo vazio: sem mensagem ainda

   // Detecta especificamente se tem caracteres acentuados ou especiais
   // para dar uma mensagem mais clara do que "e-mail inválido"
   const hasAccents = /[àáâãäåæçèéêëìíîïðñòóôõöùúûüýþÿÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖÙÚÛÜÝÞŸ]/.test(email);
   if (hasAccents) {
      return "E-mail não pode conter caracteres acentuados (á, ç, ã, etc.)";
   }

   // Valida o formato geral do e-mail
   if (!EMAIL_REGEX.test(email)) {
      return "E-mail inválido. Use apenas letras sem acento, números e @dominio.com";
   }

   return null; // null = sem erro
}

export function RegisterUser() {
   const { post, isLoading } = useApi();
   const navigate = useNavigate();
   const [emailError, setEmailError] = useState<string | null>(null);

   const [form, setForm] = useState<FormData>({
      name: "",
      email: "",
      password: "",
      role: "company", // padrão: empresa de insumos
      document: "",
      phone: "",
   });

   // Atualiza um campo do form pelo nome do input
   // Evita ter um handler separado por campo
   function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
      const { name, value } = e.target;
      setForm(prev => ({ ...prev, [name]: value }));
      // Valida o e-mail em tempo real e mostra mensagem de erro
      if (name === "email") {
         setEmailError(validateEmail(value));
         //              ↑ atualiza a mensagem de erro a cada keystroke
      }
   }

   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      const emailValidationError = validateEmail(form.email);
      if (emailValidationError) {
         setEmailError(emailValidationError);
         return;
      }

      try {
         // POST /api/auth/register — exige token de admin no header
         // O header já está configurado via api.defaults pelo login
         await post("/auth/register", form);
         toast.success("Usuário cadastrado com sucesso!");
         // Limpa o form após sucesso
         setForm({ name: "", email: "", password: "", role: "company", document: "", phone: "" });
         //Limpa erro de email
         setEmailError(null);
      } catch (err: unknown) {
         // Tenta extrair a mensagem de erro da API
         const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            "Erro ao cadastrar usuário.";
         toast.error(message);
      }
   }

   return (
      <Page>
         <PageHeader>
            <Title>Cadastrar Usuário</Title>
            <Subtitle>Crie acesso para empresas, transportadoras ou administradores</Subtitle>
         </PageHeader>

         <FormCard>
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
                        error={emailError ?? undefined} // mostra erro de email ou undefined para sem erro
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
                        <Select id="role" name="role" value={form.role} onChange={handleChange}>
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
