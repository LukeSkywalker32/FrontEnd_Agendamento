export const menuByRole = {
   admin: [
      { label: "Dashboard", path: "/admin/dashboard" },
      { label: "Usuários", path: "/admin/users" },
      { label: "Agendamentos", path: "/admin/schedulings" },
      { label: "Cadastrar Usuário", path: "/admin/register" },
   ],
   company: [
      { label: "Slots", path: "/company/slots" },
      { label: "Agendamentos", path: "/company/scheduling" },
   ],
   carrier: [
      { label: "Novo Agendamento", path: "/carrier/novo" },
      { label: "Meus Agendamentos", path: "/carrier/meus" },
   ],
   driver: [{ label: "Check-in", path: "/driver/checkin" }],
};
