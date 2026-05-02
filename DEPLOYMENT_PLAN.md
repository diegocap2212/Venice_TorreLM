# 🚀 DEPLOYMENT PLAN - SharePoint Sync to Production

## ✅ PRÉ-DEPLOYMENT CHECKLIST

### 1. Código & Git
```bash
# ✅ Verificar que tudo está commitado
git status
# Expected: "nothing to commit, working tree clean"

# ✅ Verificar commits no branch
git log --oneline -5
# Expected: Últimos commits com security hardening
```

### 2. Branch Status
```bash
# ✅ Verificar que estamos na branch correta
git branch -v
# Expected: * claude/sync-spreadsheet-data-AOdPP

# ✅ Verificar que está sincronizado com remote
git fetch origin
git log --oneline -1
# Expected: Mesmo commit que está em origin
```

### 3. Build & Dependencies
```bash
# ✅ Limpar dependências antigas
rm -rf node_modules package-lock.json

# ✅ Instalar dependências
npm install

# ✅ Build
npm run build
# Expected: Build succeeds sem warnings

# ✅ Type check
npx tsc --noEmit
# Expected: Sem erros de tipo
```

### 4. Database
```bash
# ⚠️ CRITICAL: Backup do banco ANTES de qualquer mudança
# Executar no seu servidor de produção:
# pg_dump -h localhost -U postgres venice_db > backup_$(date +%Y%m%d_%H%M%S).sql

# ✅ Listar migrations pendentes
npx prisma migrate status
# Expected: Mostra migrações que ainda não foram aplicadas

# ✅ Preview das mudanças
npx prisma migrate diff --from-empty --to-schema-datamodel
```

### 5. Environment Variables
```bash
# ✅ Criar/atualizar .env.production com:
SHAREPOINT_TENANT_ID=seu_tenant_id
SHAREPOINT_CLIENT_ID=seu_client_id
SHAREPOINT_CLIENT_SECRET=seu_client_secret
SHAREPOINT_SITE_ID=seu_site_id
SHAREPOINT_DRIVE_ID=seu_drive_id
SHAREPOINT_ITEM_ID=seu_item_id

SYNC_ENABLED=true
SYNC_POLL_INTERVAL_MS=300000  # 5 minutos
SYNC_MAX_RETRIES=3
SYNC_TIMEOUT_MS=30000
SYNC_BATCH_SIZE=50
SYNC_AUDIT_ENABLED=true

DATABASE_URL=postgresql://user:password@host/venice_db
INSTANCE_ID=prod-instance-1

# ✅ Verificar que todas as variáveis estão setadas
env | grep SHAREPOINT
env | grep SYNC
env | grep DATABASE_URL
```

### 6. Documentação
```bash
# ✅ Verificar que temos SYNC_SECURITY.md
cat SYNC_SECURITY.md | head -20
# Expected: Documentação completa

# ✅ Verificar que temos changelog
git log --oneline e291381...HEAD
# Expected: Commits de security hardening visíveis
```

---

## 🚀 DEPLOYMENT STEPS

### PASSO 1: Aplicar Migrations (2-5 min)
```bash
# Conectar ao servidor de produção via SSH/RDP
ssh user@production-server

# Navegar para diretório da aplicação
cd /var/www/venice-torrelm

# ⚠️ BACKUP FINAL
pg_dump -h localhost -U postgres venice_db > backup_pre_sync_deploy.sql

# Aplicar migrations
npx prisma migrate deploy
# Expected: "Migrations: 1 applied" (add_sync_models)

# Verificar que tabelas foram criadas
npx prisma db execute --stdin << 'EOF'
SELECT table_name FROM information_schema.tables 
WHERE table_schema='public' AND table_name IN ('sync_runs', 'sync_locks', 'sync_metrics');
EOF
# Expected: sync_runs, sync_locks, sync_metrics existem
```

### PASSO 2: Fazer Pull do Código
```bash
# Fazer pull do código
git pull origin claude/sync-spreadsheet-data-AOdPP
# Expected: "Already up to date" ou novo commit aplicado

# Verificar que temos os arquivos corretos
ls -la src/lib/sync/distributed-lock.ts
ls -la src/lib/sync/log-sanitizer.ts
ls -la src/lib/sync/api-validators.ts
# Expected: Arquivos existem
```

### PASSO 3: Instalar Dependências & Build
```bash
# Instalar node_modules
npm install

# Build da aplicação
npm run build
# Expected: Build completa sem erros

# Verificar que build foi gerado
ls -la .next
# Expected: Pasta .next existe
```

