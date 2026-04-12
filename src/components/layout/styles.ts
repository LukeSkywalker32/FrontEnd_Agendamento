import styled from "styled-components";

export const Container = styled.div`
   display: flex;
   height: 100vh;
`;

export const Content = styled.div`
   flex: 1;
   display: flex;
   flex-direction: column;
`;
export const Logo = styled.h2`
color: ${({ theme }) => theme.colors.primary};'

`;
export const MenuItem = styled.div`
margin: 10px 0;

a {
text-decoration: none;
color: ${({ theme }) => theme.colors.text};

&.active {
font-weigth: bold;
color: ${({ theme }) => theme.colors.primary};
  }
}
`;
export const Right = styled.div`
display: flex;
gap: 10px;
`