import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ActivityLog, LogStats } from '@/hooks/useActivityLogs';

const getEntityTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    competitor: 'Concorrente',
    prospect: 'Prospect',
    client: 'Cliente',
    primary: 'Empresa Principal'
  };
  return labels[type] || type;
};

const getTriggerTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    manual: 'Manual (Batch)',
    automatic: 'Automático',
    manual_single: 'Manual (Individual)'
  };
  return labels[type] || type;
};

const getUpdateTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    full: 'Análise Completa',
    content_news: 'Conteúdo + Notícias',
    news_only: 'Apenas Notícias'
  };
  return labels[type] || type;
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    running: 'Em Execução',
    success: 'Sucesso',
    failed: 'Falhou',
    timeout: 'Timeout'
  };
  return labels[status] || status;
};

const formatDuration = (seconds: number | null): string => {
  if (seconds === null || seconds === undefined) return '-';
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

export const generateLogReport = (logs: ActivityLog[], stats: LogStats | null, dateRange?: { start?: Date; end?: Date }) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório de Logs de Análises', pageWidth / 2, 20, { align: 'center' });
  
  // Date range
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const now = new Date();
  let dateText = `Gerado em: ${format(now, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`;
  
  if (dateRange?.start || dateRange?.end) {
    const startStr = dateRange.start ? format(dateRange.start, 'dd/MM/yyyy', { locale: ptBR }) : 'início';
    const endStr = dateRange.end ? format(dateRange.end, 'dd/MM/yyyy', { locale: ptBR }) : 'hoje';
    dateText += ` | Período: ${startStr} - ${endStr}`;
  }
  doc.text(dateText, pageWidth / 2, 28, { align: 'center' });
  
  let yPos = 40;
  
  // Stats summary
  if (stats) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo', 14, yPos);
    yPos += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const successRate = stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : '0';
    
    const summaryData = [
      ['Total de Análises', stats.total.toString()],
      ['Análises com Sucesso', `${stats.success} (${successRate}%)`],
      ['Análises com Falha', stats.failed.toString()],
      ['Tempo Médio', formatDuration(stats.avgDuration)]
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [],
      body: summaryData,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 40 }
      },
      margin: { left: 14 }
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Stats by entity type
    if (Object.keys(stats.byEntityType).length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Por Tipo de Entidade', 14, yPos);
      yPos += 6;
      
      const entityData = Object.entries(stats.byEntityType).map(([type, count]) => [
        getEntityTypeLabel(type),
        count.toString()
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [],
        body: entityData,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        margin: { left: 14 }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
    }
    
    // Stats by update type
    if (Object.keys(stats.byUpdateType).length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Por Tipo de Atualização', 14, yPos);
      yPos += 6;
      
      const updateData = Object.entries(stats.byUpdateType).map(([type, count]) => [
        getUpdateTypeLabel(type),
        count.toString()
      ]);
      
      autoTable(doc, {
        startY: yPos,
        head: [],
        body: updateData,
        theme: 'plain',
        styles: { fontSize: 9, cellPadding: 2 },
        margin: { left: 14 }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 15;
    }
  }
  
  // Detailed logs table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhamento das Análises', 14, yPos);
  yPos += 8;
  
  const tableData = logs.map(log => [
    log.created_at ? format(new Date(log.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-',
    log.entity_name || log.entity_domain || '-',
    getEntityTypeLabel(log.entity_type),
    getTriggerTypeLabel(log.trigger_type),
    getUpdateTypeLabel(log.update_type),
    formatDuration(log.duration_seconds),
    getStatusLabel(log.status)
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Data/Hora', 'Entidade', 'Tipo', 'Trigger', 'Atualização', 'Duração', 'Status']],
    body: tableData,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 35 },
      2: { cellWidth: 22 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30 },
      5: { cellWidth: 18 },
      6: { cellWidth: 18 }
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
  const fileName = `logs-analises-${format(now, 'yyyy-MM-dd-HHmm')}.pdf`;
  doc.save(fileName);
  
  return fileName;
};
