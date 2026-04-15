import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styled from "styled-components";
import { Button, Input } from "../../components/ui";
import { useApi } from "../../hooks/useApi";

const Page = styled.main`
   flex: 1;
   overflow-y: auto;
   padding: ${({ theme }) => theme.spacing.xl};
   background: ${({ theme }) => theme.colors.background};
`;

const PageHeader = styled.div`
   margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
   font-size: ${({ theme }) => theme.typography.sizes["2xl"]};
   font-weight: ${({ theme }) => theme.typography.weights.bold};
   color: ${({ theme }) => theme.colors.text.primary};
   margin-bottom: 4px;
`;

const Subtitle = styled.p`
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: ${({ theme }) => theme.colors.text.secondary};
`;

const FormCard = styled.div`
   background: ${({ theme }) => theme.colors.surface};
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.lg};
   padding: ${({ theme }) => theme.spacing.xl};
   max-width: 800px;
`;

const Row = styled.div`
   display: grid;
   grid-template-columns: 1fr 1fr;
   gap: ${({ theme }) => theme.spacing.md};

   @media (max-width: 640px) {
      grid-template-columns: 1fr;
   }
`;

const Stack = styled.div`
   display: flex;
   flex-direction: column;
   gap: ${({ theme }) => theme.spacing.md};
`;

const FormGroup = styled.div`
   display: flex;
   flex-direction: column;
   gap: 4px;
`;

const Label = styled.label`
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: ${({ theme }) => theme.colors.text.secondary};
   font-weight: ${({ theme }) => theme.typography.weights.medium};
   display: block;
`;

const Select = styled.select`
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.md};
   padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
   background: ${({ theme }) => theme.colors.surface};
   color: ${({ theme }) => theme.colors.text.primary};
   font-size: ${({ theme }) => theme.typography.sizes.md};
   font-family: inherit;
   width: 100%;

   &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
   }

   &:disabled {
      background: ${({ theme }) => theme.colors.background};
      cursor: not-allowed;
   }
`;

const TextArea = styled.textarea`
   border: 1px solid ${({ theme }) => theme.colors.border};
   border-radius: ${({ theme }) => theme.borderRadius.md};
   padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
   background: ${({ theme }) => theme.colors.surface};
   color: ${({ theme }) => theme.colors.text.primary};
   font-size: ${({ theme }) => theme.typography.sizes.md};
   font-family: inherit;
   width: 100%;
   min-height: 80px;
   resize: vertical;

   &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
   }
`;

const FileInput = styled.input`
   margin-top: 4px;
   font-size: ${({ theme }) => theme.typography.sizes.sm};
   color: ${({ theme }) => theme.colors.text.secondary};

   &::file-selector-button {
      padding: 8px 16px;
      border-radius: ${({ theme }) => theme.borderRadius.md};
      border: 1px solid ${({ theme }) => theme.colors.border};
      background: ${({ theme }) => theme.colors.surface};
      cursor: pointer;
      margin-right: 12px;
      transition: all 0.2s;

      &:hover {
         background: ${({ theme }) => theme.colors.surfaceHover};
      }
   }
`;

const Divider = styled.hr`
   border: none;
   border-top: 1px solid ${({ theme }) => theme.colors.border};
   margin: ${({ theme }) => `${theme.spacing.lg} 0`};
`;

const Actions = styled.div`
   display: flex;
   justify-content: flex-end;
   gap: ${({ theme }) => theme.spacing.sm};
`;

interface Company {
   _id: string;
   name: string;
}

interface TimeWindow {
   _id: string;
   date: string;
   startTime: string;
   endTime: string;
   currentCount: number;
   maxVehicles: number;
}

