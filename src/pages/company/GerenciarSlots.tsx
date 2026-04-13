import styled from "styled-components";

const Page = styled.main`
padding: ${({ theme }) => theme.spacing.xl};
`;
const Title = styled.h1`
font-size: ${({ theme }) => theme.typography.sizes["2xl"]};
color: ${({ theme }) => theme.colors.text.primary};
margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export function GerenciarSlots() {
   return (
      <Page>
         <Title>Gerenciar Slots</Title>
         <p>Conteúdo da página de gerenciamento de slots.</p>
      </Page>
   );
}
