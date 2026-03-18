import jsPDF from "jspdf";

interface GlassdoorData {
  overall_rating?: number | null;
  recommend_to_friend?: number | null;
  ceo_rating?: number | null;
  compensation_benefits_rating?: number | null;
  culture_values_rating?: number | null;
  career_opportunities_rating?: number | null;
  work_life_balance_rating?: number | null;
  diversity_inclusion_rating?: number | null;
  pros_example?: string | null;
  cons_example?: string | null;
  advice_example?: string | null;
}

interface LeaderData {
  name?: string | null;
  position?: string | null;
  decision_level?: string | null;
}

interface SimilarCompanyData {
  name?: string | null;
  industry?: string | null;
  location?: string | null;
}

interface MarketNewsData {
  title?: string | null;
  date?: string | null;
  summary?: string | null;
  classification?: string | null;
}

interface CompanyDisplayData {
  name?: string | null;
  logo_url?: string | null;
  industry?: string | null;
  sector?: string | null;
  headquarters?: string | null;
  hq_location?: string | null;
  location?: string | null;
  size?: string | null;
  employees?: number | null;
  year_founded?: number | null;
  founded_year?: number | null;
  description?: string | null;
  general_summary?: string | null;
  short_description?: string | null;
  products_services?: string[] | string | null;
  differentiators?: string[] | string | null;
  market?: string | null;
  business_model?: string | null;
  linkedin_specialties?: string[] | null;
  linkedin_tagline?: string | null;
  linkedin_followers?: number | null;
  instagram_followers?: number | null;
  instagram_posts_count?: number | null;
  youtube_subscribers?: number | null;
  youtube_total_videos?: number | null;
  youtube_total_views?: number | null;
  domain?: string;
  payload_json?: {
    overview?: {
      overall_analysis?: string;
    };
    cover_url?: string;
  };
}

interface MarketResearchData {
  central_message?: string | null;
  institutional_discourse?: string | null;
  overall_analysis?: string | null;
}

interface ReportData {
  competitor: CompanyDisplayData | null;
  company: CompanyDisplayData | null;
  glassdoor: GlassdoorData | null;
  marketResearch: MarketResearchData | null;
  leadership: LeaderData[];
  similarCompanies: SimilarCompanyData[];
  marketNews: MarketNewsData[];
  socialPosts: {
    linkedin: unknown[];
    instagram: unknown[];
    youtube: unknown[];
  };
}

// Cores
const ORANGE = [249, 115, 22];
const ORANGE_LIGHT = [255, 237, 213];
const BLUE_LINKEDIN = [0, 119, 181];
const PINK_INSTAGRAM = [225, 48, 108];
const RED_YOUTUBE = [255, 0, 0];
const TEXT_DARK = [31, 41, 55];
const TEXT_MUTED = [107, 114, 128];
const GRAY_BG = [249, 250, 251];
const YELLOW_STAR = [250, 204, 21];

// Carregar imagem como base64
const loadImageAsBase64 = (url: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    setTimeout(() => resolve(null), 3000); // Timeout de 3s
    img.src = url;
  });
};

