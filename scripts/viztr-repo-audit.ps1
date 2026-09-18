[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [string]$Root = (Get-Location).Path,

    [string]$ReportPath
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

$Root = [System.IO.Path]::GetFullPath($Root)
if (-not (Test-Path -LiteralPath $Root -PathType Container)) {
    throw "Repo root not found: $Root"
}

if ([string]::IsNullOrWhiteSpace($ReportPath)) {
    $ReportPath = Join-Path $Root 'viztr-repo-audit-report.md'
}
$ReportPath = [System.IO.Path]::GetFullPath($ReportPath)

$TargetNames = @(
    'editor',
    'editor-src',
    'supersplat',
    'supersplat-viewer',
    'engine',
    'observer',
    'pcui',
    'pcui-graph',
    'developer-site'
)

$GeneratedDirectoryNames = @(
    'node_modules',
    '.git',
    '.next',
    'coverage',
    'test-results',
    'playwright-report',
    'logs',
    'build',
    'dist',
    '.docusaurus'
)

$SourceExtensions = @('.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.mts', '.cts')

function Get-NormalizedFullPath {
    param([string]$Path)

    $fullPath = [System.IO.Path]::GetFullPath($Path)
    return $fullPath.TrimEnd([char[]]@([System.IO.Path]::DirectorySeparatorChar, [System.IO.Path]::AltDirectorySeparatorChar))
}

function Get-RelativePath {
    param(
        [string]$Path,
        [string]$BasePath
    )

    $fullPath = Get-NormalizedFullPath -Path $Path
    $fullBase = Get-NormalizedFullPath -Path $BasePath

    if ($fullPath -ieq $fullBase) {
        return '.'
    }

    $prefix = $fullBase + [System.IO.Path]::DirectorySeparatorChar
    if ($fullPath.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        return ($fullPath.Substring($prefix.Length) -replace '\\', '/')
    }

    return ($fullPath -replace '\\', '/')
}

function Test-PathUnder {
    param(
        [string]$Path,
        [string]$ParentPath
    )

    $fullPath = Get-NormalizedFullPath -Path $Path
    $fullParent = Get-NormalizedFullPath -Path $ParentPath

    if ($fullPath -ieq $fullParent) {
        return $true
    }

    $prefix = $fullParent + [System.IO.Path]::DirectorySeparatorChar
    return $fullPath.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase)
}

function Test-IsExcludedPath {
    param([string]$Path)

    $relativePath = Get-RelativePath -Path $Path -BasePath $Root
    $parts = $relativePath -split '/'

    foreach ($directoryName in $GeneratedDirectoryNames) {
        if ($parts -contains $directoryName) {
            return $true
        }
    }

    foreach ($target in $TargetSpecs) {
        if ($target.Exists -and (Test-PathUnder -Path $Path -ParentPath $target.FullPath)) {
            return $true
        }
    }

    return $false
}

function Get-RepoFiles {
    param([string[]]$Extensions)

    $stack = New-Object System.Collections.Stack
    $stack.Push($Root)

    while ($stack.Count -gt 0) {
        $directory = [string]$stack.Pop()
        $items = Get-ChildItem -LiteralPath $directory -Force -ErrorAction SilentlyContinue

        foreach ($item in $items) {
            if ($item.PSIsContainer) {
                if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
                    continue
                }

                if (Test-IsExcludedPath -Path $item.FullName) {
                    continue
                }

                $stack.Push($item.FullName)
                continue
            }

            if ($Extensions -and ($Extensions -notcontains $item.Extension.ToLowerInvariant())) {
                continue
            }

            if (Test-IsExcludedPath -Path $item.FullName) {
                continue
            }

            $item
        }
    }
}

function Get-RepoDirectories {
    $stack = New-Object System.Collections.Stack
    $stack.Push($Root)

    while ($stack.Count -gt 0) {
        $directory = [string]$stack.Pop()
        $items = Get-ChildItem -LiteralPath $directory -Force -ErrorAction SilentlyContinue

        foreach ($item in $items) {
            if (-not $item.PSIsContainer) {
                continue
            }

            if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
                continue
            }

            if (Test-IsExcludedPath -Path $item.FullName) {
                continue
            }

            $item
            $stack.Push($item.FullName)
        }
    }
}

