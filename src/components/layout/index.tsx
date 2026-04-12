import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Container, Content } from "./styles";


export function Layout() {
   return (
      <Container>
         <Sidebar />

         <Content>
            <Header />
            <Outlet />
         </Content>
      </Container>
   );
}
