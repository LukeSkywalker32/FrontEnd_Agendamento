import styled from "styled-components";

export const LayoutWrapper = styled.div`
   display: flex;
   height: 100vh;
   overflow: hidden;
   background: ${({ theme}) => theme.colors.background}
`;

// Sidebar: painel lateral fixo com largura definida
export const SidebarContainer = styled.aside`
width: 240px;
height: 100vh;
background: ${({ theme})=> theme.colors.sidebar}
display: flex;
flex-direction: column;
flex-shrink: 0;
border-right: 1px solid rgba(255,255,255,0.06);
`;

// Topo da sidebar: área da logo com padding próprio
export const SidebarHeader = styled.div`
padding: ${({ theme}) => `${theme.spacing.xl} ${theme.spacing.lg}`};
border-bottom: 1px solid rgba(255,255,255,0.07)
margin-bottom: ${({ theme}) => theme.spacing.sm}
`;

//Logo: Texto Grande, cor branca, sem nested <h2>
export const Logo = styled.div`
font-size: ${({ theme}) => theme.typography.sizes["2xl"]};
font-weight: ${({theme}) => theme.typography.weights.bold};
color: #FFFFFF;
letter-spacing: -0.5px
`;

// Subtítulo abaixo da logo
export const LogoSub = styled.span`
display: block;
font-size: ${({ theme}) => theme.typography.sizes.xs};
color: ${({theme})=> theme.colors.sidebarText};
font-weight: ${({theme}) => theme.typography.weights.regular};
margin-top: 2px;
letter-spacing: 0.5px;
text-transform: uppercase;
`;

// Nav wrapper: área dos links com padding lateral
export const SidebarNav = styled.nav`
   flex: 1;
   padding: 0 ${({ theme }) => theme.spacing.sm};
   overflow-y: auto;
`;

// Label de seção dentro do menu (ex: "GERAL", "RELATÓRIOS")
export const MenuSection = styled.p`
font-size: 10px;
font-weight: ${({ theme })=> theme.typography.weights.semibold}
color: ${({theme})=> theme.colors.sidebarText}
opacity: 0.5;
text-transform: uppercase;
letter-spacing: 1px;
padding: ${({theme})=> `${theme.spacing.md} ${theme.spacing.sm} 4px`};
margin: 0;
`;

// Wrapper do item de menu: margem pequena entre links
export const MenuItem = styled.div`
   margin: 2px 0;

   a {
      display: flex;
      align-items: center;
      gap: ${({ theme }) => theme.spacing.sm};
      padding: ${({ theme }) => `10px ${theme.spacing.md}`};
      border-radius: ${({ theme }) => theme.borderRadius.md};
      text-decoration: none;
      color: ${({ theme }) => theme.colors.sidebarText};
      font-size: ${({ theme }) => theme.typography.sizes.sm};
      font-weight: ${({ theme }) => theme.typography.weights.medium};
      transition: background 0.15s ease, color 0.15s ease;

      &:hover {
         background: rgba(255, 255, 255, 0.07);
         color: #ffffff;
      }

      // NavLink adiciona .active automaticamente quando a rota está ativa
      &.active {
         background: ${({ theme }) => theme.colors.sidebarActive};
         color: #ffffff;
         font-weight: ${({ theme }) => theme.typography.weights.semibold};
      }
   }
`;

// Rodapé da sidebar: área do usuário logado
export const SidebarFooter = styled.div`
   padding: ${({ theme }) => theme.spacing.md};
   border-top: 1px solid rgba(255, 255, 255, 0.07);
   font-size: ${({ theme }) => theme.typography.sizes.xs};
   color: ${({ theme }) => theme.colors.sidebarText};
`;

export const Content = styled.div`
   flex: 1;
   display: flex;
   flex-direction: column;
   overflow-y: hidden;
`;
// Container do header: barra superior fixa
export const HeaderContainer = styled.header`
   display: flex;
   align-items: center;
   justify-content: space-between;
   padding: 0 ${({ theme }) => theme.spacing.xl};
   background: ${({ theme }) => theme.colors.surface};
   border-bottom: 1px solid ${({ theme }) => theme.colors.border};
   height: 60px;
   flex-shrink: 0;
`;

export const Right = styled.div`
   display: flex;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.sm};
`;

// Badge de role do usuário no header
export const RoleBadge = styled.span`
   font-size: ${({ theme }) => theme.typography.sizes.xs};
   font-weight: ${({ theme }) => theme.typography.weights.semibold};
   background: ${({ theme }) => theme.colors.primaryLight};
   color: ${({ theme }) => theme.colors.primary};
   padding: 3px 10px;
   border-radius: ${({ theme }) => theme.borderRadius.full};
   text-transform: uppercase;
   letter-spacing: 0.5px;
`;

// Botão ícone: transparente, só ícone (tema, logout)
export const IconButton = styled.button`
   display: flex;
   align-items: center;
   justify-content: center;
   width: 36px;
   height: 36px;
   border-radius: ${({ theme }) => theme.borderRadius.md};
   border: 1px solid ${({ theme }) => theme.colors.border};
   background: transparent;
   color: ${({ theme }) => theme.colors.text.secondary};
   cursor: pointer;
   transition: all 0.15s ease;

   &:hover {
      background: ${({ theme }) => theme.colors.surfaceHover};
      color: ${({ theme }) => theme.colors.text.primary};
   }
`;