export async function generateCompetitorReport(data: ReportData): Promise<void> {
  const { competitor, company, glassdoor, marketResearch, leadership, similarCompanies, marketNews } = data;
  const displayData = company || competitor;
  
  const doc = new jsPDF();
  let yPos = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Helpers
  const checkPage = (space: number = 25) => {
    if (yPos > 275 - space) {
      doc.addPage();
      yPos = 20;
    }
  };

  const setColor = (c: number[]) => doc.setTextColor(c[0], c[1], c[2]);
  const setFill = (c: number[]) => doc.setFillColor(c[0], c[1], c[2]);
  const setDraw = (c: number[]) => doc.setDrawColor(c[0], c[1], c[2]);

  // ========== SEÇÃO COM BARRA LARANJA ==========
  const addSection = (title: string) => {
    checkPage(30);
    yPos += 8;
    
    // Barra laranja vertical
    setFill(ORANGE);
    doc.rect(margin, yPos - 5, 3, 12, 'F');
    
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    setColor(TEXT_DARK);
    doc.text(title, margin + 7, yPos + 3);
    yPos += 15;
  };

  // ========== SUBTÍTULO ==========
  const addSubSection = (title: string) => {
    checkPage(12);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    setColor(ORANGE);
    doc.text(title, margin + 3, yPos);
    yPos += 6;
  };

  // ========== TEXTO ==========
  const addText = (text: string, indent: number = 0) => {
    if (!text || text === 'null' || text === 'undefined') return;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    setColor(TEXT_DARK);
    const lines = doc.splitTextToSize(String(text), contentWidth - indent);
    lines.forEach((line: string) => {
      checkPage(5);
      doc.text(line, margin + indent, yPos);
      yPos += 4.5;
    });
    yPos += 2;
  };

  // ========== CAMPO ==========
  const addField = (label: string, value: unknown, indent: number = 0) => {
    if (!value || value === 'null' || value === 'undefined' || value === '') return;
    checkPage(6);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    setColor(TEXT_MUTED);
    doc.text(`${label}:`, margin + indent, yPos);
    doc.setFont("helvetica", "normal");
    setColor(TEXT_DARK);
    const labelW = doc.getTextWidth(`${label}:`) + 3; // Adiciona espaço
    doc.text(String(value), margin + indent + labelW, yPos);
    yPos += 5.5;
  };

  // ========== LISTA ==========
  const addListItem = (text: string, indent: number = 0) => {
    if (!text || text === 'null' || text === 'undefined') return;
    checkPage(6);
    doc.setFontSize(9);
    
    // Desenhar bullet como círculo
    setFill(ORANGE);
    doc.circle(margin + indent + 1.5, yPos - 1, 1.2, 'F');
    
    setColor(TEXT_DARK);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(String(text), contentWidth - indent - 6);
    doc.text(lines[0], margin + indent + 5, yPos);
    yPos += 4.5;
    for (let i = 1; i < lines.length; i++) {
      checkPage(4);
      doc.text(lines[i], margin + indent + 5, yPos);
      yPos += 4.5;
    }
  };

  // ========== CARD DE REDE SOCIAL ==========
  const drawSocialCard = (x: number, y: number, w: number, platform: string, value: string, color: number[]) => {
    // Fundo
    setFill(GRAY_BG);
    setDraw([220, 220, 220]);
    doc.roundedRect(x, y, w, 24, 3, 3, 'FD');
    
    // Barra colorida
    setFill(color);
    doc.rect(x, y, 4, 24, 'F');
    
    // Número
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    setColor(color);
    doc.text(value, x + 10, y + 10);
    
    // Label
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    setColor(TEXT_MUTED);
    doc.text(platform, x + 10, y + 18);
  };

  // ========== DESENHAR ESTRELA DE 5 PONTAS ==========
  const drawStar = (cx: number, cy: number, size: number, filled: boolean) => {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.5;
    
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;
    
    const points: { x: number; y: number }[] = [];
    
    for (let i = 0; i < spikes; i++) {
      // Ponto externo
      let x = cx + Math.cos(rot) * outerRadius;
      let y = cy + Math.sin(rot) * outerRadius;
      points.push({ x, y });
      rot += step;
      
      // Ponto interno
      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      points.push({ x, y });
      rot += step;
    }
    
    // Desenhar usando lines
    if (filled) {
      setFill(YELLOW_STAR);
    } else {
      setFill([230, 230, 230]);
    }
    
    // Começar o path
    doc.setLineWidth(0.3);
    setDraw(filled ? [234, 179, 8] : [200, 200, 200]);
    
    // Usar método lines do jsPDF
    const linesArray = points.map((p, i) => {
      if (i === 0) return [p.x - points[0].x, p.y - points[0].y];
      return [p.x - points[i-1].x, p.y - points[i-1].y];
    });
    
    doc.lines(linesArray.slice(1), points[0].x, points[0].y, [1, 1], 'FD', true);
  };

  // ========== ESTRELAS ==========
  const drawStars = (x: number, y: number, rating: number) => {
    const full = Math.floor(rating);
    const starSize = 2.5; // Menor ainda
    const gap = 1.5;
    
    for (let i = 0; i < 5; i++) {
      const starX = x + (i * (starSize * 2 + gap)) + starSize;
      drawStar(starX, y, starSize, i < full);
    }
    
    // Número ao lado - alinhado verticalmente com as estrelas
    const textX = x + (5 * (starSize * 2 + gap)) + 5;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    setColor(TEXT_DARK);
    doc.text(String(rating), textX, y + 1);
  };

  // ========== BARRA DE RATING ==========
  const drawRatingBar = (label: string, rating: number | null) => {
    if (!rating) return;
    checkPage(10);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    setColor(TEXT_DARK);
    doc.text(label, margin + 3, yPos);
    
    // Barra de fundo
    const barX = margin + 70;
    const barW = 50;
    setFill([230, 230, 230]);
    doc.rect(barX, yPos - 3, barW, 5, 'F');
    
    // Barra preenchida
    const fillW = (rating / 5) * barW;
    setFill(ORANGE);
    doc.rect(barX, yPos - 3, fillW, 5, 'F');
    
    // Valor
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    setColor(ORANGE);
    doc.text(String(rating), barX + barW + 4, yPos);
    
    yPos += 8;
  };

  // ==================== CABEÇALHO ====================
  const companyName = displayData?.name || competitor?.domain || "Empresa";
  const logoUrl = displayData?.logo_url || competitor?.logo_url;
  
  // Tentar carregar logo
  let logoLoaded = false;
  if (logoUrl) {
    try {
      const logoBase64 = await loadImageAsBase64(logoUrl);
      if (logoBase64) {
        // Fundo branco para logo
        setFill([255, 255, 255]);
        setDraw([220, 220, 220]);
        doc.roundedRect(margin, yPos, 28, 28, 3, 3, 'FD');
        
        doc.addImage(logoBase64, 'PNG', margin + 2, yPos + 2, 24, 24);
        logoLoaded = true;
      }
    } catch {
      // Logo failed to load
    }
  }

  // Nome da empresa
  const nameX = logoLoaded ? margin + 35 : margin;
  const nameY = logoLoaded ? yPos + 12 : yPos + 5;
  
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  setColor(TEXT_DARK);
  doc.text(companyName, nameX, nameY);
  
  // Tagline
  const tagline = company?.linkedin_tagline || competitor?.linkedin_tagline;
  if (tagline) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    setColor(TEXT_MUTED);
    const maxW = logoLoaded ? contentWidth - 35 : contentWidth;
    const tagLines = doc.splitTextToSize(tagline, maxW);
    doc.text(tagLines[0], nameX, nameY + 6);
  }
  
  yPos = logoLoaded ? yPos + 35 : yPos + 15;
  
  // Badges de info
  const infos: string[] = [];
  const sector = (displayData?.industry || competitor?.industry || competitor?.sector)?.split(',')[0]?.trim();
  if (sector) infos.push(sector);
  const location = displayData?.headquarters || competitor?.hq_location || competitor?.location;
  if (location) infos.push(location);
  const employees = displayData?.size || (competitor?.employees ? `${competitor.employees} func.` : null);
  if (employees) infos.push(employees);
  const founded = displayData?.year_founded || competitor?.founded_year;
  if (founded) infos.push(`Fundada em ${founded}`);
  
  if (infos.length > 0) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    let badgeX = margin;
    
    infos.forEach((info, idx) => {
      const w = doc.getTextWidth(info) + 8;
      if (badgeX + w > pageWidth - margin) {
        badgeX = margin;
        yPos += 8;
      }
      
      setFill(GRAY_BG);
      doc.roundedRect(badgeX, yPos - 4, w, 7, 2, 2, 'F');
      setColor(TEXT_MUTED);
      doc.text(info, badgeX + 4, yPos);
      badgeX += w + 3;
    });
    yPos += 10;
  }
  
  // Glassdoor badge com estrelas
  if (glassdoor?.overall_rating) {
    setFill(ORANGE_LIGHT);
    setDraw(ORANGE);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos - 4, 55, 10, 2, 2, 'FD');
    drawStars(margin + 3, yPos + 2, glassdoor.overall_rating);
    yPos += 12;
  }
  
  // Separador
  setDraw([220, 220, 220]);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  // ==================== SOBRE ====================
  const description = displayData?.description || competitor?.general_summary || competitor?.short_description;
  if (description) {
    addSection("Sobre a Empresa");
    addText(description);
  }

  // ==================== PRODUTOS ====================
  const products = company?.products_services || competitor?.products_services;
  if (products && (Array.isArray(products) ? products.length > 0 : products)) {
    addSection("Produtos e Serviços");
    if (Array.isArray(products)) {
      products.slice(0, 8).forEach((item: string) => addListItem(item));
    } else {
      addText(String(products));
    }
  }

  // ==================== DIFERENCIAIS ====================
  const differentiators = company?.differentiators || competitor?.differentiators;
  if (differentiators && (Array.isArray(differentiators) ? differentiators.length > 0 : differentiators)) {
    addSection("Diferenciais");
    if (Array.isArray(differentiators)) {
      differentiators.slice(0, 6).forEach((item: string) => addListItem(item));
    } else {
      addText(String(differentiators));
    }
  }

  // ==================== MERCADO ====================
  if (company?.market || company?.business_model) {
    addSection("Mercado e Modelo");
    if (company?.market) {
      addSubSection("Mercado Alvo");
      addText(company.market, 3);
    }
    if (company?.business_model) {
      addSubSection("Modelo de Negócio");
      addText(company.business_model, 3);
    }
  }

  // ==================== ESPECIALIDADES ====================
  const specialties = company?.linkedin_specialties || competitor?.linkedin_specialties;
  if (specialties && specialties.length > 0) {
    addSection("Especialidades");
    addText(specialties.filter((s: string) => s).join(" • "));
  }

  // ==================== LIDERANÇA ====================
  if (leadership && leadership.length > 0) {
    addSection("Liderança");
    leadership.slice(0, 5).forEach((leader: any) => {
      if (!leader.name) return;
      checkPage(16);
      
      // Card
      setFill(GRAY_BG);
      doc.roundedRect(margin, yPos - 2, contentWidth, 14, 2, 2, 'F');
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      setColor(TEXT_DARK);
      doc.text(leader.name, margin + 4, yPos + 4);
      
      if (leader.position) {
        doc.setFont("helvetica", "normal");
        setColor(TEXT_MUTED);
        doc.text(` - ${leader.position}`, margin + 4 + doc.getTextWidth(leader.name), yPos + 4);
      }
      
      if (leader.decision_level) {
        doc.setFontSize(7);
        setColor(ORANGE);
        doc.text(leader.decision_level, margin + 4, yPos + 9);
      }
      
      yPos += 17;
    });
  }

  // ==================== REDES SOCIAIS ====================
  const linkedinFollowers = company?.linkedin_followers || competitor?.linkedin_followers;
  const instagramFollowers = company?.instagram_followers || competitor?.instagram_followers;
  const youtubeSubscribers = company?.youtube_subscribers || competitor?.youtube_subscribers;
  
  if (linkedinFollowers || instagramFollowers || youtubeSubscribers) {
    addSection("Redes Sociais");
    
    // Cards visuais
    const cardW = (contentWidth - 10) / 3;
    let cardX = margin;
    
    if (linkedinFollowers) {
      drawSocialCard(cardX, yPos, cardW, "LinkedIn", linkedinFollowers.toLocaleString(), BLUE_LINKEDIN);
      cardX += cardW + 5;
    }
    if (instagramFollowers) {
      drawSocialCard(cardX, yPos, cardW, "Instagram", instagramFollowers.toLocaleString(), PINK_INSTAGRAM);
      cardX += cardW + 5;
    }
    if (youtubeSubscribers) {
      drawSocialCard(cardX, yPos, cardW, "YouTube", youtubeSubscribers.toLocaleString(), RED_YOUTUBE);
    }
    
    yPos += 30;
    
    // Detalhes extras
    const instaPosts = company?.instagram_posts_count || competitor?.instagram_posts_count;
    const ytVideos = company?.youtube_total_videos || competitor?.youtube_total_videos;
    const ytViews = company?.youtube_total_views || competitor?.youtube_total_views;
    
    if (instaPosts) addField("Posts Instagram", instaPosts.toLocaleString());
    if (ytVideos) addField("Vídeos YouTube", ytVideos.toLocaleString());
    if (ytViews) addField("Views YouTube", ytViews.toLocaleString());
  }

  // ==================== GLASSDOOR ====================
  if (glassdoor?.overall_rating) {
    addSection("Avaliação Glassdoor");
    
    // Card principal
    checkPage(45);
    setFill(ORANGE_LIGHT);
    setDraw(ORANGE);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, contentWidth, 28, 3, 3, 'FD');
    
    // Estrelas - centralizadas verticalmente
    drawStars(margin + 8, yPos + 14, glassdoor.overall_rating);
    
    // Métricas ao lado - mais espaçadas
    let mx = margin + 70;
    // Só mostrar se valor existe e é válido (>= 0)
    if (glassdoor.recommend_to_friend != null && glassdoor.recommend_to_friend >= 0) {
      const recommendValue = Math.round(glassdoor.recommend_to_friend * 100);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      setColor(ORANGE);
      doc.text(`${recommendValue}%`, mx, yPos + 12);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      setColor(TEXT_MUTED);
      doc.text("Recomendam", mx, yPos + 18);
      mx += 40;
    }
    // Só mostrar se valor existe e é válido (>= 0, não sendo -1 que indica sem dados)
    if (glassdoor.ceo_rating != null && glassdoor.ceo_rating >= 0) {
      const ceoValue = Math.round(glassdoor.ceo_rating * 100);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      setColor(ORANGE);
      doc.text(`${ceoValue}%`, mx, yPos + 12);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      setColor(TEXT_MUTED);
      doc.text("Aprovam CEO", mx, yPos + 18);
    }
    
    yPos += 36;
    
    // Barras de rating
    drawRatingBar("Equilíbrio Trabalho-Vida", glassdoor.work_life_balance_rating);
    drawRatingBar("Cultura e Valores", glassdoor.culture_values_rating);
    drawRatingBar("Oportunidades de Carreira", glassdoor.career_opportunities_rating);
    drawRatingBar("Compensação e Benefícios", glassdoor.compensation_benefits_rating);
    
    if (glassdoor.pros_example) {
      yPos += 3;
      addSubSection("Prós");
      addText(glassdoor.pros_example, 3);
    }
    if (glassdoor.cons_example) {
      addSubSection("Contras");
      addText(glassdoor.cons_example, 3);
    }
  }

  // ==================== NOTÍCIAS ====================
  if (marketNews && marketNews.length > 0) {
    addSection("Últimas Notícias");
    marketNews.slice(0, 4).forEach((news: any) => {
      if (!news.title) return;
      checkPage(12);
      addSubSection(news.title);
      if (news.date) {
        doc.setFontSize(7);
        setColor(TEXT_MUTED);
        doc.text(new Date(news.date).toLocaleDateString('pt-BR'), margin + 3, yPos);
        yPos += 4;
      }
      if (news.summary) addText(news.summary, 3);
    });
  }

  // ==================== POSICIONAMENTO ====================
  const hasMkt = marketResearch && (marketResearch.central_message || marketResearch.institutional_discourse);
  if (hasMkt) {
    addSection("Posicionamento");
    if (marketResearch.central_message) {
      addSubSection("Mensagem Central");
      addText(marketResearch.central_message, 3);
    }
    if (marketResearch.institutional_discourse) {
      addSubSection("Discurso Institucional");
      addText(marketResearch.institutional_discourse, 3);
    }
  }

  // ==================== SIMILARES ====================
  if (similarCompanies && similarCompanies.length > 0) {
    addSection("Empresas Similares");
    const unique = similarCompanies.reduce((acc: SimilarCompanyData[], curr) => {
      if (curr.name && !acc.find(c => c.name?.toLowerCase() === curr.name?.toLowerCase())) {
        acc.push(curr);
      }
      return acc;
    }, []);
    unique.slice(0, 6).forEach((comp) => {
      let text = comp.name || '';
      if (comp.industry) text += ` - ${comp.industry}`;
      addListItem(text);
    });
  }

  // ==================== ANÁLISE GERAL ====================
  const analysis = competitor?.payload_json?.overview?.overall_analysis || marketResearch?.overall_analysis;
  if (analysis) {
    addSection("Análise Geral");
    addText(analysis);
  }

  // ==================== RODAPÉ ====================
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    setColor(TEXT_MUTED);
    doc.text(
      `${companyName} | Gerado em ${new Date().toLocaleDateString('pt-BR')} | Página ${i}/${totalPages}`,
      pageWidth / 2, 292,
      { align: 'center' }
    );
  }

  // Salvar
  const fileName = `relatorio_${companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
  doc.save(fileName);
}
