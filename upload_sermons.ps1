[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

function Dec([string]$b64) {
    return [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($b64))
}

$catName    = Dec "6rCV7ZW07ISk6rWQ"          # "강해설교"
$authorName = Dec "66Gc67KE7Yq4IOugiOydtO2KvA=="  # "로버트 레이튼"
$seriesName = Dec "67Kg65Oc66Gc7KCE7ISc"          # "베드로전서"

$apiKey    = "AIzaSyCJbOaiElCypwgtPgbwdnudn3VC737fMrs"
$projectId = "kpuritan-home"

Write-Host "1. Signing in anonymously to Firebase..." -ForegroundColor Cyan
$authBody = '{"returnSecureToken":true}'
$authRes = Invoke-RestMethod -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$apiKey" -Method Post -Body $authBody -ContentType "application/json; charset=utf-8"
$idToken = $authRes.idToken
Write-Host "Anonymous authentication success!" -ForegroundColor Green

# 2. Get Sermon Files
$subDir = Join-Path $catName $seriesName
$fullPath = Join-Path $PSScriptRoot $subDir

$filePaths = [System.IO.Directory]::GetFiles($fullPath, "*.md") | Sort-Object

Write-Host "Found $($filePaths.Length) sermon files in $fullPath" -ForegroundColor Cyan

$firestoreUrl = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents/posts"
$headers = @{
    "Authorization" = "Bearer $idToken"
}

$counter = 0
foreach ($fp in $filePaths) {
    $counter++
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($fp)
    $rawContent = [System.IO.File]::ReadAllText($fp, [System.Text.Encoding]::UTF8)

    # Extract H1 title
    $subTitle = ""
    if ($rawContent -match '<h1[^>]*>(.*?)</h1>') {
        $subTitle = $matches[1].Trim()
    }

    # Clean file name for prefix
    # e.g. 01_베드로전서_1장_1-4절 -> 베드로전서 1장 1-4절
    $prefix = $fileName
    if ($fileName -match '^\d+_(.+)$') {
        $prefix = $matches[1].Replace("_", " ")
    }

    $finalTitle = if ($subTitle -and ($subTitle -ne "")) {
        "$prefix`: $subTitle"
    } else {
        $prefix
    }

    $orderNum = $counter
    if ($fileName -match '^(\d+)') {
        $orderNum = [int]$matches[1]
    }

    Write-Host "[$counter/$($filePaths.Length)] Uploading: $finalTitle (Order: $orderNum)" -ForegroundColor Yellow

    $nowIso = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")

    $fields = [ordered]@{
        "topic"         = @{ "stringValue" = $catName }
        "otherCategory" = @{ "stringValue" = $catName }
        "author"        = @{ "stringValue" = $authorName }
        "series"        = @{ "stringValue" = $seriesName }
        "title"         = @{ "stringValue" = $finalTitle }
        "order"         = @{ "integerValue" = "$orderNum" }
        "recent_order"  = @{ "integerValue" = "$counter" }
        "price"         = @{ "stringValue" = "" }
        "coverUrl"      = @{ "stringValue" = "" }
        "fileUrl"       = @{ "stringValue" = "" }
        "content"       = @{ "stringValue" = $rawContent }
        "tags"          = @{
            "arrayValue" = @{
                "values" = @(
                    @{ "stringValue" = $catName },
                    @{ "stringValue" = $seriesName },
                    @{ "stringValue" = $authorName }
                )
            }
        }
        "subTopics"     = @{
            "arrayValue" = @{
                "values" = @()
            }
        }
        "createdAt"     = @{ "timestampValue" = $nowIso }
        "updatedAt"     = @{ "timestampValue" = $nowIso }
    }

    $postData = @{ "fields" = $fields }
    $jsonBody = $postData | ConvertTo-Json -Depth 10
    $byteBody = [System.Text.Encoding]::UTF8.GetBytes($jsonBody)

    $uploadRes = Invoke-RestMethod -Uri $firestoreUrl -Method Post -Headers $headers -Body $byteBody -ContentType "application/json; charset=utf-8"
    $docId = $uploadRes.name.Split('/')[-1]
    Write-Host "  -> Success! Doc ID: $docId" -ForegroundColor Green

    Start-Sleep -Milliseconds 250
}

Write-Host "All $($filePaths.Length) sermons successfully registered to Firestore!" -ForegroundColor Green
