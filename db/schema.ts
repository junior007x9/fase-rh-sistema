// Arquivo: db/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
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

// Arquivo: db/schema.ts (Exemplo da tabela servidores)
export const servidores = sqliteTable('servidores', {
  id: text('id').primaryKey(),
  matricula: text('matricula'),
  cargo: text('cargo'), // <-- ADICIONE ESTA LINHA
  lotacao: text('lotacao'), // <-- ADICIONE ESTA LINHA
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
});

// 3. Dados Pessoais
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

// 4. Documentos
export const documentos = sqliteTable('documentos', {
  servidorId: text('servidor_id').primaryKey().references(() => servidores.id, { onDelete: 'cascade' }),
  cpf: text('cpf').unique(),
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

// 9. Histórico Funcional
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

// 11. Eventos de Ausência
export const eventosAusencia = sqliteTable("eventos_ausencia", {
  id: text("id").primaryKey(), // No SQLite, UUIDs são salvos como text
  servidorId: text("servidor_id").references(() => servidores.id),
  tipoAusencia: text("tipo_ausencia").notNull(),
  dataInicio: text("data_inicio").notNull(),
  dataFim: text("data_fim").notNull(),
  dias: integer("dias"), // <--- NOSSO CAMPO NOVO
  cid: text("cid"),      // <--- NOSSO CAMPO NOVO
  observacao: text("observacao"),
  periodoAquisitivoId: text("periodo_aquisitivo_id"),
  criadoEm: integer("criado_em", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// 12. Recrutamento (Agora limpo e com segurança)
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
});

// 13. USUÁRIOS DO SISTEMA
export const usuarios = sqliteTable('usuarios', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  email: text('email').notNull().unique(),
  senha: text('senha').notNull(),
  role: text('role', { enum: ['RH', 'DIRETORIA'] }).default('RH').notNull(),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
});
// ==========================================
// 14. AUDITORIA E LOGS DO SISTEMA (Acesso Restrito)
// ==========================================
export const auditoriaLogs = sqliteTable('auditoria_logs', {
  id: text('id').primaryKey(),
  usuarioEmail: text('usuario_email').notNull(),
  acao: text('acao', { enum: ['CRIAR', 'EDITAR', 'EXCLUIR'] }).notNull(),
  tabelaAfetada: text('tabela_afetada').notNull(),
  registroId: text('registro_id').notNull(),
  detalhes: text('detalhes'), // O que mudou (pode salvar JSON aqui)
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
});
// Adicione no final do arquivo db/schema.ts

// ==========================================
// MÓDULO: HISTÓRICO DE TRANSFERÊNCIAS
// ==========================================
export const historicoTransferencias = sqliteTable('historico_transferencias', {
  id: text('id').primaryKey(),
  servidorId: text('servidor_id').notNull().references(() => servidores.id),
  lotacaoAnterior: text('lotacao_anterior'), // De onde ele saiu
  lotacaoNova: text('lotacao_nova').notNull(), // Para onde ele foi
  dataOcorrencia: text('data_ocorrencia').notNull(), // Data exata da mudança
  motivo: text('motivo'),
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
});

// ==========================================
// MÓDULO: FOLHA DE PAGAMENTO (LANÇAMENTOS)
// ==========================================
export const lancamentosFolha = sqliteTable('lancamentos_folha', {
  id: text('id').primaryKey(),
  servidorId: text('servidor_id').notNull().references(() => servidores.id),
  mesAno: text('mes_ano').notNull(), // Ex: "07-2026"
  codigoEvento: text('codigo_evento').notNull(), // Ex: D001, P001
  descricaoEvento: text('descricao_evento').notNull(), // Ex: "Falta", "DSR"
  tipo: text('tipo', { enum: ['PROVENTO', 'DESCONTO'] }).notNull(),
  quantidadeReferencia: real('quantidade_referencia'), // Ex: 2 (para 2 dias de falta)
  valorFinal: real('valor_final').notNull(), // O valor em R$ calculado ou digitado
  criadoEm: text('criado_em').default(sql`CURRENT_TIMESTAMP`),
});