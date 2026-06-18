/* Mock data for the Doka Operations Dashboard UI kit. */
window.DOKA_DATA = (function () {
  const shipments = [
    { id: 'DK-8847-2291-BR', customer: 'Mercado Verde', origin: 'Curitiba · CWB', dest: 'São Paulo · GRU', status: 'transit', driver: 'Marina Alves', eta: 'Today 15:30', weight: '12.4 kg', priority: true, progress: 2 },
    { id: 'DK-8846-7714-BR', customer: 'TechNova Ltda', origin: 'Curitiba · CWB', dest: 'Joinville · JOI', status: 'out', driver: 'João Pedro', eta: 'Today 13:10', weight: '3.1 kg', priority: false, progress: 2 },
    { id: 'DK-8845-3398-BR', customer: 'Casa & Cia', origin: 'São Paulo · GRU', dest: 'Campinas · VCP', status: 'delivered', driver: 'Rafael Souza', eta: 'Delivered 11:42', weight: '8.0 kg', priority: false, progress: 3 },
    { id: 'DK-8844-1102-BR', customer: 'Farma Direta', origin: 'Belo Horizonte · CNF', dest: 'Uberlândia · UDI', status: 'delayed', driver: 'Beatriz Lima', eta: 'Delayed · +35 min', weight: '1.2 kg', priority: true, progress: 1 },
    { id: 'DK-8843-9920-BR', customer: 'Verde Hortifruti', origin: 'Curitiba · CWB', dest: 'Londrina · LDB', status: 'exception', driver: 'Carlos Dias', eta: 'Address issue', weight: '22.7 kg', priority: false, progress: 1 },
    { id: 'DK-8842-4471-BR', customer: 'Studio Marília', origin: 'São Paulo · GRU', dest: 'Santos · SSZ', status: 'transit', driver: 'Marina Alves', eta: 'Today 16:45', weight: '5.5 kg', priority: false, progress: 2 },
    { id: 'DK-8841-7783-BR', customer: 'Loja do Pedro', origin: 'Curitiba · CWB', dest: 'Curitiba · CWB', status: 'pending', driver: 'Unassigned', eta: 'Awaiting pickup', weight: '0.9 kg', priority: false, progress: 0 },
    { id: 'DK-8840-2266-BR', customer: 'Atacadão Sul', origin: 'Porto Alegre · POA', dest: 'Caxias · CXJ', status: 'delivered', driver: 'Rafael Souza', eta: 'Delivered 09:15', weight: '48.2 kg', priority: false, progress: 3 },
  ];
  const volume = [
    { d: 'Mon', v: 820 }, { d: 'Tue', v: 932 }, { d: 'Wed', v: 901 },
    { d: 'Thu', v: 1290 }, { d: 'Fri', v: 1330 }, { d: 'Sat', v: 1120 }, { d: 'Sun', v: 690 },
  ];
  return { shipments, volume };
})();
