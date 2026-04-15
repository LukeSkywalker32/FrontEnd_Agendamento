import styled from "styled-components";

const Page = styled.main`
padding: ${({ theme }) => theme.spacing.xl};
`;
const Title = styled.h1`
font-size: ${({ theme }) => theme.typography.sizes["2xl"]};
color: ${({ theme }) => theme.colors.text.primary};
margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export function MeusAgendamentos() {
   return (
      <Page>
         <Title>Meus Agendamentos</Title>
         <p>Conteúdo da página de meus agendamentos.</p>
      </Page>
   );
}
