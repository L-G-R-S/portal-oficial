import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UsageLog {
  id: string;
  user_id: string;
  role: string;
  action_type: string;
  page_path: string;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
}

interface UserStats {
  totalUsers: number;
  activeUsersMonth: number;
  slaPercentage: number;
  leaderSla: number;
  salesSla: number;
}

const getActionLabel = (action_type: string) => {
  const map: Record<string, string> = {
    login: 'Login',
    nova_analise: 'Nova Análise',
    download_pdf: 'Download PDF',
    novo_concorrente: 'Criou Concorrente',
    atualizacao_perfil: 'Atualizou Perfil',
    upload_foto: 'Atualizou Foto',
    page_view: 'Navegação'
  };
  return map[action_type] || action_type;
};

const getRoleLabel = (role: string) => {
  const map: Record<string, string> = {
    executivo: 'Liderança',
    comercial: 'Comercial',
    marketing: 'Marketing',
    inovacao: 'Inovação',
    financas: 'Finanças',
    financeiro: 'Financeiro',
    people: 'People',
    delivery: 'Delivery',
    coe_sap: 'COE SAP',
    coe_qa: 'COE QA',
    backoffice: 'Back Office'
  };
  return map[role] || (role.charAt(0).toUpperCase() + role.slice(1));
};

export const generateUsageReport = (
  logs: UsageLog[], 
  stats: UserStats, 
  filterMonth?: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Uso da Plataforma', pageWidth / 2, 20, { align: 'center' });
  
  // Date/Month
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const now = new Date();
  let dateText = `Gerado em: ${format(now, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`;
  
  if (filterMonth) {
    // filterMonth format: YYYY-MM
    const [year, month] = filterMonth.split('-');
    const monthDate = new Date(parseInt(year), parseInt(month) - 1);
    const monthName = format(monthDate, "MMMM 'de' yyyy", { locale: ptBR });
    dateText += ` | Referência: ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`;
  } else {
    dateText += ` | Referência: Todo o Período`;
  }
  
  doc.text(dateText, pageWidth / 2, 28, { align: 'center' });
  
  let yPos = 40;
  
  // Stats summary
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Adesão e SLAs', 14, yPos);
  yPos += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const summaryData = [
    ['Meta de Uso Global (70%)', `${stats.slaPercentage}% (${stats.activeUsersMonth} de ${stats.totalUsers} ativos)`],
    ['Adesão da Liderança', `${stats.leaderSla}%`],
    ['Adesão do Comercial', `${stats.salesSla}%`],
    ['Total da Equipe Envolvida', `${stats.totalUsers} Usuários`]
  ];
  
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { cellWidth: 80 }
    },
    margin: { left: 14 }
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Detailed logs table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Acesso e Ações da Equipe', 14, yPos);
  yPos += 8;
  
  const tableData = logs.map(log => [
    log.profiles?.full_name || 'Usuário Desconhecido',
    getRoleLabel(log.role),
    getActionLabel(log.action_type),
    log.page_path || '-',
    log.created_at ? format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-'
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Usuário', 'Área', 'Tipo de Ação', 'Detalhes', 'Acesso Em']],
    body: tableData,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [249, 115, 22], textColor: 255, fontStyle: 'bold' }, // Uso orange matches the Usage header
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 25 },
      2: { cellWidth: 30 },
      3: { cellWidth: 55 },
      4: { cellWidth: 30 }
    },
    didDrawPage: (data) => {
      // Footer with page number
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Página ${data.pageNumber} de ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
  });
  
  // Save the PDF
  const fileName = `relatorio-uso-${format(now, 'yyyy-MM-dd-HHmm')}.pdf`;
  doc.save(fileName);
  
  return fileName;
};
