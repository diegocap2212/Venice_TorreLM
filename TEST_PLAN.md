# Teste End-to-End Funcional - Venice BP Hub

**Data:** 2026-05-02  
**Objetivo:** Validar fluxos de contratação de RH, sincronização de dados e segurança  
**Pré-requisito:** Executar `npm run dev` em `http://localhost:3000`

---

## 1️⃣ AUTENTICAÇÃO E RESET DE SENHA

### Teste 1.1: Login com Senha Padrão
- [ ] Acessar `http://localhost:3000/login`
- [ ] Email: `diego.caporusso@venicetech.com.br`
- [ ] Senha: `Venice@BP2026` (padrão do seed)
- **Resultado esperado:** Redireciona para `/reset-password`

### Teste 1.2: Forçar Reset de Senha (First Login)
- [ ] Na página de reset, preencher:
  - Senha Atual: `Venice@BP2026`
  - Nova Senha: `NovaPass2026!`
  - Confirmar: `NovaPass2026!`
- [ ] Clicar "Alterar Senha"
- **Resultado esperado:**
  - ✅ Mensagem de sucesso: "Senha alterada com sucesso"
  - ✅ Redireciona para `/dashboard` automaticamente

### Teste 1.3: Login com Nova Senha
- [ ] Logout (se necessário)
- [ ] Acessar login novamente
- [ ] Email: `diego.caporusso@venicetech.com.br`
- [ ] Senha: `NovaPass2026!`
- **Resultado esperado:**
  - ✅ Login bem-sucedido
  - ✅ Dashboard exibido SEM redirecionar para reset

---

## 2️⃣ DASHBOARD E NAVEGAÇÃO

### Teste 2.1: Visualizar Dashboard Principal
- [ ] Após login, verificar:
  - [ ] Título "Venice | Pipeline de Talentos LM" no navegador
  - [ ] Menu lateral com opções: Vagas, Colaboradores, Relatórios
  - [ ] Cards KPI (quantidade de vagas abertas, colaboradores ativos, etc)

### Teste 2.2: Acessar Seção de Colaboradores
- [ ] Clicar em "Colaboradores" no menu
- [ ] Verificar lista carregada:
  - [ ] Tabela com colunas: Nome, Cargo, Status, Data Admissão, Ações
  - [ ] Pelo menos 10 colaboradores visíveis (do seed)
  - [ ] Botão para abrir drawer de detalhes

---

## 3️⃣ DADOS DE RH - COLABORADOR

### Teste 3.1: Visualizar Campos Obrigatórios de RH
- [ ] Clicar em qualquer colaborador para abrir drawer
- [ ] Verificar campos presentes:
  - [ ] **Nome** (ex: "Caio Fábio Duarte Ferreira")
  - [ ] **Cargo** (ex: "Desenvolvedor Front-End")
  - [ ] **Status** (ex: "Ativo")
  - [ ] **Torre** (ex: "Autoatendimento e ativação")
  - [ ] **Squad** (ex: "Portal do cliente")
  - [ ] **Email** (ex: "venice.caio@lmmobilidade.com.br")
  - [ ] **Data de Admissão** (formatada: dd/mm/yyyy)
  - [ ] **Data de Nascimento** (formatada: dd/mm/yyyy)
  - [ ] **Telefone** (se preenchido)

### Teste 3.2: Campos de Desligamento (Novo)
- [ ] No drawer de colaborador, procurar por seção "Desligamento":
  - [ ] **Data de Desligamento** (vazio para ativos)
  - [ ] **Motivo de Desligamento** (vazio para ativos)
- **Comportamento esperado:**
  - Colaboradores ativos: campos vazios
  - Colaboradores desligados: data e motivo visíveis

### Teste 3.3: Campos Sensíveis (CPF, Salário) - Visibilidade
- [ ] No drawer de colaborador, procurar por seção "Informações Privadas":
  - [ ] **CPF** com eye icon para toggle visibilidade
  - [ ] **Salário** com eye icon para toggle visibilidade
  - [ ] **Centro de Custo** (com visibilidade controlada)
- [ ] Clicar no eye icon ao lado de CPF:
  - [ ] ✅ CPF maskado por padrão: `***.***.***.89-01`
  - [ ] ✅ Ao clicar no eye, revela: `123.456.789-01`
  - [ ] ✅ Ao clicar novamente, volta a mascarar

---

## 4️⃣ VAGAS E RECRUTAMENTO

### Teste 4.1: Listar Vagas Abertas
- [ ] Clicar em "Vagas" no menu
- [ ] Visualizar lista de vagas:
  - [ ] Coluna "Título" da vaga
  - [ ] Coluna "Status da Etapa" (REQUISIÇÃO, RECRUTAMENTO, etc)
  - [ ] Coluna "Responsável"
  - [ ] Coluna "Data de Abertura"

### Teste 4.2: Visualizar Detalhes de Vaga
- [ ] Clicar em uma vaga
- [ ] Verificar drawer:
  - [ ] **Titulo**, **Perfil**, **Senioridade**
  - [ ] **Squad Destino**
  - [ ] **Aba Atual** e **Etapa Atual**
  - [ ] **Checklist** da etapa (com items interativos)
  - [ ] **Candidatos** associados (lista vazia ou preenchida)

