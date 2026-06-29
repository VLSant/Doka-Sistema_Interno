$ErrorActionPreference = "Stop"
$fixtureDir = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\tests\fixtures\mms"))
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

$headers = @(
  "Data",
  "$([char]0x00C1)rea de Trabalho",
  "N$([char]0x00FA)mero da Assist$([char]0x00EA)ncia",
  "Parte do Conjunto",
  "Tipo de Atividade",
  "Status da Atividade",
  "Cliente"
)

function Add-MmsSheet {
  param(
    [Parameter(Mandatory)] $Workbook,
    [Parameter(Mandatory)] [string] $Name,
    [Parameter(Mandatory)] [object[][]] $Rows,
    $Sheet
  )
  if ($null -eq $Sheet) {
    $sheet = $Workbook.Worksheets.Add()
  }
  $sheet.Name = $Name
  for ($column = 0; $column -lt $headers.Count; $column++) {
    $sheet.Cells.Item(1, $column + 1) = $headers[$column]
  }
  for ($row = 0; $row -lt $Rows.Count; $row++) {
    for ($column = 0; $column -lt $Rows[$row].Count; $column++) {
      $sheet.Cells.Item($row + 2, $column + 1) = $Rows[$row][$column]
    }
  }
  return $sheet
}

function Save-MmsWorkbook {
  param(
    [Parameter(Mandatory)] [string] $FileName,
    [Parameter(Mandatory)] [object[][]] $Rows,
    [switch] $SecondSheet,
    [switch] $Password
  )
  $book = $excel.Workbooks.Add()
  try {
    while ($book.Worksheets.Count -gt 1) {
      $book.Worksheets.Item($book.Worksheets.Count).Delete()
    }
    [void](Add-MmsSheet -Workbook $book -Name "MMS" -Rows $Rows -Sheet $book.Worksheets.Item(1))
    if ($SecondSheet) {
      [void](Add-MmsSheet -Workbook $book -Name "Outra tabela" -Rows $Rows)
    }
    $path = Join-Path $fixtureDir $FileName
    if ($Password) {
      $book.SaveAs($path, 51, "doka-test")
    } else {
      $book.SaveAs($path, 51)
    }
  } finally {
    $book.Close($false)
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($book)
  }
}

function Save-PerformanceFixtures {
  $csvPath = Join-Path $fixtureDir "performance-10000.csv"
  $builder = [Text.StringBuilder]::new()
  [void]$builder.AppendLine(($headers -join ";"))
  for ($index = 1; $index -le 10000; $index++) {
    [void]$builder.AppendLine("27/06/2026;Posto A;AST-$($index.ToString('D5'));PARTE-A;Montagem em Conjunto;Concluido;Cliente $index")
  }
  [IO.File]::WriteAllText($csvPath, $builder.ToString(), [Text.UTF8Encoding]::new($true))

  $book = $excel.Workbooks.Add()
  try {
    while ($book.Worksheets.Count -gt 1) {
      $book.Worksheets.Item($book.Worksheets.Count).Delete()
    }
    $sheet = $book.Worksheets.Item(1)
    $sheet.Name = "MMS"
    $values = New-Object 'object[,]' 10001, 7
    for ($column = 0; $column -lt 7; $column++) { $values[0, $column] = $headers[$column] }
    for ($row = 1; $row -le 10000; $row++) {
      $values[$row, 0] = "27/06/2026"
      $values[$row, 1] = "Posto A"
      $values[$row, 2] = "AST-$($row.ToString('D5'))"
      $values[$row, 3] = "PARTE-A"
      $values[$row, 4] = "Montagem em Conjunto"
      $values[$row, 5] = "Concluido"
      $values[$row, 6] = "Cliente $row"
    }
    $sheet.Range("A1", "G10001").Value2 = $values
    $book.SaveAs((Join-Path $fixtureDir "performance-10000.xlsx"), 51)
  } finally {
    $book.Close($false)
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($book)
  }
}

try {
  $validRows = ,@("27/06/2026", "Posto A", "AST-001", "PARTE-A", "Montagem em Conjunto", "Conclu$([char]0x00ED)do", "Cliente A")
  $partsRows = @(
    @("27/06/2026", "Posto A", "AST-001", "PARTE-A", "Montagem em Conjunto", "Conclu$([char]0x00ED)do", "Cliente A"),
    @("27/06/2026", "Posto A", "AST-001", "PARTE-B", "Montagem em Conjunto", "Iniciado", "Cliente A")
  )
  Save-MmsWorkbook -FileName "valido.xlsx" -Rows $validRows
  Save-MmsWorkbook -FileName "multiplas-partes.xlsx" -Rows $partsRows
  Save-MmsWorkbook -FileName "multiplas-planilhas.xlsx" -Rows $validRows -SecondSheet
  Save-MmsWorkbook -FileName "protegido.xlsx" -Rows $validRows -Password
  Save-PerformanceFixtures
} finally {
  $excel.Quit()
  [void][Runtime.InteropServices.Marshal]::ReleaseComObject($excel)
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
