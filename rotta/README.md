# Rotta: POC de priorização e roteirização de promotores

O Rotta mostra, na prática, a ideia central do TCC: **o gestor de trade marketing decide como a rota é priorizada**, ajustando pesos, e vê na hora o efeito no ranking de PDVs e na rota dos promotores.

A POC tem duas visões:

- **Gestor** (painel web): visão geral, rota e PDVs, promotores, ocorrências, perfis de priorização, cadastros e configurações.
- **Promotor** (app de campo simulado em `/promotor`): rota do dia, check-in, checklist e registro de ruptura.

Tudo roda no navegador, com dados fictícios fixos. Não há backend nem chamada a serviços externos.

## Como rodar

Requisito: Node.js 20.19 ou superior (ou 22.12+).

```bash
npm install
npm run dev
```

Abra http://localhost:5173. Para gerar a versão de produção: `npm run build` (e `npm run preview` para abri-la).

## Acessos

| Perfil   | E-mail             | Senha  |
|----------|--------------------|--------|
| Gestor   | gestor@rotta.com   | 123456 |
| Promotor | promotor@rotta.com | 123456 |

Na tela de login também há os botões **Entrar como Gestor** e **Entrar como Promotor**.

## Roteiro sugerido para a apresentação

1. Entre como **Gestor**. Na Visão geral, note as 3 rupturas críticas em aberto, cada uma com contador de SLA.
2. Abra **Perfis de priorização**. O perfil ativo é *Reação a Rupturas* (atendimento 35%, distância 15%, ruptura 30%, criticidade 20%). O Carrefour Vila Mariana está em **#4**.
3. Arraste o peso de **Histórico de ruptura** até **50%**. Os outros pesos se ajustam sozinhos para somar 100%. O ranking se reorganiza com animação: o Carrefour Vila Mariana sobe para **#1**, 10 PDVs mudam de posição e 2 passam a prioridade crítica. A rota do Diego também muda.
4. Clique em **Aplicar perfil** e confirme. A partir daí o dashboard e o app dos promotores usam o novo perfil.
5. Clique em **Ver rota no app do promotor** (ou use o menu do usuário, em *Ver como promotor*). A primeira parada do Diego agora é o Carrefour Vila Mariana, marcada como antecipada.
6. Toque em **Visitar PDV**, faça o **check-in**, use **Marcar todos** no checklist e vá em **Registrar ruptura**. Escolha criticidade **Crítica**, anexe a foto de exemplo e envie.
7. A tela de sucesso confirma *Gestor notificado* e *Alerta criado*. Use **Trocar para o Gestor**.
8. No painel, o contador de rupturas críticas sobe para 4, o alerta aparece com SLA de 30 minutos contando, e a ocorrência está em **Ocorrências**, onde dá para **Assumir** e **Resolver**.

Dica: abra o gestor numa aba e o promotor em outra. Os alertas chegam ao gestor assim que a ocorrência é enviada.

Para começar de novo, use **Restaurar dados da demonstração** (menu do usuário, Configurações ou aba Perfil do app).

## Como o score é calculado

Cada PDV recebe uma nota de 0 a 100:

```
score = Σ (variável normalizada × peso) / 100
```

| Variável                  | Escala usada           | Sentido                       |
|---------------------------|------------------------|-------------------------------|
| Tempo médio de atendimento | 10 a 60 min            | Maior tempo, maior prioridade |
| Distância da base         | 0 a 15 km              | Menor distância, maior prioridade |
| Histórico de ruptura      | 0 a 12 rupturas em 30 dias | Mais rupturas, maior prioridade |
| Criticidade estratégica   | 1 a 5                  | Maior criticidade, maior prioridade |

As escalas são fixas de propósito: incluir um PDV novo não muda a nota dos demais.

Níveis de prioridade: **Crítico** a partir de 72, **Alto** a partir de 58, **Médio** a partir de 45 e **Baixo** abaixo disso.

## Como a rota é definida

O **scoring define a prioridade** e a **roteirização define a sequência de visita**. A cada parada, o Rotta escolhe o PDV com maior valor de *score menos 1,5 ponto por km de deslocamento*. Saída às 08:00, 24 km/h de média, distância viária estimada em 1,3 vezes a linha reta. É uma heurística simples, suficiente para demonstrar o conceito; não é um otimizador completo de rotas.

## SLA das ocorrências

Crítica 30 min, Alta 60 min, Média 120 min e Baixa 240 min. Ruptura crítica gera alerta automático para o gestor.

## Estrutura do código

```
src/
  pages/       telas (login, dashboard, perfis, rota, ocorrências, app do promotor...)
  components/  peças de interface (ranking, mapa, sliders, tabelas, badges de SLA...)
  services/    regras de negócio: scoring, roteirização, ocorrências, dados e armazenamento
  data/        dados fictícios (PDVs, promotores, usuários)
  context/     estado da aplicação e avisos
  hooks/       cálculo do ranking, relógio dos contadores etc.
  types/       tipos do domínio
  utils/       normalização, distância, formatação
```

As regras de negócio ficam em `services/`, separadas das telas. Para ligar uma API real, basta trocar o corpo das funções de `services/dataService.ts` e `services/occurrenceService.ts`.

## Persistência

O estado (perfil aplicado, pesos, ocorrências, alertas e visitas) fica no `localStorage`, na chave `rotta:poc:v1`. O login fica por aba (`sessionStorage`), o que permite ter gestor e promotor abertos ao mesmo tempo.

## O que é simulado e limites da POC

- Sem backend, sem banco de dados, sem autenticação real.
- O mapa é uma ilustração em SVG (não usa Google Maps nem outro serviço).
- O check-in não usa GPS, e a foto pode ser a de exemplo ou um arquivo escolhido (reduzido a miniatura).
- Registrar uma ruptura não altera o histórico de ruptura usado no score.
- O cadastro de PDVs e promotores é somente leitura.

## Próximos passos naturais

API REST em Node.js e banco de dados, mapa e distâncias reais, otimizador de rotas completo (com janelas de horário e capacidade), histórico de rupturas alimentado pelas ocorrências e medição do impacto na jornada dos promotores.
