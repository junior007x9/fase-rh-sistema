// Arquivo: db/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ==========================================
// 1. CARGOS E LOTAÇÕES
// ==========================================
export const cargos = sqliteTable('cargos', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull().unique(),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
  excluidoEm: text('excluido_em'), // <-- SOFT DELETE
});

export const lotacoes = sqliteTable('lotacoes', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull().unique(),
  sigla: text('sigla').notNull(),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
  excluidoEm: text('excluido_em'), // <-- SOFT DELETE
});

// ==========================================
// 2. SERVIDORES
// ==========================================
export const servidores = sqliteTable('servidores', {
  id: text('id').primaryKey(),
  matricula: text('matricula'),
  cargo: text('cargo'),
  lotacao: text('lotacao'),
  funcao: text('funcao'), 
  jornada: text('jornada'),
  remuneracaoBase: real('remuneracao_base'),
  vinculo: text('vinculo', { enum: ['EFETIVO', 'CONTRATADO', 'COMISSIONADO', 'ESTAGIARIO'] }).notNull(),
  dataAdmissao: text('data_admissao').notNull(),
  dataDesligamento: text('data_desligamento'), 
  motivoDesligamento: text('motivo_desligamento'),
  numeroProcessoDesligamento: text('numero_processo_desligamento'),
  status: text('status', { enum: ['ATIVO', 'DESLIGADO', 'AFASTADO'] }).default('ATIVO').notNull(),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
  atualizadoEm: text('atualizado_em').default(sql`CURRENT_TIMESTAMP`),
  excluidoEm: text('excluido_em'), // <-- SOFT DELETE
});

// ==========================================
// 3. DADOS PESSOAIS
// ==========================================
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
  email: text('email').unique(),
  telefone: text('telefone').notNull(),
});

// ==========================================
// 4. DOCUMENTOS
// ==========================================
export const documentos = sqliteTable('documentos', {
  servidorId: text('servidor_id').primaryKey().references(() => servidores.id, { onDelete: 'cascade' }),
  cpf: text('cpf').unique(),
  rg: text('rg').notNull().unique(),
  tituloEleitoral: text('titulo_eleitoral').notNull().unique(),
  pisPasep: text('pis_pasep'),
});

// ==========================================
// 5. ENDEREÇOS
// ==========================================
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

// ==========================================
// 6. DADOS BANCÁRIOS
// ==========================================
export const dadosBancarios = sqliteTable('dados_bancarios', {
  id: text('id').primaryKey(),
  servidorId: text('servidor_id').notNull().unique().references(() => servidores.id, { onDelete: 'cascade' }),
  banco: text('banco').notNull(),
  agencia: text('agencia').notNull(),
  conta: text('conta').notNull(),
  nomeTitular: text('nome_titular').notNull(),
});

// ==========================================
// 7. CONTATOS DE EMERGÊNCIA
// ==========================================
export const contatosEmergencia = sqliteTable('contatos_emergencia', {
  id: text('id').primaryKey(),
  servidorId: text('servidor_id').notNull().references(() => servidores.id, { onDelete: 'cascade' }),
  nomeContato: text('nome_contato').notNull(),
  parentesco: text('parentesco').notNull(),
  telefone: text('telefone').notNull(),
});

// ==========================================
// 8. DEPENDENTES E PENSIONISTAS
// ==========================================
export const dependentesPensionistas = sqliteTable('dependentes_pensionistas', {
  id: text('id').primaryKey(),
  servidorId: text('servidor_id').notNull().references(() => servidores.id, { onDelete: 'cascade' }),
  nome: text('nome').notNull(),
  tipo: text('tipo', { enum: ['DEPENDENTE', 'PENSIONISTA'] }).notNull(),
  parentesco: text('parentesco').notNull(),
  documentoReferencia: text('documento_referencia'), 
  excluidoEm: text('excluido_em'), // <-- SOFT DELETE
});

// ==========================================
// 9. HISTÓRICO FUNCIONAL
// ==========================================
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