### PASSO 4: Reiniciar Aplicação
```bash
# Parar aplicação atual (ex: via PM2)
pm2 stop venice-torrelm
# ou
systemctl stop venice-torrelm
# ou
# Matar o processo Node manualmente

# Aguardar 5 segundos
sleep 5

# Iniciar aplicação
pm2 start ecosystem.config.js --name venice-torrelm
# ou
systemctl start venice-torrelm
# ou
npm start &

# Aguardar inicialização (20-30 segundos)
sleep 30

# Verificar que aplicação está running
pm2 status
# ou
systemctl status venice-torrelm
# Expected: Status = online/active
```

---

## ✅ VERIFICAÇÃO PÓS-DEPLOYMENT

### 1. Verificação de Health (CRÍTICO)
```bash
# Aguardar 10 segundos após start
sleep 10

# ✅ GET /api/health/sync
curl -s https://seu-dominio.com/api/health/sync | jq .
# Expected response:
# {
#   "service": "sharepoint-sync",
#   "healthy": true,
#   "status": "running",
#   "enabled": true,
#   "lastSync": null,
#   "nextSync": "2026-05-02T10:40:00Z"
# }

# Se retornar erro ou healthy=false:
# ❌ FALHAR DEPLOYMENT - Rollback imediatamente!
```

### 2. Verificação de Status
```bash
# ✅ GET /api/sync/status
curl -s -H "Authorization: Bearer YOUR_TOKEN" \
  https://seu-dominio.com/api/sync/status | jq .

# Expected:
# {
#   "status": "ok",
#   "sync": {
#     "isRunning": false,
#     "lastSyncAt": null,
#     "pollingActive": true
#   },
#   "stats": { ... }
# }
```

### 3. Verificação de Database
```bash
# ✅ Confirmar que tabelas estão vazias (primeira vez)
npx prisma db execute --stdin << 'EOF'
SELECT COUNT(*) as sync_runs_count FROM sync_runs;
SELECT COUNT(*) as sync_locks_count FROM sync_locks;
SELECT COUNT(*) as sync_metrics_count FROM sync_metrics;
EOF

# Expected: 0, 0, 0 (primeira vez é normal)
```

### 4. Teste Manual de Sync
```bash
# ✅ Trigger manual
curl -X POST https://seu-dominio.com/api/sync/trigger \
  -H "Authorization: Bearer YOUR_BP_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"force": false, "dryRun": false}'

# Expected: 202 Accepted
# {
#   "status": "triggered",
#   "message": "Sync has been triggered",
#   "timestamp": "2026-05-02T10:40:00Z",
#   "durationMs": 15
# }

# ⏰ Aguardar 30 segundos para sync executar
sleep 30

# ✅ Verificar logs
curl -s -H "Authorization: Bearer YOUR_BP_ADMIN_TOKEN" \
  "https://seu-dominio.com/api/sync/logs?limit=5" | jq .

# Expected: Ver logs de SYNC_START, SYNC_SUCCESS, COLABORADOR_CREATE/UPDATE
```

### 5. Verificação de Performance
```bash
# ✅ Conferir tempo de resposta
curl -w "Response time: %{time_total}s\n" \
  https://seu-dominio.com/api/sync/status

# Expected: < 500ms
```

### 6. Verificação de Logs da Aplicação
```bash
# Ver logs em tempo real
pm2 logs venice-torrelm | tail -100

# Procurar por:
# ✅ "[Polling] Polling started"
# ✅ "[DistributedLock] Lock acquired"
# ✅ Sem "ERROR" ou "CRITICAL"

# Se ver erros:
# ❌ FALHAR - Verificar logs detalhados
```

---

## 🔄 MONITORAMENTO CONTÍNUO (Primeiras 2 horas)

### Dashboard de Monitoramento
```bash
# Terminal 1: Watch logs em tempo real
pm2 logs venice-torrelm

# Terminal 2: Poll status a cada 30 segundos
watch -n 30 'curl -s https://seu-dominio.com/api/sync/status | jq ".sync"'

# Terminal 3: Monitor health
watch -n 30 'curl -s https://seu-dominio.com/api/health/sync | jq "."'
```

### O que Observar
- ✅ Health = true
- ✅ Polling = running
- ✅ Sem erros em logs
- ✅ Sync executando a cada 5 min
- ✅ Taxa de resposta < 500ms

