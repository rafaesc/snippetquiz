{{- define "snippetquiz-core-service-chart.name" -}}
{{ .Chart.Name }}
{{- end }}

{{- define "snippetquiz-core-service-chart.fullname" -}}
{{- $name := include "snippetquiz-core-service-chart.name" . }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
