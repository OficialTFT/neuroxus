# Sessão 2 — Infraestrutura: GCP + Docker + ArangoDB

> **Documento de fechamento da sessão**
> Sprint 1 — Setup & Infraestrutura
> Data: 9 de Maio de 2026

---

## 1. Resumo da Implementação

### Adaptações em Relação ao Plano Original

O documento `sessoes-sprint.md` previa Oracle Cloud como provedor de nuvem. Como o usuário não conseguiu criar conta na Oracle, a infraestrutura foi adaptada para **Google Cloud Platform (GCP)**, plano free.

### Tarefas Executadas

| # | Tarefa | Status |
|---|--------|--------|
| 1.2.4 | Instalar Docker e Docker Compose | ✅ |
| 1.2.5 | Subir container ArangoDB 3.11 | ✅ |
| 1.2.7 | Configurar firewall (UFW + GCP VPC) | ✅ |
| 1.2.8 | Criar banco `knowledgebase` e usuário `app_user` | ✅ |
| 1.2.9 | Script de backup agendado no crontab | ✅ |

### Subtarefas Ignoradas (conforme instrução)

- **1.2.1** — Criar conta Oracle Cloud (ignorado)
- **1.2.2** — Provisionar VM ARM (ignorado — VM criada manualmente no GCP)
- **1.2.3** — Configurar acesso SSH (ignorado — já configurado)

### Tarefa Adiada

- **1.2.6** — Caddy + TLS (adiado por falta de domínio)

---

## 2. Infraestrutura Resultante

### VM — GCP

| Especificação | Valor |
|---------------|-------|
| **SO** | Ubuntu 26.04 LTS (Resolute Raccoon) |
| **Arquitetura** | x86_64 |
| **RAM** | 952 MB |
| **Swap** | 2 GB |
| **Disco** | 28 GB SSD (~26 GB livres) |
| **Usuário** | `miyake` |

### Docker

| Componente | Versão |
|------------|--------|
| Docker Engine | 29.4.3 |
| Docker Compose | 5.1.3 |

### ArangoDB

| Especificação | Valor |
|---------------|-------|
| **Imagem** | `arangodb:3.11` |
| **Versão** | 3.11.14 |
| **Container** | `arangodb` |
| **Porta** | 8529 |
| **Rede Docker** | `arango_default` |
| **Modo** | SINGLE (nó único) |
| **Limite de memória** | 400 MB |
| **Reinicialização** | `unless-stopped` |
| **Volumes** | `arango_data`, `arango_apps` (persistentes) |

### Banco de Dados

- **Banco:** `knowledgebase`
- **Usuário aplicação:** `app_user` (permissão RW no `knowledgebase`)
- **Usuário admin:** `root` (acesso total)

### Firewall

| Camada | Portas Liberadas |
|--------|------------------|
| **UFW (SO)** | 22/tcp (SSH), 8529/tcp (ArangoDB) |
| **GCP VPC Firewall** | 8529/tcp (regra `allow-arangodb`) |

### Backup

- **Script:** `/home/miyake/arango/backup-arango.sh`
- **Método:** Container temporário na rede `arango_default` executando `arangodump`
- **Agendamento:** Crontab — diariamente às 3:00 AM
- **Destino:** `/home/miyake/backups/arangodb/`
- **Retenção:** 7 dias (limpeza automática)
- **Último backup testado:** 318 bytes (banco vazio — funcional)

---

## 3. Decisões Técnicas

### 3.1. GCP vs Oracle Cloud

- **Motivo da mudança:** Oracle Cloud recusou o cadastro do usuário (cartão de crédito não aceito)
- **GCP escolhido:** Plano free com VM `e2-micro` (x86_64, 1 GB RAM) — suficiente para ArangoDB em desenvolvimento
- **Consequência:** Oracle Cloud oferecia VM ARM com 4 OCPUs/24 GB RAM gratuitamente; GCP free tem recursos mais limitados (952 MB RAM), exigindo swap e limite de memória no container

### 3.2. Limite de Memória no Container

- **Problema:** VM GCP tem apenas 952 MB RAM; ArangoDB pode consumir mais que isso em operações intensivas
- **Solução:** `mem_limit: 400m` no `docker-compose.yml` + 2 GB de swap
- **Trade-off:** ArangoDB pode ficar mais lento em operações pesadas, mas a VM não irá travar

### 3.3. Swap de 2 GB

- **Motivo:** GCP free não permite aumentar RAM; swap é a única forma de lidar com picos de memória
- **Arquivo:** `/swapfile` com permissão `600`
- **Ativação:** `swapon` — ativo até próxima reinicialização (não configurado em `/etc/fstab` — pode ser necessário depois)

### 3.4. Método de Backup

