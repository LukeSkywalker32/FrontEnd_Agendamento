import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { menuByRole } from "./MenuConfig";
import { Container, Logo, MenuItem } from "./styles";

export function Sidebar() {
   const { user } = useAuth();

   const menu = menuByRole[user.role];
   return (
      <Container>
         <Logo>
            <h2>SAT</h2>
         </Logo>
         <nav>
            {menu.map(item => (
               <MenuItem key={item.path}>
                  <NavLink to={item.path}>{item.label}</NavLink>
               </MenuItem>
            ))}
         </nav>
      </Container>
   );
}
