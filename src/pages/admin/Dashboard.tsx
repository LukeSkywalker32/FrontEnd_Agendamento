import styled from "styled-components";

import { Button, Card } from "../../components/ui";
import { useTheme } from "../../contexts/ThemeContext";

const Page = styled.main`
   min-height: 100vh;
   padding: ${({ theme }) => theme.spacing.xl};
   background: ${({ theme }) => theme.colors.background};
`;

const Header = styled.header`
   display: flex;
   justify-content: space-between;
   align-items: center;
   gap: ${({ theme }) => theme.spacing.md};
   margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const TitleGroup = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.xs};
`;

const Title = styled.h1`
   font-size: ${({ theme }) => theme.typography.sizes["3xl"]};
   color: ${({ theme }) => theme.colors.text.primary};
`;

const Subtitle = styled.p`
   color: ${({ theme }) => theme.colors.text.secondary};
`;

const CardGrid = styled.section`
   display: grid;
   grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
   gap: ${({ theme }) => theme.spacing.md};
`;

const CardValue = styled.strong`
   font-size: ${({ theme }) => theme.typography.sizes["2xl"]};
   color: ${({ theme }) => theme.colors.text.primary};
`;
export function Dashboard() {
   const { mode, toggleTheme } = useTheme();

   return (
      <Page>
         <Header>
            <TitleGroup>
               <Title> Painel SAT</Title>
               <Subtitle>Etapa1: Estrutura da interface</Subtitle>
            </TitleGroup>

            <Button onClick={toggleTheme}>Tema: {mode === "light" ? "escuro" : "claro"}</Button>
         </Header>

         <CardGrid>
            <Card title="Total de agendamentos">
               <CardValue>12</CardValue>
            </Card>

            <Card title="Agendamentos hoje">
               <CardValue>9</CardValue>
            </Card>

            <Card title="Próximo horário livre">
               <CardValue>15:30</CardValue>
            </Card>
         </CardGrid>
      </Page>
   );
}
