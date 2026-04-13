import styled from "styled-components";

interface CardProps {
   title?: string;
   children: React.ReactNode;
}

const Container = styled.article`
background: ${({ theme }) => theme.colors.surface};
border: 1px solid ${({ theme }) => theme.colors.border};
border-radius: ${({ theme }) => theme.borderRadius.lg};
padding: ${({ theme }) => theme.spacing.lg};
box-shadow: ${({ theme }) => theme.shadows.sm};

`;
const Title = styled.h3`
font-size: ${({ theme }) => theme.typography.sizes.md};
color: ${({ theme }) => theme.colors.text.secondary};
margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

export function Card({ title, children }: CardProps) {
   return (
      <Container>
         {title && <Title>{title}</Title>}
         {children}
      </Container>
   );
}
