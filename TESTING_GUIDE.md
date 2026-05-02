# Guia de Testes End-to-End - Venice BP Hub

## 🚀 Preparação do Ambiente

### 1. Verificar Docker (Obrigatório)
```bash
docker --version
docker-compose --version
```

### 2. Iniciar PostgreSQL Localmente
```bash
docker-compose up -d postgres
# Aguardar healthcheck passar (pode levar ~30s)
docker-compose ps
```

### 3. Configurar Banco de Dados
```bash
# Aplicar migrações Prisma
npx prisma migrate deploy

# Popular com dados de teste
npx prisma db seed
```

### 4. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
# App estará disponível em http://localhost:3000
```

---

## 🧪 Executar Testes

### Opção A: Testes Manuais (Recomendado para UX)
1. Abrir [http://localhost:3000/login](http://localhost:3000/login)
2. Seguir o **TEST_PLAN.md** na raiz do projeto
3. Documentar resultados no arquivo

### Opção B: Testes Automatizados
```bash
npm test
# Executa testes unitários e de integração
```

---

## 🔐 Credenciais de Teste

| Email | Senha Padrão | Primeira Ação |
|-------|----------|---|
| diego.caporusso@venicetech.com.br | Venice@BP2026 | Forçado a redefinir senha |
| leticia.almeida@venicetech.com.br | Venice@BP2026 | Forçado a redefinir senha |
| lucas.rodrigues@venicetech.com.br | Venice@BP2026 | Forçado a redefinir senha |
| graziele.silva@venicetech.com.br | Venice@BP2026 | Forçado a redefinir senha |

> **⚠️ IMPORTANTE:** Nenhuma outra conta pode acessar o sistema (whitelist ativa).

---

## 📋 Checklist de Funcionalidades

### ✅ Autenticação
- [ ] Login com email/senha
- [ ] Reset de senha no primeiro acesso (obrigatório)
- [ ] Logout
- [ ] Whitelist de emails (rejeita não autorizados)

### ✅ Dashboard
- [ ] Menu lateral com navegação
- [ ] Cards KPI carregando corretamente
- [ ] Breadcrumb/titulo dinâmico

### ✅ Colaboradores
- [ ] Lista carrega com dados do seed
- [ ] Drawer de detalhes abre
- [ ] Campos de RH visíveis:
  - Nome, Cargo, Status, Torre, Squad
  - Email, Telefone, LinkedIn
  - Data de Admissão, Data de Nascimento
  - **CPF com toggle de visibilidade** (novo)
  - **Salário com toggle de visibilidade** (novo)
  - **Data de Desligamento** (se aplicável)

### ✅ Vagas
- [ ] Lista de vagas carrega
- [ ] Detalhe de vaga abre
- [ ] Checklist de etapa funciona
- [ ] Candidatos associados listam

### ✅ Performance
- [ ] Abas de avaliação presentes (Auto, PDI, PIP)
- [ ] Ciclos de performance listam
- [ ] Status de ciclo exibe corretamente

### ✅ Sincronização
- [ ] Health check retorna status
- [ ] Logs de sincronização acessíveis
- [ ] Nenhuma PII exposta em logs (CPF mascarado, etc)

### ✅ Segurança
- [ ] Validação Zod em endpoints
- [ ] Rate limiting ativo
- [ ] Senhas não aparecem em logs
- [ ] Tokens não armazenados no localStorage

---

## 🐛 Troubleshooting

### Docker não conecta ao banco
```bash
# Verificar logs
docker-compose logs postgres

# Reiniciar
docker-compose down -v
docker-compose up -d postgres
```

### Migração falha
```bash
# Reset completo (⚠️ deleta dados)
npx prisma migrate reset --force

# Depois
npx prisma db seed
```

### Porta 3000 já em uso
```bash
npm run dev -- -p 3001
# App acessível em http://localhost:3001
```

### Erro de `password_changed_at`
Se receber erro sobre coluna não encontrada:
```bash
npx prisma migrate deploy
npx prisma generate
npm run dev
```

---

## 📊 Relatório de Testes

Ao terminar, preencha o `TEST_PLAN.md` com:
- ✅ Testes que passaram
- ❌ Testes que falharam
- 🐛 Bugs encontrados
- 💡 Melhorias sugeridas

---

## 🛑 Parar Ambiente

```bash
# Parar servidor dev
Ctrl+C

# Parar Docker
docker-compose down

# Reset completo (deleta dados)
docker-compose down -v
```

---

**Última atualização:** 2026-05-02  
**Mantido por:** Claude Code  
**Status:** ✅ Pronto para testes
