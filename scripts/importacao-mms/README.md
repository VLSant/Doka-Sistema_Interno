# Scripts de Importação MMS

Esta pasta deve conter scripts auxiliares para leitura, validação e testes da importação MMS.

## Responsabilidades

- ler arquivos CSV/XLSX;
- normalizar campos;
- validar campos obrigatórios;
- preservar raw_json;
- gerar normalized_json;
- simular criação/atualização de assistências;
- identificar registros ausentes para status Removido;
- gerar erros e alertas.

## Campos obrigatórios

- Data;
- Área de Trabalho;
- Número da Assistência;
- Parte do Conjunto, quando existir;
- Tipo de Atividade;
- Status da Atividade.

## Mapeamento de tipo de atividade

- Montagem em Conjunto = Montagem;
- Desmontagem = Desmontagem;
- Assistência Técnica = Assistência;
- Inspeção Presencial = Inspeção;
- Retorno de Garantia = Retorno.

## Mapeamento de status

- pendente;
- iniciado;
- concluído;
- não concluído;
- cancelado.
