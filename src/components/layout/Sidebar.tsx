import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { menuByRole } from "./MenuConfig";
import {
   Logo,
   LogoSub,
   MenuItem,
   MenuSection,
   SidebarContainer,
   SidebarFooter,
   SidebarHeader,
   SidebarNav,
} from "./styles";

export function Sidebar() {
   const { user } = useAuth();

   //Busca o menu correto baseado no role do usuario
   const menu = menuByRole[user.role];
   return (
      <SidebarContainer>
         <SidebarHeader>
            <Logo>SAT</Logo>
            <LogoSub>Sistema de Agendamento de Transportes</LogoSub>
         </SidebarHeader>

         <SidebarNav>
            <MenuSection>Menu</MenuSection>

            {menu.map(item => (
               <MenuItem key={item.path}>
                  <NavLink to={item.path}>{item.label}</NavLink>
               </MenuItem>
            ))}
         </SidebarNav>

         <SidebarFooter>
            Perfil: <strong style={{ color: "#fff" }}>{user!.role}</strong>
         </SidebarFooter>
      </SidebarContainer>
   );
}
