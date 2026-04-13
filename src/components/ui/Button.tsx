import styled, { css } from "styled-components";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   variant?: ButtonVariant;
   fullWidth?: boolean;
}

const buttonVariants = {
   primary: css`
      background: ${({ theme }) => theme.colors.primary};
      color: ${({ theme }) => theme.colors.text.inverse};

      &:hover:not(:disabled) {
         background: ${({ theme }) => theme.colors.primaryHover};
      }
   `,
   secondary: css`
   background: ${({ theme }) => theme.colors.surface};
   color: ${({ theme }) => theme.colors.text.primary};
   border: 1px solid ${({ theme }) => theme.colors.border};

   &:hover:not(:disabled){
      background: ${({ theme }) => theme.colors.surfaceHover};
   }
   `,
   ghost: css`
   background: transparent;
   color: ${({ theme }) => theme.colors.text.primary};

   &:hover:not(:disabled){
      background: ${({ theme }) => theme.colors.primaryLight};
   }
   `,
};

const StyledButton = styled.button<{ $variant: ButtonVariant; $fullWidth: boolean }>`
   display: inline-flex;
   align-items: center;
   justify-content: center;
   width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
   border-radius: ${({ theme }) => theme.borderRadius.md};
   padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
   font-size: ${({ theme }) => theme.typography.sizes.md};
   font-weight: ${({ theme }) => theme.typography.weights.semibold};
   transition: all 0.2s ease;

   ${({ $variant }) => buttonVariants[$variant]}

   &:disabled {
      opacity: 0.65;
      cursor: not-allowed;
   }
`;
export function Button({ variant = "primary", fullWidth = false, ...props }: ButtonProps) {
   return <StyledButton $variant={variant} $fullWidth={fullWidth} {...props} />;
}
