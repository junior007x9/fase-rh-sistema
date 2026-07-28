// Arquivo: db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 1. Cargos e Lotações
export const cargos = sqliteTable('cargos', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull().unique(),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
});

export const lotacoes = sqliteTable('lotacoes', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull().unique(),
  sigla: text('sigla').notNull(),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
});

// 2. Servidores (Informação Institucional)
export const servidores = sqliteTable('servidores', {
  id: text('id').primaryKey(),
  vinculo: text('vinculo', { enum: ['EFETIVO', 'CONTRATADO', 'COMISSIONADO', 'ESTAGIARIO'] }).notNull(),
  dataAdmissao: text('data_admissao').notNull(),
  dataDesligamento: text('data_desligamento'), 
  motivoDesligamento: text('motivo_desligamento'),
  numeroProcessoDesligamento: text('numero_processo_desligamento'),
  status: text('status', { enum: ['ATIVO', 'DESLIGADO', 'AFASTADO'] }).default('ATIVO').notNull(),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
  atualizadoEm: text('atualizado_em').default(sql`CURRENT_TIMESTAMP`),
});

// 3. Dados Pessoais e Diversidade
export const dadosPessoais = sqliteTable('dados_pessoais', {
  servidorId: text('servidor_id').primaryKey().references(() => servidores.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  nomeSocial: text('nome_social'),
  dataNascimento: text('data_nascimento').notNull(),
  tipoSanguineo: text('tipo_sanguineo'),
  grupoEtnico: text('grupo_etnico').notNull(),
  estadoCivil: text('estado_civil').notNull(),
  genero: text('genero').notNull(),
  orientacaoSexual: text('orientacao_sexual').notNull(),
  email: text('email').notNull().unique(),
  telefone: text('telefone').notNull(),
});

// 4. Documentos
export const documentos = sqliteTable('documentos', {
  servidorId: text('servidor_id').primaryKey().references(() => servidores.id, { onDelete: 'cascade' }),
  cpf: text('cpf').notNull().unique(),
  rg: text('rg').notNull().unique(),
  tituloEleitoral: text('titulo_eleitoral').notNull().unique(),
  pisPasep: text('pis_pasep'),
});

// 5. Endereços
export const enderecos = sqliteTable('enderecos', {
  id: text('id').primaryKey(),
  servidorId: text('servidor_id').notNull().references(() => servidores.id, { onDelete: 'cascade' }),
  logradouro: text('logradouro').notNull(),
  numero: text('numero').notNull(),
  complemento: text('complemento'),
  bairro: text('bairro').notNull(),
  cidade: text('cidade').notNull(),
  estado: text('estado').default('MA').notNull(),
  cep: text('cep').notNull(),
});

// 6. Dados Bancários
export const dadosBancarios = sqliteTable('dados_bancarios', {
  id: text('id').primaryKey(),
  servidorId: text('servidor_id').notNull().unique().references(() => servidores.id, { onDelete: 'cascade' }),
  banco: text('banco').notNull(),
  agencia: text('agencia').notNull(),
  conta: text('conta').notNull(),
  nomeTitular: text('nome_titular').notNull(),
});

// 7. Contatos de Emergência
export const contatosEmergencia = sqliteTable('contatos_emergencia', {
  id: text('id').primaryKey(),
  servidorId: text('servidor_id').notNull().references(() => servidores.id, { onDelete: 'cascade' }),
  nomeContato: text('nome_contato').notNull(),
  parentesco: text('parentesco').notNull(),
  telefone: text('telefone').notNull(),
});

// 8. Dependentes e Pensionistas
export const dependentesPensionistas = sqliteTable('dependentes_pensionistas', {
  id: text('id').primaryKey(),
  servidorId: text('servidor_id').notNull().references(() => servidores.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  tipo: text('tipo', { enum: ['DEPENDENTE', 'PENSIONISTA'] }).notNull(),
  parentesco: text('parentesco').notNull(),
  documentoReferencia: text('documento_referencia'), 
});

// 9. Histórico Funcional (Registro de alteração de cargo/lotação e tempo de casa)
export const historicoFuncional = sqliteTable('historico_funcional', {
  id: text('id').primaryKey(),
  servidorId: text('servidor_id').notNull().references(() => servidores.id, { onDelete: 'cascade' }),
  cargoId: text('cargo_id').notNull().references(() => cargos.id),
  lotacaoId: text('lotacao_id').notNull().references(() => lotacoes.id),
  dataInicio: text('data_inicio').notNull(),
  dataFim: text('data_fim'), 
  observacao: text('observacao'),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
});

// 10. Períodos Aquisitivos de Férias
export const periodosAquisitivos = sqliteTable('periodos_aquisitivos', {
  id: text('id').primaryKey(),
  servidorId: text('servidor_id').notNull().references(() => servidores.id, { onDelete: 'cascade' }),
  dataInicio: text('data_inicio').notNull(),
  dataFim: text('data_fim').notNull(),
  status: text('status', { enum: ['PENDENTE', 'GOZADO', 'PARCIAL'] }).default('PENDENTE').notNull(),
  diasRestantes: integer('dias_restantes').default(30).notNull(),
});

// 11. Eventos de Ausência (Férias, Licenças, Saúde)
export const eventosAusencia = sqliteTable('eventos_ausencia', {
  id: text('id').primaryKey(),
  servidorId: text('servidor_id').notNull().references(() => servidores.id, { onDelete: 'cascade' }),
  periodoAquisitivoId: text('periodo_aquisitivo_id').references(() => periodosAquisitivos.id),
  tipoAusencia: text('tipo_ausencia', { enum: ['FERIAS', 'LICENCA_MATERNIDADE', 'SAUDE', 'LICENCA_PREMIO', 'AFASTAMENTO_SUPERIOR_15'] }).notNull(),
  dataInicio: text('data_inicio').notNull(),
  dataFim: text('data_fim').notNull(),
  observacao: text('observacao'),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
});

// 12. Recrutamento
export const candidatos = sqliteTable('candidatos', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  cpf: text('cpf').notNull().unique(),
  email: text('email').notNull().unique(),
  telefone: text('telefone').notNull(),
  qualificacaoCurriculo: text('qualificacao_curriculo'),
  areaAdaptacaoSugerida: text('area_adaptacao_sugerida'),
  status: text('status', { enum: ['RESERVA', 'CONVOCADO', 'REJEITADO'] }).default('RESERVA').notNull(),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
  atualizadoEm: text('atualizado_em').default(sql`CURRENT_TIMESTAMP`),
});