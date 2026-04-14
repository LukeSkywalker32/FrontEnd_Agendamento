import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Content, LayoutWrapper } from "./styles";

export function Layout() {
   return (
      <LayoutWrapper>
         <Sidebar />

         <Content>
            <Header />
            <Outlet />
         </Content>
      </LayoutWrapper>
   );
}
