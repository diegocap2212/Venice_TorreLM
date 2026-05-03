# Fluxo de Integração Venice ↔ Bizneo

## 📊 Arquitetura Atual (Venice)

```
┌─────────────────────────────────────────────────────────────┐
│                    PIPELINE DE RECRUTAMENTO                 │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   VAGA (Vaga)    │    │ CANDIDATO        │    │ VAGA_CANDIDATO   │
│                  │    │                  │    │                  │
│ - id             │    │ - id             │    │ - vaga_id        │
│ - titulo         │◄───┤ - nome           │    │ - candidato_id   │
│ - status         │    │ - email          │    │ - status         │
│ - etapa_atual    │    │ - cpf_hash       │    │                  │
│ - bizneo_link    │    │ - linkedin       │    │ (relacionamento) │
│ - responsavel    │    │ - status_cpf     │    │                  │
│                  │    │                  │    │                  │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

## 🔄 Fluxo Atual (SEM Bizneo)

```
1. CREATE VAGA em Venice
   ↓
2. CREATE CANDIDATO em Venice (manual ou importado)
   ↓
3. VINCULAR Candidato → Vaga
   ↓
4. VALIDAR CPF do Candidato
   ↓
5. UPDATE status do Candidato na Vaga
   ↓
6. Avançar etapa da Vaga (REQUISIÇÃO → RECRUTAMENTO → ...)
```

---

## ✨ Novo Fluxo COM Bizneo (Integrado)

```
INÍCIO: Vaga aberta em Venice
│
├─ 1️⃣  CREATE VAGA em Venice
│       └─ Salva: titulo, squad, responsavel
│
├─ 2️⃣  ADICIONAR BIZNEO LINK à Vaga
│       └─ Copia link da vaga do Bizneo para Venice
│       └─ Campo já existe: vaga.bizneo_link
│
├─ 3️⃣  SINCRONIZAR CANDIDATOS DO BIZNEO
│       ├─ Filtrar por TAG: "venice" (ou squad específico)
│       ├─ Puxar: nome, email, cv_link
│       └─ Criar em Venice:
│           └─ nome, email, bizneo_cv_url (NOVO CAMPO)
│
├─ 4️⃣  GERAR CV LINK COMPARTILHÁVEL
│       └─ Bizneo oferece: generateCVLink(candidato_id)
│       └─ Salvar em Venice: candidato.bizneo_cv_url
│
├─ 5️⃣  VINCULAR CANDIDATO À VAGA
│       └─ Usa função existente: vincularCandidatoVaga()
│
├─ 6️⃣  ATUALIZAR STATUS DO CANDIDATO
│       └─ Usar função existente: updateVagaCandidatoStatus()
│
└─ 7️⃣  AVANÇAR ETAPA DA VAGA
        └─ Usar função existente: updateVagaEtapa()
```

---

## 🔌 Novos Endpoints Necessários

### 1. GET `/api/bizneo/candidates?tag=venice`
**Puxa candidatos do Bizneo filtrados por tag**

```typescript
// Response
[
  {
    id: "bizneo_123",
    name: "João Silva",
    email: "joao@example.com",
    tags: ["venice", "frontend"]
  }
]
```

### 2. POST `/api/bizneo/cv-link`
**Gera link compartilhável de CV**

```typescript
// Request
{ bizneo_candidate_id: "bizneo_123" }

// Response
{ cv_url: "https://bizneo.com/cv/share/abc123def" }
```

### 3. POST `/api/candidates/from-bizneo`
**Cria candidato em Venice com referência a Bizneo**

```typescript
// Request
{
  bizneo_id: "bizneo_123",
  name: "João Silva",
  email: "joao@example.com",
  bizneo_cv_url: "https://bizneo.com/cv/share/abc123def",
  vaga_id: "vaga_456"
}

// Response
{ candidato_id: "venice_789", success: true }
```

---

## 🗄️ Mudanças no Schema Prisma

### Campo Novo em `Candidato`

```prisma
model Candidato {
  // ... campos existentes
  
  // NOVO: Referência ao Bizneo
  bizneo_id         String?      // ID do candidato no Bizneo
  bizneo_cv_url     String?      // Link do CV compartilhável
  
  // ... resto dos campos
}
```

---

## 📋 Fluxo Detalhado de Ações

### Cenário 1: Candidato do Bizneo entra em uma Vaga

```
1. BP acessa vaga em Venice
   ↓
2. Clica: "Importar Candidatos do Bizneo" (novo botão)
   ↓
3. Sistema pede: "Qual TAG?" (ex: "venice", "frontend")
   ↓
4. API GET /api/bizneo/candidates?tag=venice
   ├─ Retorna lista de candidatos
   ├─ Para cada um: gera CV link via /api/bizneo/cv-link
   └─ Salva em Venice com: candidato.bizneo_id + candidato.bizneo_cv_url
   ↓
5. Candidatos aparecem na tabela da vaga
   ├─ Nome (do Bizneo)
   ├─ Email (do Bizneo)
   ├─ CV Link (compartilhável)
   └─ Ações: Vincular, Validar CPF, Descartar
   ↓
6. BP clica em "Vincular" na vaga específica
   └─ Função existente: vincularCandidatoVaga()
   ↓
7. Candidato aparece em: vaga → candidatos
```

### Cenário 2: Avançar Candidato na Vaga

```
1. BP vê candidato com status "EM_PROCESSO"
   ↓
2. Após entrevista, clica "Aprovado"
   ↓
3. Função: updateVagaCandidatoStatus(vaga_id, candidato_id, "APROVADO")
   ↓
4. Status muda em Venice (sem sincronizar com Bizneo - API não permite)
   ↓
