export const menuByRole = {
   admin: [
      { label: "Dashboard", path: "/admin/dashboard" },
      { label: "Usuários", path: "/admin/usuarios" },
      { label: "Agendamentos", path: "/admin/agendamentos" },
      { label: "Cadastrar Usuário", path: "/admin/registrar" },
   ],
   company: [
      { label: "Slots", path: "/company/slots" },
      { label: "Agendamentos", path: "/company/agendamentos" },
   ],
   carrier: [
      { label: "Novo Agendamento", path: "/carrier/novo" },
      { label: "Meus Agendamentos", path: "/carrier/meus" },
   ],
   driver: [
      { label: "Check-in", path: "/driver/checkin" },
   ],
};