### Se Algo Quebrar
```bash
# ❌ Imediato: Parar sync
curl -X POST https://seu-dominio.com/api/sync/trigger \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"force": false, "dryRun": true}'

# ❌ Parar aplicação se necessário
pm2 stop venice-torrelm

# ❌ Fazer rollback (próxima seção)
```

---

## 🔙 ROLLBACK PLAN (Se Algo Quebrar)

### Rollback Imediato (< 5 min)
```bash
# 1. Parar aplicação
pm2 stop venice-torrelm
# ou
systemctl stop venice-torrelm

# 2. Reverter código para versão anterior
git checkout HEAD~1  # Volta 1 commit atrás
# ou
git checkout 7df21a3  # Hash do commit antes do hardening

# 3. Reinstalar dependências
npm install

# 4. Build
npm run build

# 5. Reiniciar
pm2 start ecosystem.config.js --name venice-torrelm

# 6. Verificar health
sleep 30
curl https://seu-dominio.com/api/health/sync
```

### Rollback de Database (Se Migration Quebrou)
```bash
# 1. Parar aplicação
pm2 stop venice-torrelm

# 2. Restaurar backup
psql -h localhost -U postgres venice_db < backup_pre_sync_deploy.sql

# 3. Reverter migrations
npx prisma migrate resolve --rolled-back add_sync_models

# 4. Verificar status
npx prisma migrate status

# 5. Reiniciar
pm2 start ecosystem.config.js --name venice-torrelm
```

---

## 📋 CHECKLIST FINAL

### Antes de Deployment
- [ ] Git branch sincronizado com remote
- [ ] Build sem erros (`npm run build`)
- [ ] Environment variables setadas
- [ ] Database backup feito
- [ ] Documentação revisada

### Durante Deployment
- [ ] Migrations aplicadas com sucesso
- [ ] Código atualizado
- [ ] Dependências instaladas
- [ ] Aplicação reiniciada
- [ ] Health check = true

### Após Deployment
- [ ] Health endpoint respondendo
- [ ] Status endpoint funcionando
- [ ] Manual sync executado com sucesso
- [ ] Logs verificados (sem erros)
- [ ] Performance OK (< 500ms)
- [ ] Sync rodando no schedule

### Próximas 2 Horas
- [ ] Monitorar logs continuamente
- [ ] Verificar status a cada 30 min
- [ ] Confirmar sync executou 2x no mínimo
- [ ] Nenhum erro crítico nos logs

---

## 📞 TROUBLESHOOTING

### "Health check = false"
```bash
# Verificar logs
pm2 logs venice-torrelm | tail -50

# Verificar database connection
npx prisma db execute --stdin <<< "SELECT 1"

# Verificar environment variables
env | grep DATABASE_URL
env | grep SHAREPOINT

# Solução: Ajustar variáveis, reiniciar
```

### "Lock already held"
```bash
# Normal na primeira execução
# Aguardar 1 minuto e tentar novamente

# Se persistir por > 5 min:
# 1. Verificar se há processo Node travado
ps aux | grep node

# 2. Kill processo se necessário
kill -9 PID

# 3. Reiniciar aplicação
pm2 restart venice-torrelm
```

### "Migrations fail"
```bash
# Ver erro detalhado
npx prisma migrate deploy --verbose

# Rollback se necessário
psql -h localhost -U postgres venice_db < backup_pre_sync_deploy.sql

# Reaplicar migrations
npx prisma migrate deploy
```

---

## 🎯 Success Criteria

Deployment é bem-sucedido quando:

✅ Health check retorna 200 com healthy=true
✅ Aplicação inicia sem erros em logs
✅ Manual sync trigger funciona (202 Accepted)
✅ Sync executa automaticamente a cada 5 min
✅ Nenhum erro crítico nas primeiras 2 horas
✅ Taxa de resposta < 500ms
✅ Database migrations aplicadas com sucesso

---

## 📝 Documentação para Referência

- **SYNC_SECURITY.md**: Documentação completa de segurança
- **API Reference**: GET /api/health/sync, /api/sync/status, /api/sync/logs
- **Monitoring**: Dashboard, alertas, logs
- **Rollback**: Plano de reversão rápida

---

## 🚀 Próximos Passos Após Deploy

1. **Monitorar por 24 horas** - Garantir estabilidade
2. **Adicionar alertas** - Health check, error rate
3. **Setup logs centralizados** - ELK, Datadog, etc
4. **Documentar no Runbook** - Ops team
5. **Planejar Bizneo** - Para próxima sprint

---

**Você está pronto para fazer deploy! Precisa de algo antes de começar?**
