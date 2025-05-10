export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  nivelAcesso?: string;
  plano?: string;
  valorPlano?: number;
  idAssinatura?: string;
  idCustomer?: string;
  cupomDesconto?: string;
  cpfOuCnpj?: string;
  status?: string;
  markupIdeal?: number;
  confeitarias?: IConfeitaria[];
  confeitaria?: IConfeitaria;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConfeitaria {
  id: number;
  nome: string;
  usuario?: IUser;
  endereco?: string;
  logo?: string;
  horarioFuncionamento?: string;
  horasTrabalhoDiarias?: number;
  quantidadeFuncionarios?: number;
  folhaPagamentoTotal?: number;
  faturamentoMedio?: number;
  faturamentoDesejado?: number;
  regimeTributario?: string;
  porcentagemImposto?: number;
  custosFixos?: number;
  proLabore?: number;
  diasTrabalhadosMes?: number;
  pagaComissao?: boolean;
  porcentagemComissao?: number;
  taxaMaquininha?: number;
  porcentagemLucroDesejado?: number;
  markupIdeal?: number;
  user?: IUser;
  createdAt: Date;
  updatedAt: Date;
} 