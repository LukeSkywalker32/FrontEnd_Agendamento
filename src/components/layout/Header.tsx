import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import { HeaderContainer, Right, RoleBadge, IconButton } from "./styles";

//Icone de lua
function MoonIcon() {
  return(
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

//Icone de Sol (light mode)
function SunIcon() {
  return(
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
         <circle cx="12" cy="12" r="5" />
         <line x1="12" y1="1" x2="12" y2="3" />
         <line x1="12" y1="21" x2="12" y2="23" />
         <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
         <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
         <line x1="1" y1="12" x2="3" y2="12" />
         <line x1="21" y1="12" x2="23" y2="12" />
         <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
         <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
  )
}

//Icone de logout

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export function Header() {
   const { user, logout } = useAuth();
   const { mode, toggleTheme } = useTheme();

   return (
      <HeaderContainer>
        <span style={{ fontSize: "0.875rem", fontWeight: 500}}>
          Olá, <strong>{user.name}</strong>!
        </span>
         <Right>
            <RoleBadge>{user.role}</RoleBadge>

            <IconButton onClick={toggleTheme} type="button" title="Alternar tema">
               {mode === "light" ? <MoonIcon /> : <SunIcon />}
            </IconButton>

            <IconButton onClick={logout} type="button" title="Sair">
               <LogoutIcon />
            </IconButton>
         </Right>
      </HeaderContainer>
   );
}