### Teste 4.3: Atualizar Status de Vaga (Workflow)
- [ ] Abrir uma vaga em "REQUISIÇÃO"
- [ ] Clicar no botão "Próxima Etapa" (se disponível)
- **Resultado esperado:**
  - ✅ Etapa muda para "RECRUTAMENTO"
  - ✅ Data `data_etapa_atual` é atualizada

---

## 5️⃣ AVALIAÇÃO DE DESEMPENHO

### Teste 5.1: Acessar Performance Dashboard
- [ ] No drawer de Colaborador, ir para aba "Performance"
- [ ] Verificar seções presentes:
  - [ ] **Auto-Avaliação**
  - [ ] **PDI (Plano de Desenvolvimento Individual)**
  - [ ] **PIP (Plano de Melhoria de Desempenho)**
  - [ ] **Ciclos de Performance** (tabela com período, tipo, status)

### Teste 5.2: Visualizar Ciclo de Performance
- [ ] Se houver ciclos, clicar em um:
  - [ ] **Período** (ex: "2026-Q1")
  - [ ] **Tipo** (ex: "Auto-Avaliação", "Avaliação 360")
  - [ ] **Status** (ex: "Pendente", "Completo")
  - [ ] **Data Prevista** e **Data Realizado**

---

## 6️⃣ SINCRONIZAÇÃO DE DADOS

### Teste 6.1: Health Check - Sync Status
- [ ] Abrir DevTools → Network
- [ ] Fazer requisição: `curl http://localhost:3000/api/health/sync`
- **Resultado esperado:**
  ```json
  {
    "status": "healthy",
    "lastSyncAt": "2026-05-02T10:30:00Z" ou null,
    "isSyncEnabled": false,
    "nextSyncIn": "segundos",
    "db": "connected"
  }
  ```

### Teste 6.2: Logs de Sincronização (Admin)
- [ ] Acessar `/api/sync/logs?limit=10`
- [ ] Verificar estrutura (mesmo com SYNC_ENABLED=false):
  - [ ] **resource**: "Colaborador", "SharePointSync", etc
  - [ ] **action**: "CREATE", "UPDATE", "SYNC_START", etc
  - [ ] **timestamp**
  - [ ] **user_email** (redacionado por LGPD)
  - [ ] **status**: "SUCCESS", "ERROR", etc
- **Comportamento esperado:**
  - Nenhuma informação sensível em texto plano (CPF, senha, salário redacionados)

---

## 7️⃣ SEGURANÇA E LGPD

### Teste 7.1: Whitelist de Autenticação
- [ ] Tentar login com email NÃO autorizado:
  - Email: `usuario.nao.autorizado@venicetech.com.br`
  - Senha: qualquer uma
- **Resultado esperado:**
  - ❌ Erro: "Acesso não autorizado. Este sistema é restrito à equipe de Gestão de Contas."

### Teste 7.2: Validação de Entrada (Zod)
- [ ] Abrir DevTools → Console
- [ ] Fazer requisição inválida:
  ```bash
  curl -X POST http://localhost:3000/api/auth/reset-password \
    -H "Content-Type: application/json" \
    -d '{"currentPassword":"teste","newPassword":"123"}'
  ```
- **Resultado esperado:**
  - ✅ Status 400
  - ✅ Erro com detalhes de validação Zod

### Teste 7.3: Rate Limiting (Sync Trigger)
- [ ] Em 1 minuto, fazer 5 requisições GET `/api/sync/trigger`
- [ ] A 6ª requisição:
  - ❌ Status 429 (Too Many Requests)
  - ❌ Header: `Retry-After: 3600`

---

## 8️⃣ RELATÓRIOS (se implementados)

### Teste 8.1: Acessar Seção de Relatórios
- [ ] Clicar em "Relatórios" (se disponível)
- [ ] Verificar opções:
  - [ ] Relatório de Turnover
  - [ ] Relatório de Performance
  - [ ] Relatório de Recrutamento

---

## ✅ CHECKLIST FINAL

| Área | Teste | Status |
|------|-------|--------|
| Auth | Login com reset de senha obrigatório | [ ] |
| Auth | Toggle de visibilidade (CPF, Salário) | [ ] |
| RH | Campos de desligamento visíveis | [ ] |
| RH | Data formatada corretamente | [ ] |
| Vagas | Workflow de etapas funciona | [ ] |
| Performance | Abas de avaliação presentes | [ ] |
| Sync | Health check retorna status | [ ] |
| Sync | Logs sem PII em texto plano | [ ] |
| Security | Whitelist de emails funciona | [ ] |
| Security | Validação Zod nos endpoints | [ ] |
| Security | Rate limiting ativo | [ ] |

---

## 📝 NOTAS E OBSERVAÇÕES

**Erros encontrados durante testes:**
- [ ] (documentar aqui)

**Melhorias sugeridas:**
- [ ] (documentar aqui)

**Comportamentos inesperados:**
- [ ] (documentar aqui)

---

**Assinado por:** _______________  
**Data:** _______________  
**Conclusão:** Aplicação está pronta para produção? [ ] SIM [ ] NÃO
