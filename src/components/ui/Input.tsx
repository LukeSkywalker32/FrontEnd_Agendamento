import styled from "styled-components";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
   label?: string;
   error?: string;
}
const Wrapper = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.xs};
`;

const Label = styled.label`
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: ${({ theme }) => theme.colors.text.secondary};
   font-weight: ${({ theme }) => theme.typography.weights.medium};
`;

const Field = styled.input<{ $hasError: boolean }>`
   border: 1px solid
      ${({ theme, $hasError }) => ($hasError ? theme.colors.status.error : theme.colors.border)};
   border-radius: ${({ theme }) => theme.borderRadius.md};
   padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
   background: ${({ theme }) => theme.colors.surface};
   color: ${({ theme }) => theme.colors.text.primary};

   &:focus {
      outline: none;
      border-color: ${({ theme, $hasError }) => ($hasError ? theme.colors.status.error : theme.colors.primary)};
      box-shadow: 0 0 0 3px
         ${({ theme, $hasError }) =>
            $hasError ? theme.colors.status.errorBg : theme.colors.primaryLight};
   }
`;

// biome-ignore lint/suspicious/noShadowRestrictedNames: <explanation>
const Error = styled.span`
   font-size: ${({ theme }) => theme.typography.sizes.xs};
   color: ${({ theme }) => theme.colors.status.error};
`;

export function Input({ label, id, error, ...props }: InputProps) {
   return (
      <Wrapper>
         {label && <Label htmlFor={id}>{label}</Label>}
         <Field id={id} $hasError={Boolean(error)} {...props} />
         {error && <Error>{error}</Error>}
      </Wrapper>
   );
}