function Get-JsonName {
    param([string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
        return $null
    }

    try {
        $json = Get-Content -LiteralPath $Path -Raw -ErrorAction Stop | ConvertFrom-Json -ErrorAction Stop
        if ($json.PSObject.Properties['name'] -and -not [string]::IsNullOrWhiteSpace([string]$json.name)) {
            return [string]$json.name
        }
    }
    catch {
        return $null
    }

    return $null
}

$TargetSpecs = foreach ($targetName in $TargetNames) {
    $directPath = Join-Path $Root $targetName
    $forkPath = Join-Path (Join-Path $Root 'forks') $targetName

    if (Test-Path -LiteralPath $directPath -PathType Container) {
        $selectedPath = $directPath
        $displayPath = $targetName
    }
    elseif (Test-Path -LiteralPath $forkPath -PathType Container) {
        $selectedPath = $forkPath
        $displayPath = "forks/$targetName"
    }
    else {
        $selectedPath = $directPath
        $displayPath = $targetName
    }

    [pscustomobject]@{
        Name        = $targetName
        DisplayPath = $displayPath
        FullPath    = Get-NormalizedFullPath -Path $selectedPath
        Exists      = (Test-Path -LiteralPath $selectedPath -PathType Container)
        PackageNames = @()
    }
}

foreach ($target in $TargetSpecs) {
    $packageNames = New-Object System.Collections.Generic.List[string]

    if ($target.Exists) {
        $manifestCandidates = @(
            (Join-Path $target.FullPath 'package.json'),
            (Join-Path $target.FullPath 'package-lock.json'),
            (Join-Path $target.FullPath 'npm-shrinkwrap.json'),
            (Join-Path $target.FullPath 'node_modules/.package-lock.json')
        )

        foreach ($manifestPath in $manifestCandidates) {
            $packageName = Get-JsonName -Path $manifestPath
            if ($packageName -and -not ($packageNames -contains $packageName)) {
                [void]$packageNames.Add($packageName)
            }
        }
    }

    $target.PackageNames = $packageNames.ToArray()
}

function Get-PathDepth {
    param([string]$Path)

    $relativePath = Get-RelativePath -Path $Path -BasePath $Root
    if ($relativePath -eq '.') {
        return 0
    }

    return ($relativePath -split '/').Count
}

function Get-MainAppRoots {
    $roots = New-Object System.Collections.Generic.HashSet[string]
    $nextConfigFiles = @(Get-RepoFiles | Where-Object {
        $_.Name -match '^next\.config\.' -and (Get-PathDepth -Path $_.FullName) -le 3
    })

    foreach ($configFile in $nextConfigFiles) {
        [void]$roots.Add((Get-NormalizedFullPath -Path $configFile.DirectoryName))
    }

    $appDirectories = @(Get-RepoDirectories | Where-Object {
        $_.Name -ieq 'app' -and (Get-PathDepth -Path $_.FullName) -le 3
    })

    foreach ($appDirectory in $appDirectories) {
        [void]$roots.Add((Get-NormalizedFullPath -Path $appDirectory.FullName))
    }

    if ($roots.Count -eq 0) {
        return @($Root)
    }

    return @($roots)
}

function Test-SpecifierReferencesTarget {
    param(
        [string]$Specifier,
        $Target
    )

    $normalizedSpecifier = ($Specifier -replace '\\', '/').Trim()
    $normalizedSpecifier = ($normalizedSpecifier -split '[?#]', 2)[0]
    $pathSegments = $normalizedSpecifier.Trim('/').Split([char]'/')

    if ($pathSegments -contains $Target.Name) {
        return $true
    }

    foreach ($packageName in $Target.PackageNames) {
        if ($normalizedSpecifier -ieq $packageName) {
            return $true
        }

        if ($normalizedSpecifier.StartsWith($packageName + '/', [System.StringComparison]::OrdinalIgnoreCase)) {
            return $true
        }
    }

    return $false
}

function Test-LineIsComment {
    param([string]$Line)

    $trimmedLine = $Line.TrimStart()
    return $trimmedLine.StartsWith('//') -or
        $trimmedLine.StartsWith('/*') -or
        $trimmedLine.StartsWith('*') -or
        $trimmedLine.StartsWith('#')
}

function Get-ImportEvidence {
    param($Target)

    $evidence = New-Object System.Collections.Generic.List[object]
    $importPattern = '(?im)(?:\bfrom\s+|\bimport\s*\(\s*|\brequire\s*\(\s*)[''"]([^''"\r\n]+)[''"]'

    foreach ($file in $SourceFiles) {
        try {
            $content = [System.IO.File]::ReadAllText($file.FullName)
        }
        catch {
            continue
        }

        $matches = [regex]::Matches($content, $importPattern)
        $fileLines = @($content -split "`n")
        $matchedLines = New-Object System.Collections.Generic.List[int]

        foreach ($match in $matches) {
            $lineNumber = ($content.Substring(0, $match.Index) -split "`n").Count
            if ($lineNumber -gt 0 -and $lineNumber -le $fileLines.Count) {
                if (Test-LineIsComment -Line $fileLines[$lineNumber - 1]) {
                    continue
                }
            }

            $specifier = $match.Groups[1].Value
            if (Test-SpecifierReferencesTarget -Specifier $specifier -Target $Target) {
                if (-not ($matchedLines -contains $lineNumber)) {
                    [void]$matchedLines.Add($lineNumber)
                }
            }
        }

        if ($matchedLines.Count -gt 0) {
            [void]$evidence.Add([pscustomobject]@{
                Path  = Get-RelativePath -Path $file.FullName -BasePath $Root
                Lines = @($matchedLines)
            })
        }
    }

    return @($evidence)
}

function Test-TextReferencesTarget {
    param(
        [string]$Text,
        $Target
    )

    $normalizedText = ($Text -replace '\\', '/')
    $terms = New-Object System.Collections.Generic.List[string]

    if (-not $terms.Contains($Target.Name)) {
        [void]$terms.Add($Target.Name)
    }

    if ($Target.DisplayPath -ine $Target.Name -and -not $terms.Contains($Target.DisplayPath)) {
        [void]$terms.Add($Target.DisplayPath)
    }

    foreach ($packageName in $Target.PackageNames) {
        if ($packageName -and -not $terms.Contains($packageName)) {
            [void]$terms.Add($packageName)
        }
    }

    foreach ($term in $terms) {
        if ($term.IndexOf('/') -ge 0) {
            if ($normalizedText.IndexOf($term, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) {
                return $true
            }
            continue
        }

        $escapedTerm = [regex]::Escape($term)
        $boundaryPattern = "(?<![A-Za-z0-9_.-])$escapedTerm(?![A-Za-z0-9_.-])"
        if ([regex]::IsMatch($normalizedText, $boundaryPattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)) {
            return $true
        }
    }

    return $false
}

function Get-BuildConfigFiles {
    return @(Get-RepoFiles | Where-Object {
        $_.Name -match '^next\.config\.' -or
        $_.Name -ieq 'vercel.json' -or
        $_.Name -ieq 'turbo.json' -or
        $_.Name -ieq 'pnpm-workspace.yaml' -or
        $_.Name -ieq 'pnpm-workspace.yml' -or
        $_.Name -match '^docker-compose.*\.ya?ml$' -or
        $_.Name -match '^nginx.*\.conf$' -or
        $_.Name -ieq 'package.json'
    })
}

function Get-BuildReferenceText {
    param([System.IO.FileInfo]$File)

    if ($File.Name -ine 'package.json') {
        return [System.IO.File]::ReadAllText($File.FullName)
    }

    try {
        $packageJson = Get-Content -LiteralPath $File.FullName -Raw -ErrorAction Stop | ConvertFrom-Json -ErrorAction Stop
    }
    catch {
        return ''
    }

    $values = New-Object System.Collections.Generic.List[string]

    if ($packageJson.PSObject.Properties['scripts'] -and $packageJson.scripts) {
        foreach ($property in $packageJson.scripts.PSObject.Properties) {
            [void]$values.Add("scripts.$($property.Name) = $($property.Value)")
        }
    }

    if ($packageJson.PSObject.Properties['workspaces'] -and $packageJson.workspaces) {
        if ($packageJson.workspaces -is [string]) {
            [void]$values.Add("workspaces = $($packageJson.workspaces)")
        }
        elseif ($packageJson.workspaces.PSObject.Properties['packages']) {
            foreach ($property in $packageJson.workspaces.packages.PSObject.Properties) {
                [void]$values.Add("workspaces.packages.$($property.Name) = $($property.Value)")
            }
        }
    }

    return ($values -join "`n")
}

function Get-BuildEvidence {
    param($Target)

    $evidence = New-Object System.Collections.Generic.List[object]

    foreach ($file in $BuildConfigFiles) {
        $referenceText = Get-BuildReferenceText -File $file
        if (-not (Test-TextReferencesTarget -Text $referenceText -Target $Target)) {
            continue
        }

        if ($file.Name -ieq 'package.json') {
            [void]$evidence.Add([pscustomobject]@{
                Path   = Get-RelativePath -Path $file.FullName -BasePath $Root
                Detail = 'package.json scripts/workspaces'
            })
            continue
        }

        try {
            $lines = [System.IO.File]::ReadAllText($file.FullName) -split "`n"
        }
        catch {
            $lines = @()
        }

        $matchingLines = New-Object System.Collections.Generic.List[string]
        for ($index = 0; $index -lt $lines.Count; $index++) {
            if (Test-TextReferencesTarget -Text $lines[$index] -Target $Target) {
                [void]$matchingLines.Add("$($index + 1): $($lines[$index].Trim())")
                if ($matchingLines.Count -ge 10) {
                    break
                }
            }
        }

        [void]$evidence.Add([pscustomobject]@{
            Path   = Get-RelativePath -Path $file.FullName -BasePath $Root
            Detail = ($matchingLines -join ' | ')
        })
    }

    return @($evidence)
}

function Test-DependencyEntryReferencesTarget {
    param(
        [string]$Key,
        [string]$Value,
        $Target
    )

    foreach ($packageName in $Target.PackageNames) {
        if ($Key -ieq $packageName) {
            return $true
        }
    }

    if ($Key -ieq $Target.Name) {
        return $true
    }

    if ($Value -match '^(file|link):') {
        return (Test-TextReferencesTarget -Text $Value -Target $Target)
    }

    return $false
}

function Get-DependencyEvidence {
    param($Target)

    $evidence = New-Object System.Collections.Generic.List[object]

    foreach ($file in $PackageJsonFiles) {
        try {
            $packageJson = Get-Content -LiteralPath $file.FullName -Raw -ErrorAction Stop | ConvertFrom-Json -ErrorAction Stop
        }
        catch {
            continue
        }

        $sections = @('dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies')
        $matchedEntries = New-Object System.Collections.Generic.List[string]

        foreach ($section in $sections) {
            if (-not $packageJson.PSObject.Properties[$section] -or -not $packageJson.$section) {
                continue
            }

            foreach ($property in $packageJson.$section.PSObject.Properties) {
                if (Test-DependencyEntryReferencesTarget -Key $property.Name -Value ([string]$property.Value) -Target $Target) {
                    [void]$matchedEntries.Add("$section.$($property.Name) = $($property.Value)")
                }
            }
        }

        if ($matchedEntries.Count -gt 0) {
            [void]$evidence.Add([pscustomobject]@{
                Path    = Get-RelativePath -Path $file.FullName -BasePath $Root
                Details = @($matchedEntries)
            })
        }
    }

    return @($evidence)
}

function Format-Code {
    param([string]$Value)

    return '`' + ($Value -replace '`', '``') + '`'
}

function Format-EvidencePath {
    param([string]$Value)

    return (Format-Code -Value $Value)
}

function Add-EvidenceSection {
    param(
        [System.Collections.Generic.List[string]]$Lines,
        [string]$Title,
        $Evidence
    )

    [void]$Lines.Add('')
    [void]$Lines.Add("#### $Title")
    [void]$Lines.Add('')

    if ($Evidence.Count -eq 0) {
        [void]$Lines.Add('- None found.')
        return
    }

    foreach ($item in $Evidence) {
        $entry = (Format-EvidencePath -Value $item.Path)
        if ($item.PSObject.Properties['Lines'] -and $item.Lines.Count -gt 0) {
            $entry += " (lines $($item.Lines -join ', '))"
        }
        if ($item.PSObject.Properties['Detail'] -and -not [string]::IsNullOrWhiteSpace($item.Detail)) {
            $entry += " — $($item.Detail)"
        }
        if ($item.PSObject.Properties['Details'] -and $item.Details.Count -gt 0) {
            $entry += " — $($item.Details -join '; ')"
        }
        [void]$Lines.Add("- $entry")
    }
}

$MainAppRoots = @(Get-MainAppRoots)
$SourceFiles = @(Get-RepoFiles -Extensions $SourceExtensions)
$BuildConfigFiles = @(Get-BuildConfigFiles)
$PackageJsonFiles = @(Get-RepoFiles -Extensions @('.json') | Where-Object { $_.Name -ieq 'package.json' })

$ImportEvidenceByTarget = @{}
$BuildEvidenceByTarget = @{}
$DependencyEvidenceByTarget = @{}

foreach ($target in $TargetSpecs) {
    $ImportEvidenceByTarget[$target.Name] = @(Get-ImportEvidence -Target $target)
    $BuildEvidenceByTarget[$target.Name] = @(Get-BuildEvidence -Target $target)
    $DependencyEvidenceByTarget[$target.Name] = @(Get-DependencyEvidence -Target $target)
}

$reportLines = New-Object System.Collections.Generic.List[string]
[void]$reportLines.Add('# VizTR Repository Dependency Audit')
[void]$reportLines.Add('')
[void]$reportLines.Add("Generated: $(Get-Date -AsUTC -Format 'yyyy-MM-ddTHH:mm:ssZ')")
[void]$reportLines.Add("Repo root: $(Get-RelativePath -Path $Root -BasePath $Root)")
[void]$reportLines.Add('')
[void]$reportLines.Add('This report classifies each candidate directory using static evidence from imports, build configuration, and package dependency manifests. It does not delete or move anything.')
[void]$reportLines.Add('')
[void]$reportLines.Add('Target directories are resolved from the repo root first, then from `forks/<name>` when the root-level directory is absent.')
[void]$reportLines.Add('')
[void]$reportLines.Add('## Detected main app root(s)')
[void]$reportLines.Add('')

foreach ($appRoot in $MainAppRoots) {
    [void]$reportLines.Add("- $(Format-Code -Value (Get-RelativePath -Path $appRoot -BasePath $Root))")
}

[void]$reportLines.Add('')
[void]$reportLines.Add('## Per-directory classification')
[void]$reportLines.Add('')
[void]$reportLines.Add('| Directory | Exists | package.json name | Live imports | Build references | Workspace dependencies | Verdict |')
[void]$reportLines.Add('|---|---|---|---:|---:|---:|---|')

foreach ($target in $TargetSpecs) {
    $importEvidence = $ImportEvidenceByTarget[$target.Name]
    $buildEvidence = $BuildEvidenceByTarget[$target.Name]
    $dependencyEvidence = $DependencyEvidenceByTarget[$target.Name]

    if (-not $target.Exists) {
        $verdict = 'NOT PRESENT'
    }
    elseif ($importEvidence.Count -gt 0) {
        $verdict = 'LIVE IMPORT'
    }
    elseif ($dependencyEvidence.Count -gt 0) {
        $verdict = 'WORKSPACE DEP'
    }
    elseif ($buildEvidence.Count -gt 0) {
        $verdict = 'BUILD REFERENCE'
    }
    else {
        $verdict = 'UNREFERENCED'
    }

    $packageNames = if ($target.PackageNames.Count -gt 0) { $target.PackageNames -join ', ' } else { '-' }
    $exists = if ($target.Exists) { 'YES' } else { 'NO' }

    [void]$reportLines.Add("| $(Format-Code -Value $target.DisplayPath) | $exists | $(Format-Code -Value $packageNames) | $($importEvidence.Count) files | $($buildEvidence.Count) files | $($dependencyEvidence.Count) files | $verdict |")
}

[void]$reportLines.Add('')
[void]$reportLines.Add('## Evidence')

foreach ($target in $TargetSpecs) {
    [void]$reportLines.Add('')
    [void]$reportLines.Add("### $(Format-Code -Value $target.DisplayPath)")

    Add-EvidenceSection -Lines $reportLines -Title 'Live imports' -Evidence $ImportEvidenceByTarget[$target.Name]
    Add-EvidenceSection -Lines $reportLines -Title 'Build references' -Evidence $BuildEvidenceByTarget[$target.Name]
    Add-EvidenceSection -Lines $reportLines -Title 'Workspace dependencies' -Evidence $DependencyEvidenceByTarget[$target.Name]
}

[void]$reportLines.Add('')
[void]$reportLines.Add('## How to read this')
[void]$reportLines.Add('')
[void]$reportLines.Add('- **LIVE IMPORT**: source code outside the target directory imports it by a relative path or by a package name discovered from its manifest.')
[void]$reportLines.Add('- **WORKSPACE DEP**: a package manifest outside the target directory lists the target package or folder as a dependency.')
[void]$reportLines.Add('- **BUILD REFERENCE**: the target appears in Next.js, Vercel, Turbo, pnpm workspace, Docker Compose, nginx, or package script/workspace configuration.')
[void]$reportLines.Add('- **UNREFERENCED**: no matching static evidence was found. The directory may still be a standalone deployment or an intentionally vendored fork.')
[void]$reportLines.Add('- Evidence searches exclude `node_modules`, `.git`, generated build/output directories, and the target directories themselves.')
[void]$reportLines.Add('')
[void]$reportLines.Add('## Suggested follow-up')
[void]$reportLines.Add('')
[void]$reportLines.Add('For directories marked `UNREFERENCED`, verify external deployment configuration, DNS/subdomain routing, and Vercel project ownership before considering any removal.')

[System.IO.File]::WriteAllText($ReportPath, ($reportLines -join [Environment]::NewLine), (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Report written to: $ReportPath"
Get-Content -LiteralPath $ReportPath