- **Problema:** `arangodump` executado dentro do container (`docker exec`) falhou com erro de permissão nos arquivos gerados
- **Solução:** Container temporário (`docker run --rm`) na mesma rede com `--user $(id -u):$(id -g)` para que os arquivos sejam criados com o usuário `miyake`
- **Por que `--network arango_default`?** O container temporário precisa acessar o container do ArangoDB pelo nome do serviço (`arangodb`), o que só funciona na mesma rede Docker

### 3.5. Caddy/TLS Adiado

- **Motivo:** Exige domínio apontado para o IP da VM
- **Impacto:** ArangoDB acessível apenas via HTTP (sem criptografia)
- **Uso atual:** Acesso local ou via SSH tunnel; em produção futura, será necessário domínio + Caddy

---

## 4. Conceitos Praticados

### 4.1. Infraestrutura como Código (IaC) com Docker Compose

O arquivo `docker-compose.yml` documenta toda a configuração do ArangoDB de forma declarativa e reprodutível:

- **Imagem e versão** explicitamente definidas
- **Volumes nomeados** para persistência de dados
- **Política de restart** (`unless-stopped`)
- **Limite de recursos** (`mem_limit`)

### 4.2. Firewall em Camadas (Defesa em Profundidade)

| Camada | Ferramenta | O que protege |
|--------|-----------|---------------|
| Provedor de nuvem | GCP VPC Firewall Rules | Tráfego externo antes de chegar à VM |
| Sistema Operacional | UFW (Uncomplicated Firewall) | Tráfego dentro da VM |
| Aplicação | Docker (portas expostas) | Acesso ao container individual |

### 4.3. Volumes Docker e Persistência

- **Volumes nomeados** (`arango_data`, `arango_apps`) são gerenciados pelo Docker (`docker volume ls`)
- Diferente de *bind mounts*, volumes nomeados são independentes da estrutura de diretórios do host
- Sem volumes, os dados do banco seriam perdidos ao reiniciar o container

### 4.4. Backup com Container Ephemeral

- Container temporário (`--rm`) para executar `arangodump`
- Mesma rede Docker (`--network arango_default`) para comunicação via nome do serviço (`arangodb`)
- UID mapping (`--user`) para permissões corretas no volume montado
- Retenção automática com `find ... -mtime +$RETENTION_DAYS -delete`

---

## 5. Pontos de Melhoria Identificados

- **Persistência do swap:** O `/swapfile` foi ativado manualmente com `swapon`, mas não persiste após reinicialização. Adicionar ao `/etc/fstab` se a VM for reiniciada frequentemente
- **Firewall mais restrito:** Atualmente `8529` está aberta para `0.0.0.0/0` (qualquer IP). Idealmente, restringir ao IP fixo do usuário através de `--source-ranges=SEU.IP/32`
- **Caddy/TLS pendente:** Assim que houver um domínio, configurar proxy reverso para acesso criptografado ao ArangoDB
- **Monitoramento:** Sem Caddy, não há health check externo. Um script simples de ping no ArangoDB pode ser útil

---

## 6. Sugestões de Estudo Complementar

- **Docker Compose oficial** — `docs.docker.com/compose`
- **ArangoDB Docker** — `hub.docker.com/_/arangodb`
- **UFW (Uncomplicated Firewall)** — `wiki.ubuntu.com/UncomplicatedFirewall`
- **GCP VPC Firewall** — `cloud.google.com/firewall/docs`
- **Padrão Container Ephemeral para Backup** — bora praticar padrões de infraestrutura com containers temporários
- **Linux Swap** — `linux.die.net/man/8/swapon`

---

## 7. Checklist da Sessão

- [x] Todo o código implementado foi explicado ao usuário?
- [x] As decisões técnicas foram documentadas?
- [ ] Os testes foram escritos e os resultados explicados? *(não aplicável — sessão de infraestrutura)*
- [x] O usuário compreendeu os conceitos praticados?
- [ ] O arquivo LEARNING.md foi atualizado? *(a ser criado quando houver conteúdo consolidado)*
- [x] Os commits foram feitos com mensagens semânticas?
- [x] O código está sem warnings ou erros de linting?
- [x] Foram indicadas fontes para estudo complementar?
- [x] A sessão foi resumida com pontos de aprendizado?
- [x] O diretório e o arquivo de requisitos foram criados no início da sessão?
- [x] O arquivo de documentação final da sessão foi gerado ao final?
- [ ] O arquivo `docs/sprint/1/sessoes-sprint.md` foi atualizado com o progresso da sprint?
- [x] O próximo passo foi definido para a próxima sessão?

---

## 8. Próximos Passos

- **Sessão 3 (1.3):** Conexão Backend ↔ Banco de Dados
  - Implementar `server/utils/arango.ts` (singleton de conexão)
  - Configurar variáveis de ambiente no `.env`
  - Criar rota `GET /api/health`
  - Script de migração inicial (coleções e arestas)
  - Docker Compose local para desenvolvimento

---

*Documento gerado em: 9 de Maio de 2026*
*Versão: 1.0*