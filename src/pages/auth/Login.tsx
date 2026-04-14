import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../hooks/useAuth";
import { Button, Input } from "../../components/ui";

// Wrapper externo: full screen dividido em dois painéis
const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden
`;

// Painel esquerdo: identidade visual do sistema
const BrandPanel = styled.div`
   width: 420px;
   background: ${({ theme }) => theme.colors.sidebar};
   display: flex;
   flex-direction: column;
   justify-content: space-between;
   padding: ${({ theme }) => theme.spacing["2xl"]};
   flex-shrink: 0;

   // Esconde em telas pequenas
   @media (max-width: 768px) {
      display: none;
   }
`;

// Logo grande na marca
const BrandLogo = styled.div`
   font-size: 2.5rem;
   font-weight: ${({ theme }) => theme.typography.weights.bold};
   color: #ffffff;
   letter-spacing: -1px;
`;

// Subtítulo da marca
const BrandSub = styled.div`
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: ${({ theme }) => theme.colors.sidebarText};
   margin-top: 6px;
   text-transform: uppercase;
   letter-spacing: 1px;
`;

// Texto descritivo no meio do painel
const BrandBody = styled.div`
   flex: 1;
   display: flex;
   flex-direction: column;
   justify-content: center;
`;

const BrandTitle = styled.h2`
   font-size: ${({ theme }) => theme.typography.sizes["2xl"]};
   font-weight: ${({ theme }) => theme.typography.weights.bold};
   color: #ffffff;
   line-height: 1.3;
   margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const BrandDesc = styled.p`
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: ${({ theme }) => theme.colors.sidebarText};
   line-height: 1.7;
`;

// Rodapé do painel de marca
const BrandFooter = styled.div`
   font-size: ${({ theme }) => theme.typography.sizes.xs};
   color: ${({ theme }) => theme.colors.sidebarText};
   opacity: 0.5;
`;

// Painel direito: formulário de login
const FormPanel = styled.div`
   flex: 1;
   display: flex;
   align-items: center;
   justify-content: center;
   background: ${({ theme }) => theme.colors.background};
   padding: ${({ theme }) => theme.spacing["2xl"]};
`;

// Card interno do formulário: largura máxima controlada
const FormCard = styled.div`
   width: 100%;
   max-width: 360px;
`;

// Título do formulário
const FormTitle = styled.h1`
   font-size: ${({ theme }) => theme.typography.sizes["2xl"]};
   font-weight: ${({ theme }) => theme.typography.weights.bold};
   color: ${({ theme }) => theme.colors.text.primary};
   margin-bottom: 6px;
`;

// Subtítulo abaixo do título
const FormSubtitle = styled.p`
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: ${({ theme }) => theme.colors.text.secondary};
   margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

// Wrapper do form: empilha inputs verticalmente
const Form = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.md};
`;

// Banner de erro: aparece somente quando há erro de login
const ErrorBanner = styled.div`
   background: ${({ theme }) => theme.colors.status.errorBg};
   border: 1px solid ${({ theme }) => theme.colors.status.error};
   border-radius: ${({ theme }) => theme.borderRadius.md};
   padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
   color: ${({ theme }) => theme.colors.status.error};
   font-size: ${({ theme }) => theme.typography.sizes.sm};
`;


export function Login() {
   const { login } = useAuth();
   const navigate = useNavigate();

   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [loading, setLoading] = useState(false);

   //Estado de erro
   const [error, setError] = useState<string | null>(null);

   // Rotas baseadas no role
   const roleRoutes = {
      admin: "/admin/dashboard",
      company: "/company/agendamentos",
      carrier: "/carrier/meus-agendamentos",
      driver: "/driver/checkin",
   };

   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      // Limpa erro anterior
      setError(null);

      try {
         setLoading(true);
         const user = await login(email, password);
         navigate(roleRoutes[user.role]);
      } catch {
         setError("Email ou senha inválidos");
      } finally {
         setLoading(false);
      }
   }

   return (
      <Wrapper>
        <BrandPanel>
        <div>
          <BrandLogo>SAT</BrandLogo>
          <BrandSub>Sistema de Agendamento de Transporte</BrandSub>
        </div>

        <BrandBody>
        <BrandTitle>Controle total dos seus agendamentos de transporte</BrandTitle>
        <BrandDesc>
                  Gerencie janelas de horário, transportadoras, motoristas e check-ins em um único
                  lugar.        
        </BrandDesc>
        </BrandBody>

        <BrandFooter>₢ {new Date().getFullYear()} Desenvolvido por Luke Skywalker</BrandFooter>
        </BrandPanel>

        <FormPanel>
          <FormCard>
            <FormTitle>Bem-vindo de Volta</FormTitle>
            <FormSubtitle>Entre com suas credenciais para continuar</FormSubtitle>
            {/*banner de erro */}
            {error && <ErrorBanner>{error}</ErrorBanner>}
            <form onSubmit={handleSubmit}>
              <Form>
                <Input
                id="email"
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e=> setEmail(e.target.value)}
                required                
                />
                <Input
                id="password"
                label="Senha"
                type="password"
                placeholder="********"
                value={password}
                onChange={e=> setPassword(e.target.value)}
                required                
                />

                {/*Button com disabled durante o loading */}
                <Button type="submit" fullWidth disabled={loading} style={{marginTop: 8}}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </Form>
            </form>
          </FormCard>
        </FormPanel>        
      </Wrapper>
   );
}