// ==========================================
// 10. PERÍODOS AQUISITIVOS DE FÉRIAS
// ==========================================
export const periodosAquisitivos = sqliteTable('periodos_aquisitivos', {
  id: text('id').primaryKey(),
  servidorId: text('servidor_id').notNull().references(() => servidores.id, { onDelete: 'cascade' }),
  dataInicio: text('data_inicio').notNull(),
  dataFim: text('data_fim').notNull(),
  status: text('status', { enum: ['PENDENTE', 'GOZADO', 'PARCIAL'] }).default('PENDENTE').notNull(),
  diasRestantes: integer('dias_restantes').default(30).notNull(),
  excluidoEm: text('excluido_em'), // <-- SOFT DELETE
});

// ==========================================
// 11. EVENTOS DE AUSÊNCIA
// ==========================================
export const eventosAusencia = sqliteTable("eventos_ausencia", {
  id: text("id").primaryKey(), 
  servidorId: text("servidor_id").references(() => servidores.id),
  tipoAusencia: text("tipo_ausencia").notNull(),
  dataInicio: text("data_inicio").notNull(),
  dataFim: text("data_fim").notNull(),
  dias: integer("dias"),
  cid: text("cid"),      
  observacao: text("observacao"),
  periodoAquisitivoId: text("periodo_aquisitivo_id"),
  criadoEm: integer("criado_em", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  excluidoEm: text('excluido_em'), // <-- SOFT DELETE
});

// ==========================================
// 12. RECRUTAMENTO E SELEÇÃO
// ==========================================
export const candidatos = sqliteTable('candidatos', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  cpf: text('cpf').notNull().unique(),
  email: text('email'),
  telefone: text('telefone').notNull(),
  qualificacaoCurriculo: text('qualificacao_curriculo'),
  areaAdaptacaoSugerida: text('area_adaptacao_sugerida'),
  status: text('status', { enum: ['RESERVA', 'CONVOCADO', 'REJEITADO'] }).default('RESERVA').notNull(),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
  atualizadoEm: text('atualizado_em').default(sql`CURRENT_TIMESTAMP`),
  excluidoEm: text('excluido_em'), // <-- SOFT DELETE
});

// ==========================================
// 13. USUÁRIOS DO SISTEMA
// ==========================================
export const usuarios = sqliteTable('usuarios', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  senha: text('senha').notNull(),
  role: text('role', { enum: ['RH', 'DIRETORIA'] }).default('RH').notNull(),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
  excluidoEm: text('excluido_em'), // <-- SOFT DELETE
});

// ==========================================
// 14. AUDITORIA E LOGS DO SISTEMA
// ==========================================
export const auditoriaLogs = sqliteTable('auditoria_logs', {
  id: text('id').primaryKey(),
  usuarioEmail: text('usuario_email').notNull(),
  acao: text('acao', { enum: ['CRIAR', 'EDITAR', 'EXCLUIR'] }).notNull(),
  tabelaAfetada: text('tabela_afetada').notNull(),
  registroId: text('registro_id').notNull(),
  detalhes: text('detalhes'),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
});

// ==========================================
// 15. HISTÓRICO DE TRANSFERÊNCIAS
// ==========================================
export const historicoTransferencias = sqliteTable('historico_transferencias', {
  id: text('id').primaryKey(),
  servidorId: text('servidor_id').notNull().references(() => servidores.id),
  lotacaoAnterior: text('lotacao_anterior'), 
  lotacaoNova: text('lotacao_nova').notNull(), 
  dataOcorrencia: text('data_ocorrencia').notNull(), 
  motivo: text('motivo'),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
  excluidoEm: text('excluido_em'), // <-- SOFT DELETE
});

// ==========================================
// 16. FOLHA DE PAGAMENTO (LANÇAMENTOS)
// ==========================================
export const lancamentosFolha = sqliteTable('lancamentos_folha', {
  id: text('id').primaryKey(),
  servidorId: text('servidor_id').notNull().references(() => servidores.id),
  mesAno: text('mes_ano').notNull(), 
  codigoEvento: text('codigo_evento').notNull(), 
  descricaoEvento: text('descricao_evento').notNull(), 
  tipo: text('tipo', { enum: ['PROVENTO', 'DESCONTO'] }).notNull(),
  quantidadeReferencia: real('quantidade_referencia'), 
  valorFinal: real('valor_final').notNull(),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
  excluidoEm: text('excluido_em'), // <-- SOFT DELETE
});