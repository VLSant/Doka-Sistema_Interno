# Contract: Parser and Validation

## Accepted Files

| Format | Extension | Accepted MIME types | Maximum |
| --- | --- | --- | --- |
| CSV | `.csv` | `text/csv`, `application/csv`, `application/vnd.ms-excel` | 25 MiB |
| XLSX | `.xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | 25 MiB |

Extension, MIME and actual parse result must agree. An extension alone never
makes a file valid. Empty, encrypted, corrupted or legacy `.xls` content is
rejected.

## Parsing Rules

### CSV

- Parse local `File` with Papa Parse in worker mode.
- Use `header: false` to preserve the exact header row and detect duplicates.
- Use `dynamicTyping: false`; no trimming or value transformation is applied.
- Auto-detect delimiter among comma, semicolon, tab and pipe.
- Preserve quoted delimiters, escapes and line numbers.
- Ignore only fully empty leading/trailing rows; a non-empty malformed row is
  retained and classified.
- Duplicate headers after header normalization are blocking.

### XLSX

- Read with `read-excel-file/browser` and `trim: false`.
- Inspect all sheets.
- Exactly one non-empty logical table is accepted.
- A password-protected/corrupted workbook or unsupported formula-only required
  value is blocking.
- Preserve source row numbers and cell values in a deterministic JSON-safe
  representation.
- Leading/trailing fully empty rows may be ignored; non-empty malformed rows are
  retained.

## Header Rules

Header matching may normalize Unicode, trim outer whitespace and compare without
case/diacritic differences. This is only schema matching; original header text
remains the key in `raw_json`.

Required canonical headers:

- `Data`
- `Área de Trabalho`
- `Número da Assistência`
- `Parte do Conjunto`
- `Tipo de Atividade`
- `Status da Atividade`

Known complementary headers:

- `Recurso` or `Recurso / Montador`
- `Cliente`
- `Endereço`
- `Código da Mercadoria`
- `Descrição da Mercadoria`
- `Deslocamento`
- `Valor a receber pelo móvel`
- `Atendimento Crítico`
- `Quantidade de Reagendamento`
- `Comentários sobre o local da montagem`
- `Observação de finalização da montagem`
- `Defeito Identificado`
- `Laudo ou Observação`

Unknown columns are allowed and remain only in `raw_json`. Two original headers
that map to the same canonical header are a blocking ambiguity.

## File-Level Rules

- Exactly one non-empty Área de Trabalho value must exist.
- Exactly one valid operational date must exist.
- Name equivalence for postos is forbidden. Matching may ignore only Unicode
  composition, surrounding whitespace and case.
- The resolved posto must exist, be active and be in the actor scope.
- The file must contain at least one non-empty data row.
- Every non-empty row must reach a final validation state.
- The received row count must equal `total_linhas_esperadas`.

## Date Rules

- XLSX date cells are accepted when the parser identifies a valid date.
- CSV/text dates accept the approved MMS representation `dd/MM/yyyy`; ISO
  `yyyy-MM-dd` is accepted for deterministic fixtures/exports.
- Time components are discarded only after verifying all rows resolve to the
  same calendar date.
- Filename is never used as the authoritative date.

## Identity Normalization

`numero_assistencia` and `parte_conjunto`:

- preserve original value in `raw_json`;
- trim surrounding whitespace for candidates;
- normalize Unicode and case for identity comparison;
- reject empty result;
- do not remove meaningful internal punctuation or invent a missing part.

Duplicate complete keys inside one file are blocking unless the repeated rows
are byte-for-byte equivalent after JSON-safe parsing. Equivalent repeats are
still represented once in staging and reported as a structural warning; a
different payload for the same key is an error.

## Activity Status Mapping

| Original normalized for comparison | Canonical |
| --- | --- |
| `pendente` | `pendente` |
| `iniciado` | `iniciado` |
| `concluído` / `concluido` | `concluido` |
| `não concluído` / `nao concluido` | `nao_concluido` |
| `cancelado` | `cancelado` |

Missing or unknown values are blocking. `frustrada`, `improdutiva` and
`devolução` are not invented as separate imported statuses.

## Activity Type Mapping

| Original | Canonical |
| --- | --- |
| Montagem em Conjunto | `montagem` |
| Desmontagem | `desmontagem` |
| Assistência Técnica | `assistencia` |
| Inspeção Presencial | `inspecao` |
| Retorno de Garantia | `retorno` |

Missing or unknown values are blocking.

## Line Classification

- `valida`: all required values valid, no active warning/error.
- `valida_com_alerta`: all required values valid, at least one non-blocking
  warning and no error.
- `invalida`: at least one blocking error.
- `pendente`: transient state only while server validation is incomplete.
- `ignorada`: not produced for a non-empty Spec 006 data row; its presence makes
  the lot incomplete.

## Trust Boundary

Client parsing is provisional. Server RPCs:

1. accept only row number and `raw_json`;
2. resolve headers and canonical values again;
3. derive candidate columns and `json_normalizado`;
4. create error/warning records;
5. derive line and lot states.

The original file is the durable byte-level evidence. No `file_hash` or claim of
cryptographic equivalence between file and rows is introduced in the MVP.

## Required Tests

- CSV comma/semicolon, quotes, BOM, accents and malformed rows.
- XLSX valid, encrypted/corrupt, multiple non-empty sheets and typed date.
- Missing/duplicate required header.
- Multiple dates/areas.
- Unknown posto and posto outside scope.
- Every status/type mapping and unknown value.
- Multiple parts for one assistance.
- Duplicate equivalent and conflicting complete keys.
- `raw_json` retains original headers/values while `json_normalizado` is
  canonical.
- 10.000-row responsiveness and totals.