export function NovoAgendamento() {
   const { get, post, isLoading } = useApi();
   const navigate = useNavigate();

   const [companies, setCompanies] = useState<Company[]>([]);
   const [timeWindows, setTimeWindows] = useState<TimeWindow[]>([]);
   const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

   const [form, setForm] = useState({
      companyId: "",
      timeWindowId: "",
      driverName: "",
      driverCpf: "",
      driverPhone: "",
      vehiclePlate: "",
      vehicleType: "",
      cargoDescription: "",
   });

   useEffect(() => {
      async function loadCompanies() {
         try {
            const response = await get("/carrier/companies");
            setCompanies(response.data || []);
         } catch (err) {
            toast.error("Erro ao carregar empresas de insumos.");
         }
      }
      loadCompanies();
   }, [get]);

   useEffect(() => {
      async function loadTimeWindows() {
         if (!form.companyId) {
            setTimeWindows([]);
            return;
         }
         try {
            const response = await get(`/carrier/companies/${form.companyId}/time-windows`);
            setTimeWindows(response.data || []);
         } catch (err) {
            toast.error("Erro ao carregar janelas de horário.");
         }
      }
      loadTimeWindows();
   }, [form.companyId, get]);

   function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
      const { name, value } = e.target;
      setForm(prev => ({ ...prev, [name]: value }));
   }

   function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
      if (e.target.files) {
         setSelectedFiles(Array.from(e.target.files));
      }
   }

   async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();

      try {
         const formData = new FormData();
         
         // Adiciona campos do formulário
         Object.entries(form).forEach(([key, value]) => {
            formData.append(key, value);
         });

         // Adiciona arquivos
         selectedFiles.forEach(file => {
            formData.append("documents", file);
         });

         await post("/carrier/schedulings", formData, {
            headers: {
               "Content-Type": "multipart/form-data",
            },
         });

         toast.success("Agendamento realizado com sucesso!");
         navigate("/carrier/meus");
      } catch (err: any) {
         const message = err.response?.data?.message ?? "Erro ao realizar agendamento.";
         toast.error(message);
      }
   }

   return (
      <Page>
         <PageHeader>
            <Title>Novo Agendamento</Title>
            <Subtitle>Preencha os dados abaixo para solicitar um novo agendamento de descarga</Subtitle>
         </PageHeader>

         <FormCard>
            <form onSubmit={handleSubmit}>
               <Stack>
                  <Title as="h3" style={{ fontSize: "1.125rem", marginBottom: "8px" }}>
                     Local e Horário
                  </Title>
                  <Row>
                     <FormGroup>
                        <Label htmlFor="companyId">Empresa de Insumos</Label>
                        <Select
                           id="companyId"
                           name="companyId"
                           value={form.companyId}
                           onChange={handleChange}
                           required
                        >
                           <option value="">Selecione uma empresa</option>
                           {companies.map(company => (
                              <option key={company._id} value={company._id}>
                                 {company.name}
                              </option>
                           ))}
                        </Select>
                     </FormGroup>

                     <FormGroup>
                        <Label htmlFor="timeWindowId">Janela de Horário</Label>
                        <Select
                           id="timeWindowId"
                           name="timeWindowId"
                           value={form.timeWindowId}
                           onChange={handleChange}
                           disabled={!form.companyId}
                           required
                        >
                           <option value="">Selecione um horário</option>
                           {timeWindows.map(window => (
                              <option key={window._id} value={window._id}>
                                 {new Date(window.date).toLocaleDateString("pt-BR")} - {window.startTime} às {window.endTime} ({window.maxVehicles - window.currentCount} vagas)
                              </option>
                           ))}
                        </Select>
                     </FormGroup>
                  </Row>

                  <Divider />

                  <Title as="h3" style={{ fontSize: "1.125rem", marginBottom: "8px" }}>
                     Dados do Motorista e Veículo
                  </Title>
                  <Row>
                     <Input
                        id="driverName"
                        name="driverName"
                        label="Nome do Motorista"
                        placeholder="Nome completo"
                        value={form.driverName}
                        onChange={handleChange}
                        required
                     />
                     <Input
                        id="driverCpf"
                        name="driverCpf"
                        label="CPF do Motorista"
                        placeholder="000.000.000-00"
                        value={form.driverCpf}
                        onChange={handleChange}
                        required
                     />
                  </Row>

                  <Row>
                     <Input
                        id="driverPhone"
                        name="driverPhone"
                        label="Telefone do Motorista"
                        placeholder="(00) 00000-0000"
                        value={form.driverPhone}
                        onChange={handleChange}
                     />
                     <Input
                        id="vehiclePlate"
                        name="vehiclePlate"
                        label="Placa do Veículo"
                        placeholder="ABC1D23"
                        value={form.vehiclePlate}
                        onChange={handleChange}
                        required
                     />
                  </Row>

                  <Row>
                     <FormGroup>
                        <Label htmlFor="vehicleType">Tipo de Veículo</Label>
                        <Select
                           id="vehicleType"
                           name="vehicleType"
                           value={form.vehicleType}
                           onChange={handleChange}
                           required
                        >
                           <option value="">Selecione o tipo</option>
                           <option value="Bitrem">Bitrem</option>
                           <option value="Carreta">Carreta</option>
                           <option value="Truck">Truck</option>
                           <option value="Toco">Toco</option>
                           <option value="VLC">VLC</option>
                        </Select>
                     </FormGroup>
                     <FormGroup>
                        <Label htmlFor="documents">Documentos (PDF/Imagens)</Label>
                        <FileInput
                           id="documents"
                           type="file"
                           multiple
                           onChange={handleFileChange}
                           accept=".pdf,image/*"
                        />
                     </FormGroup>
                  </Row>

                  <FormGroup>
                     <Label htmlFor="cargoDescription">Descrição da Carga (Opcional)</Label>
                     <TextArea
                        id="cargoDescription"
                        name="cargoDescription"
                        placeholder="Ex: Milho a granel, 30 toneladas..."
                        value={form.cargoDescription}
                        onChange={handleChange}
                     />
                  </FormGroup>
               </Stack>

               <Divider />

               <Actions>
                  <Button
                     variant="secondary"
                     type="button"
                     onClick={() => navigate("/carrier/meus")}
                  >
                     Cancelar
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                     {isLoading ? "Processando..." : "Confirmar Agendamento"}
                  </Button>
               </Actions>
            </form>
         </FormCard>
      </Page>
   );
}
