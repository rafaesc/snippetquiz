{{- define "snippetquiz-frontend-chart.name" -}}
{{ .Chart.Name }}
{{- end }}

{{- define "snippetquiz-frontend-chart.fullname" -}}
{{- $name := include "snippetquiz-frontend-chart.name" . }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
