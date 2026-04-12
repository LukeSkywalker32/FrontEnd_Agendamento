import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import { Container, Right } from "./styles";

export function Header() {
   const { user, logout } = useAuth();
   const { toggleTheme } = useTheme();

   return (
      <Container>
         <h3>Bem-vindo, {user.name}</h3>

         <Right>
            <button onClick={toggleTheme} type="button">
               Tema
            </button>
            <button onClick={logout} type="button">
               Sair
            </button>
         </Right>
      </Container>
   );
}