5. CV Link fica disponível para baixar/compartilhar
```

---

## 🎯 Diferenças: Fluxo Antigo vs Novo

| Aspecto | ANTES (Manual) | DEPOIS (Bizneo) |
|---------|---|---|
| **Importar Candidatos** | Copy/paste manual | Busca automática por TAG |
| **CV do Candidato** | Link externo | Link compartilhável do Bizneo |
| **Validação CPF** | Manual | Manual (não mudou) |
| **Vinculação** | Manual | Manual (função existente) |
| **Status de Candidato** | Manual | Manual (função existente) |
| **Sincronização Voltar** | Não existe | Não será implementado (API limitada) |

---

## ✅ O Que Já Existe em Venice

- ✅ `createCandidato()` - Criar candidato
- ✅ `vincularCandidatoVaga()` - Vincular a vaga
- ✅ `updateVagaCandidatoStatus()` - Mudar status
- ✅ `updateBizneoLink()` - Adicionar link do Bizneo na vaga
- ✅ `validateCPF()` - Validar CPF
- ✅ Prisma model `Candidato` com campo `email`, `linkedin`

---

## ❌ O Que Precisa Implementar

- ❌ Campo `bizneo_id` em `Candidato` (novo)
- ❌ Campo `bizneo_cv_url` em `Candidato` (novo)
- ❌ API: `GET /api/bizneo/candidates?tag=...` (novo)
- ❌ API: `POST /api/bizneo/cv-link` (novo)
- ❌ API: `POST /api/candidates/from-bizneo` (novo)
- ❌ UI: Botão "Importar do Bizneo" na vaga (novo)
- ❌ UI: Tabela de candidatos do Bizneo (novo)
- ❌ Migration Prisma para novos campos (novo)
- ❌ Classe/Service para autenticar com Bizneo (novo)

---

## 🔐 Autenticação com Bizneo

**Problema:** Bizneo AI disse que a API não tem credenciais documentadas.

**Soluções:**
1. **Contatar Bizneo** para obter API Key/Secret
2. **Usar Bizneo URL diretamente** (se houver endpoint público)
3. **Scraping (último recurso)** - Se Bizneo não oferecer API autenticada

---

## 📝 Resumo das Mudanças

```
BANCO DE DADOS
└─ Adicionar 2 campos em Candidato:
   ├─ bizneo_id: String?
   └─ bizneo_cv_url: String?

APIs
└─ 3 novos endpoints para integração Bizneo

UI
└─ Botão "Importar do Bizneo" em cada vaga
└─ Tabela de candidatos do Bizneo

Funções
└─ Reutilizar funções existentes (vincular, status, etc)
```

---

## 🗄️ Schema Design - Bizneo Integration (DESIGN APPROVED)

### Motivation
Bizneo oferece 2 funcionalidades: **Filtrar por tags** + **Gerar CV links**.  
Para replicar isso em Venice, precisamos armazenar referências Bizneo + tags em candidatos.

### Schema Changes (PENDING IMPLEMENTATION)

**Candidato model enhancement:**
```prisma
model Candidato {
  // ... existing fields ...
  
  // NEW: Bizneo Integration (3 fields)
  bizneo_id       String?        // ID do candidato no Bizneo (para linking)
  bizneo_cv_url   String?        // CV link compartilhável do Bizneo
  tags            String[]       // JSON array: ["venice", "frontend", "senioridade-jr"]
  
  // ... relationships remain same ...
}
```

### Prisma Migration (PENDING)
```sql
-- Executar após aprovação:
ALTER TABLE "Candidato" 
ADD COLUMN "bizneo_id" TEXT,
ADD COLUMN "bizneo_cv_url" TEXT,
ADD COLUMN "tags" JSONB DEFAULT '[]';

CREATE UNIQUE INDEX "Candidato_bizneo_id_key" ON "Candidato"("bizneo_id");
```

### API Changes (PENDING)
```typescript
// src/app/actions/candidato-actions.ts

// 1. Filter by tag
export async function getCandidatosByTag(tag: string): Promise<Candidato[]>

// 2. Create with Bizneo reference
export async function createCandidatoFromBizneo(input: {
  bizneo_id: string
  nome: string
  email: string
  bizneo_cv_url: string
  tags: string[]
  vaga_id?: string
}): Promise<Candidato>

// 3. Add/remove tags
export async function addTagsToCandidato(candidato_id: string, tags: string[]): Promise<void>
```

### UI Changes (PENDING)
```typescript
// Component: candidatos-list.tsx - Add column:
<TableCell>
  {candidato.tags?.map(tag => (
    <Badge key={tag} variant="outline">{tag}</Badge>
  ))}
</TableCell>

// Add filter:
<Select>
  <SelectTrigger>Filter by tag</SelectTrigger>
  <SelectContent>
    {allTags.map(tag => (
      <SelectItem value={tag}>{tag}</SelectItem>
    ))}
  </SelectContent>
</Select>

// Add CV link display (separate from linkedin):
{candidato.bizneo_cv_url && (
  <a href={candidato.bizneo_cv_url} target="_blank">
    <ExternalLink className="w-4 h-4" />
    CV Bizneo
  </a>
)}
```

### Testing Strategy (PENDING)
- [ ] Create candidato with tags
- [ ] Filter by tag works
- [ ] CV link displays correctly
- [ ] Bizneo ID prevents duplicates (unique index)
- [ ] Tags persist on update

---

## 🚀 Próximas Etapas

**1. Você concorda com esse fluxo?**

**2. Temos as credenciais do Bizneo API?** (ou sabemos como conseguir)

**3. Quer que eu implemente:**
   - [ ] Migration + campos novos?
   - [ ] APIs de integração?
   - [ ] UI com botão "Importar"?
   - [ ] Tudo junto?

Qual é o próximo passo? 🎯
