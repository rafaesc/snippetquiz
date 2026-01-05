{{/*
Parse JDBC URI to extract host
Example: jdbc:postgresql://snippetquiz-db-sss-rw.ss.svc.cluster.local:5432/app?password=qqq&user=ddd
*/}}
{{- define "core-service.postgresql.host" -}}
{{- if .Values.postgresql.jdbcUri -}}
{{- $uri := .Values.postgresql.jdbcUri -}}
{{- $withoutPrefix := regexReplaceAll "^jdbc:postgresql://" $uri "" -}}
{{- $hostPort := regexReplaceAll "/.*$" $withoutPrefix "" -}}
{{- $host := regexReplaceAll ":.*$" $hostPort "" -}}
{{- $host -}}
{{- else -}}
{{- .Values.postgresql.host -}}
{{- end -}}
{{- end -}}

{{/*
Parse JDBC URI to extract port
*/}}
{{- define "core-service.postgresql.port" -}}
{{- if .Values.postgresql.jdbcUri -}}
{{- $uri := .Values.postgresql.jdbcUri -}}
{{- $withoutPrefix := regexReplaceAll "^jdbc:postgresql://" $uri "" -}}
{{- $hostPort := regexReplaceAll "/.*$" $withoutPrefix "" -}}
{{- if contains ":" $hostPort -}}
{{- $port := regexReplaceAll "^[^:]+:" $hostPort "" -}}
{{- $port -}}
{{- else -}}
5432
{{- end -}}
{{- else -}}
{{- .Values.postgresql.port -}}
{{- end -}}
{{- end -}}

{{/*
Parse JDBC URI to extract database
*/}}
{{- define "core-service.postgresql.database" -}}
{{- if .Values.postgresql.jdbcUri -}}
{{- $uri := .Values.postgresql.jdbcUri -}}
{{- $withoutPrefix := regexReplaceAll "^jdbc:postgresql://[^/]+/" $uri "" -}}
{{- $database := regexReplaceAll "\\?.*$" $withoutPrefix "" -}}
{{- $database -}}
{{- else -}}
{{- .Values.postgresql.database -}}
{{- end -}}
{{- end -}}

{{/*
Parse JDBC URI to extract user from query parameters
*/}}
{{- define "core-service.postgresql.user" -}}
{{- if .Values.postgresql.jdbcUri -}}
{{- $uri := .Values.postgresql.jdbcUri -}}
{{- if contains "user=" $uri -}}
{{- $params := regexReplaceAll "^[^?]+\\?" $uri "" -}}
{{- $userParam := regexFind "user=[^&]*" $params -}}
{{- $user := regexReplaceAll "^user=" $userParam "" -}}
{{- $user -}}
{{- else -}}
{{- .Values.postgresql.user | default "" -}}
{{- end -}}
{{- else -}}
{{- .Values.postgresql.user -}}
{{- end -}}
{{- end -}}

{{/*
Parse JDBC URI to extract password from query parameters
*/}}
{{- define "core-service.postgresql.password" -}}
{{- if .Values.postgresql.jdbcUri -}}
{{- $uri := .Values.postgresql.jdbcUri -}}
{{- if contains "password=" $uri -}}
{{- $params := regexReplaceAll "^[^?]+\\?" $uri "" -}}
{{- $passwordParam := regexFind "password=[^&]*" $params -}}
{{- $password := regexReplaceAll "^password=" $passwordParam "" -}}
{{- $password -}}
{{- else -}}
{{- .Values.postgresql.password | default "" -}}
{{- end -}}
{{- else -}}
{{- .Values.postgresql.password -}}
{{- end -}}
{{- end -}}
